/**
 * Smart Campus Access Map - Analytics Module
 * Handles statistics, charts, and data visualization
 */

const AnalyticsManager = (() => {
    const updateStatistics = () => {
        const analytics = StorageManager.updateAnalytics();

        document.getElementById('statTotalReports').textContent = analytics.totalReports;
        document.getElementById('statResolved').textContent = analytics.resolvedCount;
        document.getElementById('statPending').textContent = (analytics.byStatus['pending'] || 0);

        updateCharts(analytics);
    };

    const updateCharts = (analytics) => {
        updateTypeChart(analytics.byType);
        updateSeverityChart(analytics.bySeverity);
        updateStatusChart(analytics.byStatus);
    };

    const updateTypeChart = (byType) => {
        const container = document.getElementById('typeChart');
        if (!container) return;

        const sortedTypes = Object.entries(byType)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sortedTypes.length === 0) {
            container.innerHTML = '<p class="text-muted">No data yet</p>';
            return;
        }

        const maxValue = Math.max(...sortedTypes.map(t => t[1]));
        
        const chartHTML = sortedTypes.map(([type, count]) => {
            const percentage = (count / maxValue) * 100;
            const label = type.replace(/-/g, ' ').charAt(0).toUpperCase() + type.replace(/-/g, ' ').slice(1);
            
            return `
                <div class="chart-bar">
                    <span class="chart-label" title="${label}">${label.substring(0, 10)}</span>
                    <div class="chart-bar-fill" style="width: ${percentage}%">
                        <span class="chart-bar-value">${count}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = chartHTML;
    };

    const updateSeverityChart = (bySeverity) => {
        const container = document.getElementById('severityChart');
        if (!container) return;

        const severities = ['low', 'medium', 'high'];
        const data = severities.map(sev => ({
            name: sev.charAt(0).toUpperCase() + sev.slice(1),
            count: bySeverity[sev] || 0,
            severity: sev
        }));

        const maxValue = Math.max(...data.map(d => d.count), 1);

        const chartHTML = data.map(item => {
            const percentage = (item.count / maxValue) * 100;
            const color = MapManager.getSeverityColor(item.severity);
            
            return `
                <div class="chart-bar">
                    <span class="chart-label">${item.name}</span>
                    <div class="chart-bar-fill" style="background: ${color}; width: ${percentage}%">
                        <span class="chart-bar-value">${item.count}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = chartHTML;
    };

    const updateStatusChart = (byStatus) => {
        const container = document.getElementById('statusChart');
        if (!container) return;

        const statuses = ['pending', 'in-progress', 'resolved'];
        const data = statuses.map(status => ({
            name: status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1),
            count: byStatus[status] || 0,
            status: status
        }));

        const maxValue = Math.max(...data.map(d => d.count), 1);

        const chartHTML = data.map(item => {
            const percentage = (item.count / maxValue) * 100;
            const color = getStatusChartColor(item.status);
            
            return `
                <div class="chart-bar">
                    <span class="chart-label">${item.name}</span>
                    <div class="chart-bar-fill" style="background: ${color}; width: ${percentage}%">
                        <span class="chart-bar-value">${item.count}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = chartHTML;
    };

    const getStatusChartColor = (status) => {
        const colors = {
            'pending': '#ffc107',
            'in-progress': '#17a2b8',
            'resolved': '#28a745'
        };
        return colors[status] || '#6c757d';
    };

    const getIssueStats = () => {
        const issues = StorageManager.getIssues();
        return {
            total: issues.length,
            resolved: issues.filter(i => i.status === 'resolved').length,
            pending: issues.filter(i => i.status === 'pending').length,
            inProgress: issues.filter(i => i.status === 'in-progress').length,
            highSeverity: issues.filter(i => i.severity === 'high').length
        };
    };

    const getAccessibilityScore = () => {
        const stats = getIssueStats();
        if (stats.total === 0) return 100;

        // Simple scoring: resolved issues increase score, pending decreases it
        const resolvedPercentage = (stats.resolved / stats.total) * 100;
        const pendingPenalty = (stats.pending / stats.total) * 30;
        
        const score = Math.max(0, Math.min(100, resolvedPercentage - pendingPenalty));
        return Math.round(score);
    };

    const getMostAffectedAreas = (limit = 5) => {
        const issues = StorageManager.getIssues();
        const areas = {};

        issues.forEach(issue => {
            areas[issue.location] = (areas[issue.location] || 0) + 1;
        });

        return Object.entries(areas)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([location, count]) => ({ location, count }));
    };

    const getReportTrend = (days = 7) => {
        const issues = StorageManager.getIssues();
        const trend = {};

        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trend[dateStr] = 0;
        }

        issues.forEach(issue => {
            const dateStr = new Date(issue.createdAt).toISOString().split('T')[0];
            if (trend[dateStr] !== undefined) {
                trend[dateStr]++;
            }
        });

        return Object.entries(trend).map(([date, count]) => ({ date, count }));
    };

    return {
        updateStatistics,
        updateCharts,
        getIssueStats,
        getAccessibilityScore,
        getMostAffectedAreas,
        getReportTrend
    };
})();

// Global function for updating analytics
function updateAnalytics() {
    AnalyticsManager.updateStatistics();
}

// Initialize analytics on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        AnalyticsManager.updateStatistics();
    }, 1000);
});
