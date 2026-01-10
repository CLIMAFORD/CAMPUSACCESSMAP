/**
 * Smart Campus Access Map - Firebase Sync Module
 * Handles real-time synchronization with Firestore
 * Provides offline-first architecture with cloud backup
 */

const FirebaseSync = (() => {
    let db = null;
    let isConnected = false;
    let unsubscribeIssues = null;
    let unsubscribeNotifications = null;
    const syncCallbacks = [];
    const notificationCallbacks = [];
    let userId = null;

    /**
     * Initialize Firebase connection
     */
    async function initialize() {
        if (!FIREBASE_ENABLED) {
            console.warn('Firebase not configured. Using local storage only.');
            return false;
        }

        try {
            // Initialize Firebase
            firebase.initializeApp(FIREBASE_CONFIG);
            db = firebase.firestore();
            
            // Set up offline persistence
            db.enablePersistence().catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('Multiple tabs open, offline persistence disabled');
                } else if (err.code == 'unimplemented') {
                    console.warn('Browser does not support offline persistence');
                }
            });

            // Generate anonymous user ID
            userId = generateUserId();
            
            // Listen for connection changes
            db.collection('_metadata').doc('connection').onSnapshot(doc => {
                isConnected = doc.exists && doc.data().connected === true;
                console.log(`Firebase connection: ${isConnected ? '🟢 Online' : '🔴 Offline'}`);
            }, error => {
                // Fallback if metadata check fails
                isConnected = navigator.onLine;
            });

            console.log('✅ Firebase initialized');
            return true;
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            return false;
        }
    }

    /**
     * Generate unique user ID for anonymous users
     */
    function generateUserId() {
        let id = localStorage.getItem('scam_user_id');
        if (!id) {
            id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('scam_user_id', id);
        }
        return id;
    }

    /**
     * Get all issues from Firestore (real-time)
     */
    function startIssueSyncListener(callback) {
        if (!db) {
            console.warn('Firebase not initialized');
            return () => {};
        }

        unsubscribeIssues = db.collection('issues')
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                (snapshot) => {
                    const issues = [];
                    snapshot.forEach(doc => {
                        issues.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(`📡 Synced ${issues.length} issues from Firestore`);
                    callback(issues);
                },
                (error) => {
                    console.error('Error syncing issues:', error);
                    // Notify UI but continue with local data
                }
            );

        return unsubscribeIssues;
    }

    /**
     * Save issue to Firestore
     */
    async function saveIssue(issue) {
        if (!db || !isConnected) {
            console.warn('Firebase offline. Saving to local storage only.');
            return StorageManager.saveIssue(issue);
        }

        try {
            issue.userId = userId;
            issue.createdAt = issue.createdAt || firebase.firestore.FieldValue.serverTimestamp();
            issue.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            issue.status = issue.status || 'pending';
            issue.auditTrail = issue.auditTrail || [];
            
            // Add creation event to audit trail
            issue.auditTrail.push({
                action: 'created',
                by: userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                details: `Issue created by ${issue.reportedBy || 'Anonymous'}`
            });

            if (issue.id) {
                // Update existing issue
                await db.collection('issues').doc(issue.id).update({
                    ...issue,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log(`✏️  Updated issue ${issue.id} in Firestore`);
            } else {
                // Create new issue
                const docRef = await db.collection('issues').add(issue);
                issue.id = docRef.id;
                console.log(`✅ Created issue ${docRef.id} in Firestore`);
            }

            // Also save to local for offline access
            StorageManager.saveIssue(issue);
            
            // Trigger callbacks
            syncCallbacks.forEach(cb => cb(issue, 'saved'));
            
            return issue;
        } catch (error) {
            console.error('Error saving issue to Firestore:', error);
            throw error;
        }
    }

    /**
     * Update issue status with audit trail
     */
    async function updateIssueStatus(issueId, newStatus, notes = '', updatedBy = 'Anonymous') {
        if (!db || !isConnected) {
            console.warn('Firebase offline. Updating local storage only.');
            return StorageManager.updateIssueStatus(issueId, newStatus);
        }

        try {
            const issueRef = db.collection('issues').doc(issueId);
            const doc = await issueRef.get();
            
            if (!doc.exists) {
                throw new Error(`Issue ${issueId} not found`);
            }

            const auditEntry = {
                action: 'status_changed',
                from: doc.data().status,
                to: newStatus,
                by: userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                notes: notes,
                updatedBy: updatedBy
            };

            await issueRef.update({
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                auditTrail: firebase.firestore.FieldValue.arrayUnion(auditEntry)
            });

            console.log(`📍 Updated issue ${issueId} status to: ${newStatus}`);

            // Trigger callbacks
            syncCallbacks.forEach(cb => cb({ id: issueId, status: newStatus }, 'status_updated'));
            
            return { id: issueId, status: newStatus };
        } catch (error) {
            console.error('Error updating issue status:', error);
            throw error;
        }
    }

    /**
     * Delete issue from Firestore
     */
    async function deleteIssue(issueId) {
        if (!db || !isConnected) {
            console.warn('Firebase offline. Deleting from local storage only.');
            return StorageManager.deleteIssue(issueId);
        }

        try {
            // Soft delete - mark as deleted instead of removing
            await db.collection('issues').doc(issueId).update({
                deleted: true,
                deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
                deletedBy: userId
            });

            console.log(`🗑️  Deleted issue ${issueId}`);
            
            // Also delete from local storage
            StorageManager.deleteIssue(issueId);
            
            // Trigger callbacks
            syncCallbacks.forEach(cb => cb({ id: issueId }, 'deleted'));
            
            return true;
        } catch (error) {
            console.error('Error deleting issue:', error);
            throw error;
        }
    }

    /**
     * Get issues by filter (status, type, severity)
     */
    function getIssuesByFilter(filters = {}) {
        if (!db || !isConnected) {
            return StorageManager.getIssuesByFilter(filters);
        }

        return new Promise((resolve, reject) => {
            let query = db.collection('issues').where('deleted', '==', false);

            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }
            if (filters.type) {
                query = query.where('type', '==', filters.type);
            }
            if (filters.severity) {
                query = query.where('severity', '==', filters.severity);
            }

            query.orderBy('createdAt', 'desc')
                .get()
                .then(snapshot => {
                    const issues = [];
                    snapshot.forEach(doc => {
                        issues.push({ id: doc.id, ...doc.data() });
                    });
                    resolve(issues);
                })
                .catch(reject);
        });
    }

    /**
     * Start listening for notifications (new issues, status updates)
     */
    function startNotificationListener(callback) {
        if (!db) {
            console.warn('Firebase not initialized');
            return () => {};
        }

        // Listen for new issues created in last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        unsubscribeNotifications = db.collection('issues')
            .where('createdAt', '>=', fiveMinutesAgo)
            .where('status', '==', 'pending')
            .onSnapshot(
                (snapshot) => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const issue = { id: change.doc.id, ...change.doc.data() };
                            console.log(`🔔 New issue notification: ${issue.type}`);
                            callback({
                                type: 'new_issue',
                                issue: issue
                            });
                        }
                    });
                }
            );

        return unsubscribeNotifications;
    }

    /**
     * Get audit trail for an issue
     */
    async function getAuditTrail(issueId) {
        if (!db || !isConnected) {
            return [];
        }

        try {
            const doc = await db.collection('issues').doc(issueId).get();
            return doc.data().auditTrail || [];
        } catch (error) {
            console.error('Error fetching audit trail:', error);
            return [];
        }
    }

    /**
     * Get analytics data from Firestore
     */
    async function getAnalytics(dateRange = 30) {
        if (!db || !isConnected) {
            return StorageManager.getAnalytics();
        }

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - dateRange);

            const snapshot = await db.collection('issues')
                .where('createdAt', '>=', startDate)
                .where('deleted', '==', false)
                .get();

            const issues = [];
            snapshot.forEach(doc => {
                issues.push(doc.data());
            });

            // Calculate analytics
            const analytics = {
                totalReports: issues.length,
                byStatus: {
                    pending: issues.filter(i => i.status === 'pending').length,
                    inProgress: issues.filter(i => i.status === 'in_progress').length,
                    resolved: issues.filter(i => i.status === 'resolved').length
                },
                byType: {},
                bySeverity: {
                    low: issues.filter(i => i.severity === 'low').length,
                    medium: issues.filter(i => i.severity === 'medium').length,
                    high: issues.filter(i => i.severity === 'high').length
                },
                averageResolutionTime: calculateAvgResolutionTime(issues)
            };

            // Count by type
            issues.forEach(issue => {
                analytics.byType[issue.type] = (analytics.byType[issue.type] || 0) + 1;
            });

            return analytics;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return StorageManager.getAnalytics();
        }
    }

    /**
     * Calculate average resolution time in hours
     */
    function calculateAvgResolutionTime(issues) {
        const resolved = issues.filter(i => i.status === 'resolved' && i.resolvedAt);
        if (resolved.length === 0) return 0;

        const totalTime = resolved.reduce((sum, issue) => {
            const created = new Date(issue.createdAt).getTime();
            const resolvedAt = new Date(issue.resolvedAt).getTime();
            return sum + (resolvedAt - created);
        }, 0);

        return Math.round((totalTime / resolved.length) / (1000 * 60 * 60) * 10) / 10;
    }

    /**
     * Stop listening to real-time updates
     */
    function stopListeners() {
        if (unsubscribeIssues) {
            unsubscribeIssues();
        }
        if (unsubscribeNotifications) {
            unsubscribeNotifications();
        }
    }

    /**
     * Register callback for sync events
     */
    function onSyncChange(callback) {
        syncCallbacks.push(callback);
    }

    /**
     * Get connection status
     */
    function isOnline() {
        return isConnected;
    }

    /**
     * Export data from Firestore
     */
    async function exportData() {
        if (!db) {
            return StorageManager.exportData();
        }

        try {
            const snapshot = await db.collection('issues').get();
            const issues = [];
            snapshot.forEach(doc => {
                issues.push({ id: doc.id, ...doc.data() });
            });

            return {
                exportDate: new Date().toISOString(),
                totalIssues: issues.length,
                issues: issues,
                source: 'firebase'
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return StorageManager.exportData();
        }
    }

    /**
     * Import data to Firestore (batch operation)
     */
    async function importData(data) {
        if (!db || !isConnected) {
            return StorageManager.importData(data);
        }

        try {
            const batch = db.batch();
            const issuesRef = db.collection('issues');

            for (const issue of data.issues) {
                const docRef = issuesRef.doc();
                batch.set(docRef, {
                    ...issue,
                    importedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    importedBy: userId
                });
            }

            await batch.commit();
            console.log(`✅ Imported ${data.issues.length} issues to Firestore`);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }

    return {
        initialize,
        startIssueSyncListener,
        saveIssue,
        updateIssueStatus,
        deleteIssue,
        getIssuesByFilter,
        startNotificationListener,
        getAuditTrail,
        getAnalytics,
        stopListeners,
        onSyncChange,
        isOnline,
        exportData,
        importData,
        userId: () => userId
    };
})();
