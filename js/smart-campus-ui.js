/**
 * Smart Campus Access Map - UI Management Module
 * Handles form inputs, user interactions, and UI updates
 */

const UIManager = (() => {
    let currentLocation = null;

    const initializeEventListeners = () => {
        // Report Form
        const reportForm = document.getElementById('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', handleReportSubmit);
        }

        // Use Location Checkbox
        const useLocationCheckbox = document.getElementById('useLocation');
        if (useLocationCheckbox) {
            useLocationCheckbox.addEventListener('change', toggleLocationInput);
        }

        // Refresh Issues Button
        const refreshButton = document.getElementById('refreshIssues');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                refreshButton.classList.add('spin');
                IssuesManager.refreshIssuesList();
                setTimeout(() => {
                    refreshButton.classList.remove('spin');
                    NotificationManager.success('Issues list refreshed');
                }, 1000);
            });
        }

        // FAB Report Button (Mobile)
        const fabReport = document.getElementById('fabReport');
        if (fabReport) {
            fabReport.addEventListener('click', () => {
                switchTab('report-tab');
            });
        }

        // Export Data Buttons
        const exportExcelBtn = document.getElementById('exportExcelBtn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', handleExportToExcel);
        }

        const exportJsonBtn = document.getElementById('exportJsonBtn');
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', handleExportToJSON);
        }

        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', handleGenerateReport);
        }

        const exportAnalyticsBtn = document.getElementById('exportAnalyticsBtn');
        if (exportAnalyticsBtn) {
            exportAnalyticsBtn.addEventListener('click', handleExportAnalytics);
        }

        // Issue Count Badge Update
        updateIssueCount();
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();

        const type = document.getElementById('issueType').value;
        const location = document.getElementById('issueLocation').value;
        const description = document.getElementById('issueDescription').value;
        const severity = document.querySelector('input[name="severity"]:checked').value;
        const useLocation = document.getElementById('useLocation').checked;

        if (!type || !location || !description) {
            NotificationManager.warning('Please fill in all required fields');
            return;
        }

        let latitude = null;
        let longitude = null;

        if (useLocation && currentLocation) {
            latitude = currentLocation.latitude;
            longitude = currentLocation.longitude;
        } else if (useLocation) {
            // Try to get current position
            try {
                const position = await getCurrentPosition();
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            } catch (error) {
                console.warn('Could not get current location:', error);
                // Continue without location
            }
        }

        const result = IssuesManager.createIssue({
            type,
            location,
            description,
            severity,
            latitude,
            longitude
        });

        if (result.success) {
            NotificationManager.success(result.message);
            e.target.reset();
            document.getElementById('severity-low').checked = true;
            document.getElementById('useLocation').checked = true;

            // Switch to issues tab to show the new issue
            setTimeout(() => {
                switchTab('issues-tab');
            }, 500);
        } else {
            NotificationManager.error(result.message);
        }
    };

    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    resolve(position);
                },
                error => {
                    console.warn('Geolocation error:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    const toggleLocationInput = (e) => {
        const locationInput = document.getElementById('issueLocation');
        if (!locationInput) return;

        if (e.target.checked) {
            // Try to get current location
            getCurrentPosition().then(() => {
                if (currentLocation) {
                    NotificationManager.info('Using your current location');
                    // You could also auto-fill the location input here
                }
            }).catch(() => {
                NotificationManager.warning('Could not access your location. Please enter it manually.');
            });
        }
    };

    const handleExportToExcel = async () => {
        try {
            const issues = StorageManager.getIssues();
            if (!issues || issues.length === 0) {
                NotificationManager.warning('No issues to export. Report some issues first!');
                return;
            }

            const result = await DataExport.exportToExcel(issues);
            if (result.success) {
                NotificationManager.success(`✅ Exported ${result.count} issues to ${result.filename}`);
            } else {
                NotificationManager.error('Failed to export: ' + result.error);
            }
        } catch (error) {
            console.error('Export error:', error);
            NotificationManager.error('Error exporting data: ' + error.message);
        }
    };

    const handleExportToJSON = async () => {
        try {
            const issues = StorageManager.getIssues();
            if (!issues || issues.length === 0) {
                NotificationManager.warning('No issues to export. Report some issues first!');
                return;
            }

            const result = await DataExport.exportToJSON(issues);
            if (result.success) {
                NotificationManager.success(`✅ Exported ${result.count} issues to ${result.filename}`);
            } else {
                NotificationManager.error('Failed to export: ' + result.error);
            }
        } catch (error) {
            console.error('Export error:', error);
            NotificationManager.error('Error exporting data: ' + error.message);
        }
    };

    const handleGenerateReport = async () => {
        try {
            const issues = StorageManager.getIssues();
            if (!issues || issues.length === 0) {
                NotificationManager.warning('No issues to report. Report some issues first!');
                return;
            }

            const result = await DataExport.generateReport(issues, {
                includeAnalytics: true,
                format: 'html'
            });

            if (result.success) {
                NotificationManager.success(`✅ Report generated: ${result.filename}`);
            } else {
                NotificationManager.error('Failed to generate report: ' + result.error);
            }
        } catch (error) {
            console.error('Report error:', error);
            NotificationManager.error('Error generating report: ' + error.message);
        }
    };

    const handleExportAnalytics = async () => {
        try {
            const issues = StorageManager.getIssues();
            if (!issues || issues.length === 0) {
                NotificationManager.warning('No data to analyze. Report some issues first!');
                return;
            }

            const result = await DataExport.exportAnalyticsSummary(issues);
            if (result.success) {
                NotificationManager.success(`✅ Analytics exported to ${result.filename}`);
                console.log('📊 Analytics Summary:', result.summary);
            } else {
                NotificationManager.error('Failed to export analytics: ' + result.error);
            }
        } catch (error) {
            console.error('Analytics export error:', error);
            NotificationManager.error('Error exporting analytics: ' + error.message);
        }
    };

    const updateIssueCount = () => {
        const issues = StorageManager.getIssues();
        const activeCount = issues.filter(i => i.status !== 'resolved').length;
        const badge = document.getElementById('issueCount');
        if (badge) {
            badge.textContent = activeCount;
            badge.style.display = activeCount > 0 ? 'inline-block' : 'none';
        }
    };

    return {
        initializeEventListeners,
        updateIssueCount,
        getCurrentLocation: () => currentLocation
    };
})();

// Global functions for sidebar and navigation
function switchTab(tabId) {
    const tab = document.getElementById(tabId);
    if (tab) {
        const bsTab = new bootstrap.Tab(tab);
        bsTab.show();
    }
}

function updateSidebar(tabId) {
    switchTab(tabId + '-tab');
}

function exportData() {
    const data = StorageManager.exportData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-campus-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    NotificationManager.success('Data exported successfully');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        if (confirm('This will delete all reported issues and analytics data. Continue?')) {
            StorageManager.clearAllData();
            IssuesManager.refreshIssuesList();
            MapManager.renderAllIssues();
            AnalyticsManager.updateStatistics();
            NotificationManager.success('All data has been cleared');
        }
    }
}

// Initialize UI when document is ready
document.addEventListener('DOMContentLoaded', () => {
    UIManager.initializeEventListeners();
});

// Update issue count when issues change
setInterval(() => {
    UIManager.updateIssueCount();
}, 2000);
