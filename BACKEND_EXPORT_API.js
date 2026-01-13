/**
 * BACKEND EXPORT API - Admin Only
 * 
 * This file documents how to set up backend-only data export functionality.
 * Exports are restricted to authenticated admin users only.
 * 
 * Firebase Cloud Functions Setup Required
 */

// ============================================================================
// FIREBASE CLOUD FUNCTION - export-issues.js
// ============================================================================
// Deploy with: firebase deploy --only functions
//
// functions/export-issues.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const storage = admin.storage();
const firestore = admin.firestore();

// Verify user is admin
async function verifyAdmin(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    
    const userDoc = await firestore.collection('users').doc(context.auth.uid).get();
    if (!userDoc.data()?.isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    
    return context.auth.uid;
}

/**
 * Export all issues to Excel with precise location coordinates
 * Includes: ID, Type, Location, Lat/Lon, Description, Severity, Status, Reporter, Created Date
 */
exports.exportIssuesToExcel = functions.https.onCall(async (data, context) => {
    try {
        await verifyAdmin(context);
        
        const snapshot = await firestore.collection('issues').get();
        const issues = snapshot.docs.map(doc => {
            const issue = doc.data();
            return {
                'Issue ID': doc.id,
                'Type': issue.type,
                'Location Name': issue.location,
                'Latitude': issue.latitude || 'N/A',
                'Longitude': issue.longitude || 'N/A',
                'Precise Location': `${issue.latitude}, ${issue.longitude}`,
                'Description': issue.description,
                'Severity': issue.severity,
                'Status': issue.status,
                'Reporter': issue.reporter || 'Anonymous',
                'Created Date': new Date(issue.createdAt).toISOString(),
                'Updated Date': new Date(issue.updatedAt || issue.createdAt).toISOString(),
                'Building/Campus': issue.building || '',
                'Floor': issue.floor || '',
                'Accessibility Impact': issue.accessibilityImpact || '',
                'Photos': issue.photoUrls ? issue.photoUrls.join('; ') : 'None',
                'Comments': issue.comments || ''
            };
        });

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Issues Report');

        // Add headers
        if (issues.length > 0) {
            worksheet.columns = Object.keys(issues[0]).map(key => ({
                header: key,
                key: key,
                width: 15
            }));

            // Add data rows
            issues.forEach(issue => {
                worksheet.addRow(issue);
            });

            // Style header row
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF366092' }
            };

            // Auto-fit columns
            worksheet.columns.forEach(column => {
                column.width = Math.min(20, column.header.length + 2);
            });
        }

        // Add metadata sheet
        const metaSheet = workbook.addWorksheet('Metadata');
        metaSheet.addRow(['Export Date', new Date().toISOString()]);
        metaSheet.addRow(['Total Issues', issues.length]);
        metaSheet.addRow(['Exported By', context.auth.uid]);
        metaSheet.addRow(['Contains Precise Locations', 'YES']);

        // Convert to buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Upload to Cloud Storage
        const bucket = storage.bucket();
        const filename = `exports/issues_${Date.now()}.xlsx`;
        const file = bucket.file(filename);

        await file.save(buffer, {
            metadata: {
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                metadata: {
                    exportedAt: new Date().toISOString(),
                    exportedBy: context.auth.uid
                }
            }
        });

        // Generate download URL (valid for 24 hours)
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        return {
            success: true,
            downloadUrl: url,
            filename: filename,
            itemCount: issues.length,
            exportedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error('Export error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Export issues to CSV format with precise coordinates
 */
exports.exportIssuesToCSV = functions.https.onCall(async (data, context) => {
    try {
        await verifyAdmin(context);
        
        const snapshot = await firestore.collection('issues').get();
        const issues = snapshot.docs.map(doc => {
            const issue = doc.data();
            return {
                issueId: doc.id,
                type: issue.type,
                location: issue.location,
                latitude: issue.latitude || '',
                longitude: issue.longitude || '',
                preciseLocation: `${issue.latitude}, ${issue.longitude}`,
                description: issue.description,
                severity: issue.severity,
                status: issue.status,
                reporter: issue.reporter || 'Anonymous',
                createdDate: new Date(issue.createdAt).toISOString(),
                building: issue.building || '',
                accessibilityImpact: issue.accessibilityImpact || ''
            };
        });

        // Convert to CSV
        const parser = new Parser();
        const csv = parser.parse(issues);

        // Upload to Cloud Storage
        const bucket = storage.bucket();
        const filename = `exports/issues_${Date.now()}.csv`;
        const file = bucket.file(filename);

        await file.save(csv, {
            metadata: {
                contentType: 'text/csv',
            }
        });

        // Generate download URL
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000,
        });

        return {
            success: true,
            downloadUrl: url,
            filename: filename,
            itemCount: issues.length,
            format: 'CSV'
        };

    } catch (error) {
        console.error('CSV export error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * Export analytics summary with location-based breakdown
 */
exports.exportAnalyticsSummary = functions.https.onCall(async (data, context) => {
    try {
        await verifyAdmin(context);
        
        const snapshot = await firestore.collection('issues').get();
        const issues = snapshot.docs.map(doc => doc.data());

        // Calculate analytics
        const analytics = {
            totalIssues: issues.length,
            byType: {},
            bySeverity: {},
            byStatus: {},
            byLocation: {},
            avgResolutionTime: 0,
            reportedLocations: []
        };

        issues.forEach(issue => {
            // Count by type
            analytics.byType[issue.type] = (analytics.byType[issue.type] || 0) + 1;

            // Count by severity
            analytics.bySeverity[issue.severity] = (analytics.bySeverity[issue.severity] || 0) + 1;

            // Count by status
            analytics.byStatus[issue.status] = (analytics.byStatus[issue.status] || 0) + 1;

            // Count by location with coordinates
            const locKey = `${issue.location} (${issue.latitude}, ${issue.longitude})`;
            analytics.byLocation[locKey] = (analytics.byLocation[locKey] || 0) + 1;

            // Track unique report locations
            if (issue.latitude && issue.longitude) {
                analytics.reportedLocations.push({
                    location: issue.location,
                    latitude: issue.latitude,
                    longitude: issue.longitude,
                    type: issue.type,
                    severity: issue.severity
                });
            }
        });

        // Generate JSON
        const json = JSON.stringify(analytics, null, 2);

        // Upload to Cloud Storage
        const bucket = storage.bucket();
        const filename = `exports/analytics_${Date.now()}.json`;
        const file = bucket.file(filename);

        await file.save(json, {
            metadata: {
                contentType: 'application/json',
            }
        });

        // Generate download URL
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000,
        });

        return {
            success: true,
            downloadUrl: url,
            filename: filename,
            analytics: analytics,
            preciseLocationsIncluded: true
        };

    } catch (error) {
        console.error('Analytics export error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// ============================================================================
// CLIENT-SIDE - ADMIN PANEL (secure-admin.html or admin.js)
// ============================================================================
//
// Call these functions from admin dashboard only:

async function exportDataAsAdmin(format = 'excel') {
    const functions = firebase.functions();
    
    try {
        let result;
        
        if (format === 'excel') {
            result = await functions.httpsCallable('exportIssuesToExcel')();
        } else if (format === 'csv') {
            result = await functions.httpsCallable('exportIssuesToCSV')();
        } else if (format === 'analytics') {
            result = await functions.httpsCallable('exportAnalyticsSummary')();
        }
        
        // Download the file
        if (result.data.downloadUrl) {
            window.location.href = result.data.downloadUrl;
            console.log(`✅ Export successful: ${result.data.filename}`);
        }
        
    } catch (error) {
        console.error(`Export error: ${error.message}`);
        alert(`Export failed: ${error.message}`);
    }
}

// ============================================================================
// DEPLOYMENT INSTRUCTIONS
// ============================================================================
//
// 1. Install dependencies in functions folder:
//    cd functions
//    npm install exceljs json2csv
//
// 2. Update functions/index.js to include exports above
//
// 3. Deploy functions:
//    firebase deploy --only functions
//
// 4. Test from admin panel - call:
//    exportDataAsAdmin('excel')
//    exportDataAsAdmin('csv')
//    exportDataAsAdmin('analytics')
//
// 5. Firestore Rules for admin access:
//    match /exports/{document=**} {
//        allow read, write: if request.auth.uid != null && 
//                             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
//    }

