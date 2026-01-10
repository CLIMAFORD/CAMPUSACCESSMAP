/**
 * Smart Campus Access Map - Local Storage Management
 * Handles persistent storage of issues, user preferences, and analytics data
 */

const StorageManager = (() => {
    const ISSUES_KEY = 'scam_issues';
    const PREFERENCES_KEY = 'scam_preferences';
    const ANALYTICS_KEY = 'scam_analytics';

    return {
        /**
         * Get all issues from local storage
         */
        getIssues() {
            try {
                const data = localStorage.getItem(ISSUES_KEY);
                return data ? JSON.parse(data) : [];
            } catch (error) {
                console.error('Error loading issues:', error);
                return [];
            }
        },

        /**
         * Save an issue to local storage
         */
        saveIssue(issue) {
            try {
                const issues = this.getIssues();
                issue.id = issue.id || `issue_${Date.now()}`;
                issue.createdAt = issue.createdAt || new Date().toISOString();
                issue.status = issue.status || 'pending';
                
                const existingIndex = issues.findIndex(i => i.id === issue.id);
                if (existingIndex >= 0) {
                    issues[existingIndex] = { ...issues[existingIndex], ...issue };
                } else {
                    issues.push(issue);
                }
                
                localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
                return issue;
            } catch (error) {
                console.error('Error saving issue:', error);
                throw error;
            }
        },

        /**
         * Update issue status
         */
        updateIssueStatus(issueId, status) {
            const issues = this.getIssues();
            const issue = issues.find(i => i.id === issueId);
            if (issue) {
                issue.status = status;
                issue.updatedAt = new Date().toISOString();
                this.saveIssue(issue);
                return issue;
            }
            return null;
        },

        /**
         * Delete an issue
         */
        deleteIssue(issueId) {
            try {
                let issues = this.getIssues();
                issues = issues.filter(i => i.id !== issueId);
                localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
                return true;
            } catch (error) {
                console.error('Error deleting issue:', error);
                return false;
            }
        },

        /**
         * Get issues by filter
         */
        getIssuesByFilter(filterFn) {
            return this.getIssues().filter(filterFn);
        },

        /**
         * Get issue by ID
         */
        getIssueById(issueId) {
            return this.getIssues().find(i => i.id === issueId);
        },

        /**
         * Clear all issues
         */
        clearAllIssues() {
            try {
                localStorage.setItem(ISSUES_KEY, JSON.stringify([]));
                return true;
            } catch (error) {
                console.error('Error clearing issues:', error);
                return false;
            }
        },

        /**
         * Get user preferences
         */
        getPreferences() {
            try {
                const data = localStorage.getItem(PREFERENCES_KEY);
                return data ? JSON.parse(data) : {
                    showResolvedIssues: false,
                    selectedSeverities: ['low', 'medium', 'high'],
                    mapZoom: 17,
                    lastLocation: null
                };
            } catch (error) {
                console.error('Error loading preferences:', error);
                return {};
            }
        },

        /**
         * Save user preferences
         */
        setPreference(key, value) {
            try {
                const prefs = this.getPreferences();
                prefs[key] = value;
                localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
                return true;
            } catch (error) {
                console.error('Error saving preference:', error);
                return false;
            }
        },

        /**
         * Get analytics data
         */
        getAnalytics() {
            try {
                const data = localStorage.getItem(ANALYTICS_KEY);
                return data ? JSON.parse(data) : {
                    totalReports: 0,
                    resolvedCount: 0,
                    byType: {},
                    bySeverity: {},
                    byStatus: {},
                    lastUpdated: new Date().toISOString()
                };
            } catch (error) {
                console.error('Error loading analytics:', error);
                return {};
            }
        },

        /**
         * Update analytics based on current issues
         */
        updateAnalytics() {
            const issues = this.getIssues();
            const analytics = {
                totalReports: issues.length,
                resolvedCount: issues.filter(i => i.status === 'resolved').length,
                byType: {},
                bySeverity: {},
                byStatus: {},
                lastUpdated: new Date().toISOString()
            };

            issues.forEach(issue => {
                // By Type
                analytics.byType[issue.type] = (analytics.byType[issue.type] || 0) + 1;
                
                // By Severity
                analytics.bySeverity[issue.severity] = (analytics.bySeverity[issue.severity] || 0) + 1;
                
                // By Status
                analytics.byStatus[issue.status] = (analytics.byStatus[issue.status] || 0) + 1;
            });

            try {
                localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
                return analytics;
            } catch (error) {
                console.error('Error saving analytics:', error);
                return analytics;
            }
        },

        /**
         * Export all data as JSON
         */
        exportData() {
            return {
                issues: this.getIssues(),
                preferences: this.getPreferences(),
                analytics: this.getAnalytics(),
                exportedAt: new Date().toISOString()
            };
        },

        /**
         * Import data from JSON
         */
        importData(data) {
            try {
                if (data.issues) localStorage.setItem(ISSUES_KEY, JSON.stringify(data.issues));
                if (data.preferences) localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data.preferences));
                if (data.analytics) localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data.analytics));
                return true;
            } catch (error) {
                console.error('Error importing data:', error);
                return false;
            }
        },

        /**
         * Clear all data
         */
        clearAllData() {
            try {
                localStorage.removeItem(ISSUES_KEY);
                localStorage.removeItem(PREFERENCES_KEY);
                localStorage.removeItem(ANALYTICS_KEY);
                return true;
            } catch (error) {
                console.error('Error clearing data:', error);
                return false;
            }
        }
    };
})();
