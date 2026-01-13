/**
 * Smart Campus Access Map - Hybrid Storage Manager
 * Handles both local storage and Firebase sync
 * Provides offline-first functionality with cloud backup
 */

const HybridStorageManager = (() => {
    const ISSUES_KEY = 'scam_issues';
    const PREFERENCES_KEY = 'scam_preferences';
    const ANALYTICS_KEY = 'scam_analytics';

    let useFirebase = false;
    let isInitialized = false;

    /**
     * Initialize hybrid storage
     */
    async function initialize() {
        console.log('📦 Initializing Hybrid Storage...');
        
        // Try to initialize Firebase
        if (FIREBASE_ENABLED) {
            try {
                const success = await FirebaseSync.initialize();
                useFirebase = success;
                
                if (useFirebase) {
                    console.log('✅ Using Firebase + Local Storage (Hybrid Mode)');
                    startRealtimeSync();
                } else {
                    console.log('⚠️  Firebase unavailable. Using Local Storage only.');
                }
            } catch (error) {
                console.error('Firebase initialization error:', error);
                useFirebase = false;
            }
        } else {
            console.log('⚠️  Firebase not configured. Using Local Storage only.');
        }

        isInitialized = true;
        return useFirebase;
    }

    /**
     * Start real-time sync with Firestore
     */
    function startRealtimeSync() {
        if (!useFirebase) return;

        // Listen for issue changes
        FirebaseSync.startIssueSyncListener((issues) => {
            localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
            // Notify listeners
            window.dispatchEvent(new CustomEvent('scam:issuesSync', { detail: { issues } }));
        });

        // Listen for notifications
        FirebaseSync.startNotificationListener((notification) => {
            window.dispatchEvent(new CustomEvent('scam:notification', { detail: notification }));
        });

        console.log('🔄 Real-time sync started');
    }

    /**
     * Get all issues (local or Firebase)
     */
    function getIssues() {
        try {
            // Check if localStorage is available (fails in private/incognito mode)
            if (typeof localStorage === 'undefined' || localStorage === null) {
                console.warn('⚠️  localStorage not available. Using memory storage only.');
                return [];
            }
            
            const data = localStorage.getItem(ISSUES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.warn('⚠️  localStorage access blocked (private mode?). Using memory storage only.', error);
            return [];
        }
    }

    /**
     * Save issue (both local and Firebase)
     */
    async function saveIssue(issue) {
        try {
            issue.id = issue.id || `issue_${Date.now()}`;
            issue.createdAt = issue.createdAt || new Date().toISOString();
            issue.status = issue.status || 'pending';
            
            // Save to local storage immediately
            const issues = this.getIssues();
            const existingIndex = issues.findIndex(i => i.id === issue.id);
            if (existingIndex >= 0) {
                issues[existingIndex] = { ...issues[existingIndex], ...issue };
            } else {
                issues.push(issue);
            }
            
            try {
                localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
            } catch (storageError) {
                console.warn('⚠️  Could not save to localStorage (private mode?). Continuing with memory storage.', storageError);
            }
            
            // Save to Firebase in background
            if (useFirebase) {
                FirebaseSync.saveIssue(issue).catch(error => {
                    console.error('Firebase save failed, using local only:', error);
                });
            }

            return issue;
        } catch (error) {
            console.error('Error saving issue:', error);
            throw error;
        }
    }

    /**
     * Update issue status
     */
    async function updateIssueStatus(issueId, status, notes = '') {
        try {
            const issues = this.getIssues();
            const issue = issues.find(i => i.id === issueId);
            
            if (issue) {
                issue.status = status;
                issue.updatedAt = new Date().toISOString();
                this.saveIssue(issue);
                
                // Update in Firebase
                if (useFirebase) {
                    FirebaseSync.updateIssueStatus(issueId, status, notes).catch(error => {
                        console.error('Firebase update failed, using local only:', error);
                    });
                }

                return issue;
            }
            return null;
        } catch (error) {
            console.error('Error updating issue status:', error);
            throw error;
        }
    }

    /**
     * Delete issue
     */
    async function deleteIssue(issueId) {
        try {
            let issues = this.getIssues();
            issues = issues.filter(i => i.id !== issueId);
            localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
            
            // Delete from Firebase
            if (useFirebase) {
                FirebaseSync.deleteIssue(issueId).catch(error => {
                    console.error('Firebase delete failed, using local only:', error);
                });
            }

            return true;
        } catch (error) {
            console.error('Error deleting issue:', error);
            return false;
        }
    }

    /**
     * Get issues by filter
     */
    async function getIssuesByFilter(filters = {}) {
        if (useFirebase) {
            try {
                return await FirebaseSync.getIssuesByFilter(filters);
            } catch (error) {
                console.error('Firebase filter failed, using local:', error);
            }
        }

        const issues = this.getIssues();
        return issues.filter(issue => {
            if (filters.status && issue.status !== filters.status) return false;
            if (filters.type && issue.type !== filters.type) return false;
            if (filters.severity && issue.severity !== filters.severity) return false;
            return true;
        });
    }

    /**
     * Get specific issue by ID
     */
    function getIssueById(issueId) {
        const issues = this.getIssues();
        return issues.find(i => i.id === issueId);
    }

    /**
     * Get audit trail for issue
     */
    async function getAuditTrail(issueId) {
        if (useFirebase) {
            try {
                return await FirebaseSync.getAuditTrail(issueId);
            } catch (error) {
                console.error('Failed to fetch audit trail:', error);
            }
        }
        return [];
    }

    /**
     * Get analytics
     */
    async function getAnalytics(dateRange = 30) {
        if (useFirebase) {
            try {
                return await FirebaseSync.getAnalytics(dateRange);
            } catch (error) {
                console.error('Firebase analytics failed, using local:', error);
            }
        }

        const issues = this.getIssues();
        return {
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
            }
        };
    }

    /**
     * Get preferences
     */
    function getPreferences() {
        try {
            const data = localStorage.getItem(PREFERENCES_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            return {};
        }
    }

    /**
     * Set preference
     */
    function setPreference(key, value) {
        const prefs = this.getPreferences();
        prefs[key] = value;
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    }

    /**
     * Export all data
     */
    async function exportData() {
        if (useFirebase) {
            try {
                return await FirebaseSync.exportData();
            } catch (error) {
                console.error('Firebase export failed:', error);
            }
        }

        return {
            exportDate: new Date().toISOString(),
            totalIssues: this.getIssues().length,
            issues: this.getIssues(),
            source: 'local'
        };
    }

    /**
     * Import data
     */
    async function importData(data) {
        if (useFirebase) {
            try {
                return await FirebaseSync.importData(data);
            } catch (error) {
                console.error('Firebase import failed:', error);
            }
        }

        // Import to local storage
        const existingIssues = this.getIssues();
        const newIssues = data.issues || [];
        const merged = [...existingIssues, ...newIssues];
        localStorage.setItem(ISSUES_KEY, JSON.stringify(merged));
        return true;
    }

    /**
     * Clear all data
     */
    function clearAllData() {
        localStorage.removeItem(ISSUES_KEY);
        localStorage.removeItem(PREFERENCES_KEY);
        localStorage.removeItem(ANALYTICS_KEY);
        console.log('🗑️  Local data cleared');
    }

    /**
     * Get storage status
     */
    function getStatus() {
        return {
            initialized: isInitialized,
            firebaseEnabled: useFirebase,
            firebaseOnline: useFirebase && FirebaseSync.isOnline(),
            storageMode: useFirebase ? 'hybrid' : 'local',
            userId: useFirebase ? FirebaseSync.userId() : 'local'
        };
    }

    return {
        initialize,
        getIssues,
        saveIssue,
        updateIssueStatus,
        deleteIssue,
        getIssuesByFilter,
        getIssueById,
        getAuditTrail,
        getAnalytics,
        getPreferences,
        setPreference,
        exportData,
        importData,
        clearAllData,
        getStatus
    };
})();
