/**
 * Firebase Cloud Functions - Smart Campus Access Map
 * 
 * Deploy these functions to Firebase to enable:
 * - Email alerts to maintenance teams
 * - SMS notifications for urgent issues
 * - Automatic analytics aggregation
 * 
 * Setup:
 * 1. Install Firebase Tools: npm install -g firebase-tools
 * 2. Init functions: firebase init functions
 * 3. Copy this code to: functions/index.js
 * 4. npm install nodemailer twilio
 * 5. firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

admin.initializeApp();
const db = admin.firestore();

// Configure email (Gmail or SendGrid)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().email.user,
        pass: functions.config().email.password
    }
});

// Configure SMS (Twilio)
const twilioAccountSid = functions.config().twilio.account_sid;
const twilioAuthToken = functions.config().twilio.auth_token;
const twilioPhoneNumber = functions.config().twilio.phone_number;
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

/**
 * Trigger when a new issue is reported
 * Send email alert to maintenance team
 */
exports.sendEmailAlertOnNewIssue = functions.firestore
    .document('issues/{issueId}')
    .onCreate(async (snap, context) => {
        const issue = snap.data();
        const issueId = context.params.issueId;

        console.log('📬 New issue reported:', issueId);

        try {
            // Get maintenance team emails
            const maintenanceSnapshot = await db
                .collection('users')
                .where('role', '==', 'maintenance')
                .get();

            const recipients = [];
            maintenanceSnapshot.forEach(doc => {
                if (doc.data().email) {
                    recipients.push(doc.data().email);
                }
            });

            if (recipients.length === 0) {
                console.log('No maintenance team emails configured');
                return;
            }

            // Format issue severity for color coding
            const severityColor = {
                high: '#dc3545',
                medium: '#ffc107',
                low: '#28a745'
            };

            // Create email HTML
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2>🚨 New Accessibility Issue Reported</h2>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background-color: ${severityColor[issue.severity] || '#007bff'}; color: white;">
                            <td style="padding: 10px;"><strong>SEVERITY</strong></td>
                            <td style="padding: 10px;">${issue.severity.toUpperCase()}</td>
                        </tr>
                        <tr style="background-color: #f5f5f5;">
                            <td style="padding: 10px;"><strong>TYPE</strong></td>
                            <td style="padding: 10px;">${issue.type}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>LOCATION</strong></td>
                            <td style="padding: 10px;">${issue.location}</td>
                        </tr>
                        <tr style="background-color: #f5f5f5;">
                            <td style="padding: 10px;"><strong>COORDINATES</strong></td>
                            <td style="padding: 10px;">${issue.latitude}, ${issue.longitude}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>DESCRIPTION</strong></td>
                            <td style="padding: 10px;">${issue.description}</td>
                        </tr>
                        <tr style="background-color: #f5f5f5;">
                            <td style="padding: 10px;"><strong>REPORTED BY</strong></td>
                            <td style="padding: 10px;">${issue.reportedBy || 'Anonymous'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>TIME</strong></td>
                            <td style="padding: 10px;">${new Date(issue.createdAt.toDate()).toLocaleString()}</td>
                        </tr>
                    </table>

                    <div style="margin-top: 20px; padding: 15px; background-color: #e8f4f8; border-left: 4px solid #007bff;">
                        <p><strong>Required Action:</strong></p>
                        <ol>
                            <li>Review the issue details above</li>
                            <li>Visit the <a href="https://your-app.firebaseapp.com">Smart Campus Access Map</a></li>
                            <li>Update the status to "In Progress" when you start working on it</li>
                            <li>Mark as "Resolved" when complete</li>
                        </ol>
                    </div>

                    <div style="margin-top: 20px; font-size: 12px; color: #666;">
                        <p>Issue ID: ${issueId}</p>
                        <p>This is an automated message from Smart Campus Access Map</p>
                    </div>
                </div>
            `;

            // Send email
            await transporter.sendMail({
                from: functions.config().email.user,
                to: recipients.join(','),
                subject: `🔴 ${issue.severity.toUpperCase()}: New Accessibility Issue - ${issue.type}`,
                html: emailHtml
            });

            console.log(`✅ Email sent to ${recipients.length} maintenance staff`);
            
            // Store notification record
            await db.collection('notifications').add({
                type: 'email_sent',
                issueId: issueId,
                recipients: recipients,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error('Error sending email:', error);
            // Don't throw - function should continue
        }
    });

/**
 * Send SMS alert for HIGH severity issues only
 */
exports.sendSMSAlertOnHighSeverityIssue = functions.firestore
    .document('issues/{issueId}')
    .onCreate(async (snap, context) => {
        const issue = snap.data();
        const issueId = context.params.issueId;

        // Only alert on HIGH severity
        if (issue.severity !== 'high') {
            return;
        }

        console.log('📱 High severity issue - sending SMS');

        try {
            // Get maintenance team phone numbers
            const maintenanceSnapshot = await db
                .collection('users')
                .where('role', '==', 'maintenance')
                .where('enableSmsAlerts', '==', true)
                .get();

            // Send SMS to each team member
            for (const doc of maintenanceSnapshot.docs) {
                const phoneNumber = doc.data().phoneNumber;
                if (!phoneNumber) continue;

                const message = `🚨 URGENT: ${issue.type} at ${issue.location}. Severity: HIGH. Check Smart Campus Access Map for details.`;

                try {
                    await twilioClient.messages.create({
                        body: message,
                        from: twilioPhoneNumber,
                        to: phoneNumber
                    });

                    console.log(`✅ SMS sent to ${phoneNumber}`);
                } catch (error) {
                    console.error(`Failed to send SMS to ${phoneNumber}:`, error);
                }
            }

        } catch (error) {
            console.error('Error sending SMS alerts:', error);
        }
    });

/**
 * Update issue when status changes
 * Send email confirmation and audit trail
 */
exports.onIssueStatusChange = functions.firestore
    .document('issues/{issueId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const issueId = context.params.issueId;

        // Check if status changed
        if (before.status === after.status) {
            return;
        }

        console.log(`📍 Issue ${issueId} status: ${before.status} → ${after.status}`);

        try {
            // Create audit entry
            await db.collection('auditLog').add({
                issueId: issueId,
                action: 'status_changed',
                from: before.status,
                to: after.status,
                notes: after.notes || '',
                changedBy: after.changedBy || 'System',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            // Send confirmation email to reporter
            if (after.status === 'resolved') {
                const reporterEmail = after.reporterEmail;
                if (reporterEmail) {
                    const emailHtml = `
                        <div style="font-family: Arial, sans-serif;">
                            <h2>✅ Your Issue Has Been Resolved!</h2>
                            <p>Thank you for reporting: <strong>${after.type}</strong></p>
                            <p>Location: <strong>${after.location}</strong></p>
                            <p>Your issue has been marked as resolved. We appreciate your help in improving campus accessibility!</p>
                            <p style="color: #666; font-size: 12px; margin-top: 20px;">
                                Issue ID: ${issueId}
                            </p>
                        </div>
                    `;

                    await transporter.sendMail({
                        from: functions.config().email.user,
                        to: reporterEmail,
                        subject: '✅ Your Accessibility Report - RESOLVED',
                        html: emailHtml
                    });

                    console.log(`✅ Resolution confirmation sent to ${reporterEmail}`);
                }
            }

        } catch (error) {
            console.error('Error handling status change:', error);
        }
    });

/**
 * Aggregate analytics daily
 * Computes response times, resolution rates, etc.
 */
exports.aggregateDailyAnalytics = functions.pubsub
    .schedule('0 2 * * *') // 2 AM daily
    .timeZone('Africa/Nairobi')
    .onRun(async (context) => {
        console.log('📊 Computing daily analytics...');

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get today's issues
            const issuesSnapshot = await db
                .collection('issues')
                .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
                .where('createdAt', '<', admin.firestore.Timestamp.fromDate(tomorrow))
                .get();

            let totalIssues = issuesSnapshot.size;
            let resolved = 0;
            let averageResolutionTime = 0;
            const bySeverity = { high: 0, medium: 0, low: 0 };
            const byType = {};

            issuesSnapshot.forEach(doc => {
                const issue = doc.data();
                
                bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
                byType[issue.type] = (byType[issue.type] || 0) + 1;

                if (issue.status === 'resolved' && issue.resolvedAt) {
                    resolved++;
                    const created = issue.createdAt.toDate();
                    const resolvedAt = issue.resolvedAt.toDate();
                    const hours = (resolvedAt - created) / (1000 * 60 * 60);
                    averageResolutionTime += hours;
                }
            });

            if (resolved > 0) {
                averageResolutionTime = Math.round((averageResolutionTime / resolved) * 10) / 10;
            }

            // Store analytics
            await db.collection('analytics').doc(today.toISOString().split('T')[0]).set({
                date: admin.firestore.Timestamp.fromDate(today),
                totalReports: totalIssues,
                resolved: resolved,
                pending: totalIssues - resolved,
                resolutionRate: totalIssues > 0 ? Math.round((resolved / totalIssues) * 100) : 0,
                averageResolutionTime: averageResolutionTime,
                bySeverity: bySeverity,
                byType: byType
            });

            console.log(`✅ Analytics computed for ${today.toDateString()}`);
            console.log(`   Total: ${totalIssues}, Resolved: ${resolved}, Avg time: ${averageResolutionTime}h`);

        } catch (error) {
            console.error('Error aggregating analytics:', error);
        }
    });

/**
 * Clean up old issues (soft delete)
 * Runs monthly to archive old data
 */
exports.archiveOldIssues = functions.pubsub
    .schedule('0 3 1 * *') // 3 AM on 1st of month
    .timeZone('Africa/Nairobi')
    .onRun(async (context) => {
        console.log('🗂️  Archiving old issues...');

        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            // Find old, resolved issues
            const oldSnapshot = await db
                .collection('issues')
                .where('status', '==', 'resolved')
                .where('resolvedAt', '<', admin.firestore.Timestamp.fromDate(threeMonthsAgo))
                .get();

            let archived = 0;

            for (const doc of oldSnapshot.docs) {
                await doc.ref.update({
                    archived: true,
                    archivedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                archived++;
            }

            console.log(`✅ Archived ${archived} old issues`);

        } catch (error) {
            console.error('Error archiving issues:', error);
        }
    });

/**
 * Generate monthly report for administrators
 */
exports.generateMonthlyReport = functions.pubsub
    .schedule('0 9 1 * *') // 9 AM on 1st of month
    .timeZone('Africa/Nairobi')
    .onRun(async (context) => {
        console.log('📋 Generating monthly report...');

        try {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);

            // Get all issues from last month
            const snapshot = await db
                .collection('issues')
                .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(firstDay))
                .where('createdAt', '<=', admin.firestore.Timestamp.fromDate(lastDay))
                .get();

            // Compile statistics
            let totalReports = snapshot.size;
            let resolved = 0;
            let totalTime = 0;
            const hotspots = {};

            snapshot.forEach(doc => {
                const issue = doc.data();
                if (issue.status === 'resolved' && issue.resolvedAt) {
                    resolved++;
                    const hours = (issue.resolvedAt.toDate() - issue.createdAt.toDate()) / (1000 * 60 * 60);
                    totalTime += hours;
                }

                hotspots[issue.location] = (hotspots[issue.location] || 0) + 1;
            });

            // Store report
            const report = {
                month: firstDay.toLocaleString('default', { month: 'long', year: 'numeric' }),
                totalReports: totalReports,
                resolved: resolved,
                pending: totalReports - resolved,
                resolutionRate: totalReports > 0 ? Math.round((resolved / totalReports) * 100) : 0,
                averageResolutionTime: resolved > 0 ? Math.round((totalTime / resolved) * 10) / 10 : 0,
                hotspots: hotspots,
                generatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('reports').doc(firstDay.toISOString().split('T')[0]).set(report);

            console.log(`✅ Monthly report generated: ${report.month}`);

        } catch (error) {
            console.error('Error generating report:', error);
        }
    });
