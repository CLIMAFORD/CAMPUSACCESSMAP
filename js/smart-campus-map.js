/**
 * Smart Campus Access Map - Map Management Module
 * Handles map initialization, layer management, and issue visualization
 */

const MapManager = (() => {
    let map = null;
    let issueMarkers = {};
    let issueLayer = null;

    const initMap = () => {
        // Use existing map instance created by QGIS2web
        map = window.mapInstance;
        
        if (!map) {
            console.error('Map instance not found');
            return;
        }

        // Create a feature group for issue markers
        issueLayer = L.featureGroup();
        map.addLayer(issueLayer);

        console.log('Map initialized successfully');
    };

    const addIssueMarker = (issue) => {
        if (!map || !issue.latitude || !issue.longitude) return;

        // Remove existing marker if present
        if (issueMarkers[issue.id]) {
            issueLayer.removeLayer(issueMarkers[issue.id]);
        }

        const iconColor = getSeverityColor(issue.severity);
        const iconHtml = `
            <div class="issue-marker" style="background: ${iconColor}; border: 3px solid white;">
                <i class="fas fa-exclamation-triangle" style="color: white;"></i>
            </div>
        `;

        const marker = L.marker(
            [issue.latitude, issue.longitude],
            {
                icon: L.divIcon({
                    html: iconHtml,
                    className: 'custom-issue-marker',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40]
                })
            }
        );

        const popupContent = createIssuePopup(issue);
        marker.bindPopup(popupContent);
        marker.on('click', () => {
            marker.openPopup();
            updateSidebar('issues');
        });

        issueLayer.addLayer(marker);
        issueMarkers[issue.id] = marker;

        return marker;
    };

    const createIssuePopup = (issue) => {
        const severity = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
        const status = issue.status.charAt(0).toUpperCase() + issue.status.slice(1);
        
        return `
            <div class="issue-popup">
                <h6>${issue.type.replace(/-/g, ' ').toUpperCase()}</h6>
                <p><strong>Location:</strong> ${issue.location}</p>
                <p><strong>Severity:</strong> <span class="badge bg-${getSeverityClass(issue.severity)}">${severity}</span></p>
                <p><strong>Status:</strong> <span class="badge bg-${getStatusClass(issue.status)}">${status}</span></p>
                <p><strong>Reported:</strong> ${new Date(issue.createdAt).toLocaleDateString()}</p>
                <p>${issue.description}</p>
                <button class="btn btn-sm btn-primary" onclick="IssuesManager.selectIssue('${issue.id}')">
                    <i class="fas fa-edit"></i> View Details
                </button>
            </div>
        `;
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#dc3545'
        };
        return colors[severity] || '#6c757d';
    };

    const getSeverityClass = (severity) => {
        const classes = {
            'low': 'success',
            'medium': 'warning',
            'high': 'danger'
        };
        return classes[severity] || 'secondary';
    };

    const getStatusClass = (status) => {
        const classes = {
            'pending': 'warning',
            'in-progress': 'info',
            'resolved': 'success'
        };
        return classes[status] || 'secondary';
    };

    const renderAllIssues = () => {
        // Clear existing markers
        issueLayer.clearLayers();
        issueMarkers = {};

        // Add all issues
        const issues = StorageManager.getIssues();
        issues.forEach(issue => {
            addIssueMarker(issue);
        });
    };

    const removeIssueMarker = (issueId) => {
        if (issueMarkers[issueId]) {
            issueLayer.removeLayer(issueMarkers[issueId]);
            delete issueMarkers[issueId];
        }
    };

    const fitToIssue = (issue) => {
        if (issue.latitude && issue.longitude) {
            map.setView([issue.latitude, issue.longitude], 18);
            if (issueMarkers[issue.id]) {
                issueMarkers[issue.id].openPopup();
            }
        }
    };

    const fitToBounds = (issues) => {
        if (issues.length === 0) return;

        const bounds = L.latLngBounds(
            issues
                .filter(i => i.latitude && i.longitude)
                .map(i => [i.latitude, i.longitude])
        );

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    const getMapCenter = () => {
        if (!map) return null;
        const center = map.getCenter();
        return {
            latitude: center.lat,
            longitude: center.lng,
            zoom: map.getZoom()
        };
    };

    const getCurrentMapBounds = () => {
        if (!map) return null;
        const bounds = map.getBounds();
        return {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        };
    };

    return {
        init: initMap,
        addIssueMarker,
        removeIssueMarker,
        renderAllIssues,
        fitToIssue,
        fitToBounds,
        getMapCenter,
        getCurrentMapBounds,
        getSeverityColor,
        getSeverityClass,
        getStatusClass,
        get map() {
            return map;
        }
    };
})();

// Initialize map when document is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        MapManager.init();
        MapManager.renderAllIssues();
    }, 500);
});
