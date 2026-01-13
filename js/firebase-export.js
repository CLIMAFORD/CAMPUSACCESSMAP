/**
 * Smart Campus Access Map - Firebase Data Export Module
 * Exports issues and reports to Excel, CSV, and JSON formats
 * Supports downloading data for analysis and record-keeping
 */

const DataExport = (() => {
    
    /**
     * Convert array of objects to CSV string
     */
    function convertToCSV(data) {
        if (!data || data.length === 0) {
            return '';
        }

        // Get headers from first object
        const headers = Object.keys(data[0]);
        
        // Create CSV header row
        const csvHeaders = headers.map(header => `"${header}"`).join(',');
        
        // Create data rows
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                
                // Handle various data types
                if (value === null || value === undefined) {
                    return '""';
                }
                
                if (typeof value === 'object') {
                    // Convert objects/arrays to JSON string
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                
                // Escape quotes and wrap in quotes
                const stringValue = String(value).replace(/"/g, '""');
                return `"${stringValue}"`;
            }).join(',');
        });

        return [csvHeaders, ...csvRows].join('\n');
    }

    /**
     * Export to Excel (using CSV format, opens in Excel)
     */
    async function exportToExcel(issues, filename = null) {
        try {
            if (!issues || issues.length === 0) {
                alert('No issues to export');
                return;
            }

            // Flatten and format issue data for Excel
            const exportData = issues.map(issue => ({
                'Issue ID': issue.id || '',
                'Type': issue.type || '',
                'Location': issue.location || '',
                'Description': issue.description || '',
                'Severity': issue.severity || 'low',
                'Status': issue.status || 'pending',
                'Reporter': issue.reporter || issue.reportedBy || 'Anonymous',
                'Latitude': issue.latitude || '',
                'Longitude': issue.longitude || '',
                'Created Date': formatDateTime(issue.createdAt),
                'Updated Date': formatDateTime(issue.updatedAt),
                'Building': issue.building || '',
                'Floor': issue.floor || '',
                'Department': issue.department || '',
                'Phone': issue.phone || '',
                'Email': issue.email || '',
                'Attachments': (issue.attachments || []).length,
                'Notes': issue.statusNotes || '',
                'User ID': issue.userId || '',
                'Tags': (issue.tags || []).join('; ')
            }));

            // Convert to CSV
            const csv = convertToCSV(exportData);
            
            // Create blob and download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().slice(0, 10);
            const exportFilename = filename || `campus_issues_${timestamp}.csv`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', exportFilename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`✅ Exported ${issues.length} issues to ${exportFilename}`);
            
            return {
                success: true,
                filename: exportFilename,
                count: issues.length
            };
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Export to JSON for backup/archive
     */
    async function exportToJSON(issues, filename = null) {
        try {
            if (!issues || issues.length === 0) {
                alert('No issues to export');
                return;
            }

            const json = JSON.stringify(issues, null, 2);
            const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().slice(0, 10);
            const exportFilename = filename || `campus_issues_backup_${timestamp}.json`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', exportFilename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`✅ Exported ${issues.length} issues to ${exportFilename}`);
            
            return {
                success: true,
                filename: exportFilename,
                count: issues.length
            };
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Export filtered data (by date range, status, severity, etc.)
     */
    async function exportFiltered(issues, filters = {}, format = 'csv') {
        try {
            if (!issues || issues.length === 0) {
                alert('No issues to export');
                return;
            }

            // Apply filters
            let filtered = [...issues];

            if (filters.status) {
                filtered = filtered.filter(i => i.status === filters.status);
            }

            if (filters.type) {
                filtered = filtered.filter(i => i.type === filters.type);
            }

            if (filters.severity) {
                filtered = filtered.filter(i => i.severity === filters.severity);
            }

            if (filters.startDate) {
                const startTime = new Date(filters.startDate).getTime();
                filtered = filtered.filter(i => {
                    const createdTime = new Date(i.createdAt).getTime();
                    return createdTime >= startTime;
                });
            }

            if (filters.endDate) {
                const endTime = new Date(filters.endDate).getTime();
                filtered = filtered.filter(i => {
                    const createdTime = new Date(i.createdAt).getTime();
                    return createdTime <= endTime;
                });
            }

            if (filters.location) {
                filtered = filtered.filter(i => 
                    i.location && i.location.toLowerCase().includes(filters.location.toLowerCase())
                );
            }

            console.log(`📊 Filtered ${filtered.length} of ${issues.length} issues`);

            // Export based on format
            if (format === 'json') {
                return await exportToJSON(filtered, generateFilename(filters, 'json'));
            } else {
                return await exportToExcel(filtered, generateFilename(filters, 'csv'));
            }
        } catch (error) {
            console.error('Error exporting filtered data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate analytics summary
     */
    async function exportAnalyticsSummary(issues) {
        try {
            if (!issues || issues.length === 0) {
                alert('No issues to analyze');
                return;
            }

            const summary = {
                'Report Generated': new Date().toISOString(),
                'Total Issues': issues.length,
                'Total by Status': getCountByStatus(issues),
                'Total by Type': getCountByType(issues),
                'Total by Severity': getCountBySeverity(issues),
                'Total by Location': getCountByLocation(issues),
                'Response Statistics': getResponseStats(issues),
                'Hot Spots': getHotSpots(issues),
                'Average Resolution Time': calculateAvgResolutionTime(issues)
            };

            const json = JSON.stringify(summary, null, 2);
            const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `campus_analytics_${timestamp}.json`;
            
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`📊 Exported analytics summary`);
            
            return {
                success: true,
                summary: summary,
                filename: filename
            };
        } catch (error) {
            console.error('Error exporting analytics:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate comprehensive report
     */
    async function generateReport(issues, options = {}) {
        try {
            const {
                includeAnalytics = true,
                includeMaps = false,
                format = 'html'
            } = options;

            const html = generateReportHTML(issues, includeAnalytics);

            if (format === 'html') {
                const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                
                const timestamp = new Date().toISOString().slice(0, 10);
                const filename = `campus_report_${timestamp}.html`;
                
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                return {
                    success: true,
                    filename: filename
                };
            }
        } catch (error) {
            console.error('Error generating report:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Helper: Format date/time
     */
    function formatDateTime(timestamp) {
        if (!timestamp) return '';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch {
            return timestamp;
        }
    }

    /**
     * Helper: Get count by status
     */
    function getCountByStatus(issues) {
        return issues.reduce((acc, issue) => {
            const status = issue.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Helper: Get count by type
     */
    function getCountByType(issues) {
        return issues.reduce((acc, issue) => {
            const type = issue.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Helper: Get count by severity
     */
    function getCountBySeverity(issues) {
        return issues.reduce((acc, issue) => {
            const severity = issue.severity || 'low';
            acc[severity] = (acc[severity] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Helper: Get count by location
     */
    function getCountByLocation(issues) {
        return issues.reduce((acc, issue) => {
            const location = issue.location || 'unknown';
            acc[location] = (acc[location] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Helper: Get hot spots (most reported locations)
     */
    function getHotSpots(issues, limit = 10) {
        const locationCounts = getCountByLocation(issues);
        return Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .reduce((acc, [location, count]) => {
                acc[location] = count;
                return acc;
            }, {});
    }

    /**
     * Helper: Get response statistics
     */
    function getResponseStats(issues) {
        const resolved = issues.filter(i => i.status === 'resolved');
        const pending = issues.filter(i => i.status === 'pending');
        const inProgress = issues.filter(i => i.status === 'in-progress');

        return {
            'Resolved': resolved.length,
            'In Progress': inProgress.length,
            'Pending': pending.length,
            'Resolution Rate': resolved.length > 0 
                ? ((resolved.length / issues.length) * 100).toFixed(2) + '%'
                : '0%'
        };
    }

    /**
     * Helper: Calculate average resolution time
     */
    function calculateAvgResolutionTime(issues) {
        const resolved = issues.filter(i => i.status === 'resolved' && i.updatedAt);
        
        if (resolved.length === 0) return 'N/A';

        const totalTime = resolved.reduce((sum, issue) => {
            const created = new Date(issue.createdAt).getTime();
            const updated = new Date(issue.updatedAt).getTime();
            return sum + (updated - created);
        }, 0);

        const avgMs = totalTime / resolved.length;
        const hours = Math.round(avgMs / (1000 * 60 * 60));
        
        return `${hours} hours`;
    }

    /**
     * Helper: Generate filename
     */
    function generateFilename(filters, format) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const parts = ['campus_issues'];

        if (filters.status) parts.push(filters.status);
        if (filters.type) parts.push(filters.type);
        if (filters.severity) parts.push(filters.severity);

        const ext = format === 'json' ? 'json' : 'csv';
        return `${parts.join('_')}_${timestamp}.${ext}`;
    }

    /**
     * Helper: Generate report HTML
     */
    function generateReportHTML(issues, includeAnalytics = true) {
        const timestamp = new Date().toLocaleString();
        const analytics = includeAnalytics ? getCountByStatus(issues) : {};

        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Smart Campus Issues Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #007bff; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .stat { display: inline-block; margin-right: 20px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
    </style>
</head>
<body>
    <h1>Smart Campus Access - Issues Report</h1>
    <p><strong>Generated:</strong> ${timestamp}</p>
    
    <h2>Summary Statistics</h2>
    <div class="stat">
        <div>Total Issues: <span class="stat-value">${issues.length}</span></div>
    </div>
`;

        if (includeAnalytics) {
            Object.entries(analytics).forEach(([status, count]) => {
                html += `<div class="stat"><div>${status}: <span class="stat-value">${count}</span></div></div>`;
            });
        }

        html += `
    <h2>Issues Details</h2>
    <table>
        <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Location</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Created</th>
            <th>Description</th>
        </tr>
`;

        issues.forEach(issue => {
            html += `
        <tr>
            <td>${issue.id || 'N/A'}</td>
            <td>${issue.type || 'N/A'}</td>
            <td>${issue.location || 'N/A'}</td>
            <td>${issue.severity || 'low'}</td>
            <td>${issue.status || 'pending'}</td>
            <td>${formatDateTime(issue.createdAt)}</td>
            <td>${issue.description || 'N/A'}</td>
        </tr>
`;
        });

        html += `
    </table>
</body>
</html>
`;

        return html;
    }

    // Public API
    return {
        exportToExcel,
        exportToJSON,
        exportFiltered,
        exportAnalyticsSummary,
        generateReport
    };
})();
