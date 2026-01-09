// src/js/reports.js
// Smart Campus Reporting System

(function() {
    'use strict';
    
    // DOM Elements
    const reportBtn = document.getElementById('report-btn');
    const reportModal = document.getElementById('report-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cancelReportBtn = document.getElementById('cancel-report');
    const issueForm = document.getElementById('issue-form');
    const useCurrentLocationBtn = document.getElementById('use-current-location');
    const selectOnMapBtn = document.getElementById('select-on-map');
    const locationCoords = document.getElementById('location-coords');
    
    // State
    let selectedLocation = null;
    let mapClickHandler = null;
    let tempMarker = null;
    
    // ===== MODAL CONTROLS =====
    reportBtn.addEventListener('click', openReportModal);
    closeBtn.addEventListener('click', closeReportModal);
    cancelReportBtn.addEventListener('click', closeReportModal);
    
    // Close modal when clicking outside
    reportModal.addEventListener('click', function(e) {
        if (e.target === reportModal) {
            closeReportModal();
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && reportModal.style.display === 'flex') {
            closeReportModal();
        }
    });
    
    function openReportModal() {
        reportModal.style.display = 'flex';
        selectedLocation = null;
        locationCoords.value = '';
        issueForm.reset();
        
        // Clean up
        if (tempMarker && window.campusMap) {
            window.campusMap.removeLayer(tempMarker);
            tempMarker = null;
        }
        
        if (mapClickHandler && window.campusMap) {
            window.campusMap.off('click', mapClickHandler);
            mapClickHandler = null;
        }
    }
    
    function closeReportModal() {
        reportModal.style.display = 'none';
        
        // Clean up
        if (mapClickHandler && window.campusMap) {
            window.campusMap.off('click', mapClickHandler);
            mapClickHandler = null;
        }
        
        if (tempMarker && window.campusMap) {
            window.campusMap.removeLayer(tempMarker);
            tempMarker = null;
        }
    }
    
    // ===== LOCATION SELECTION =====
    useCurrentLocationBtn.addEventListener('click', function() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        
        useCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        useCurrentLocationBtn.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                selectedLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                locationCoords.value = `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`;
                useCurrentLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use My Location';
                useCurrentLocationBtn.disabled = false;
                
                // Center map on location
                if (window.campusMap) {
                    window.campusMap.setView([selectedLocation.lat, selectedLocation.lng], 17);
                    
                    // Add temporary marker
                    if (tempMarker) {
                        window.campusMap.removeLayer(tempMarker);
                    }
                    tempMarker = L.marker([selectedLocation.lat, selectedLocation.lng], {
                        icon: L.divIcon({
                            className: 'temp-marker',
                            html: '<i class="fas fa-map-pin" style="color: #ff6b35; font-size: 24px;"></i>',
                            iconSize: [24, 24]
                        })
                    }).addTo(window.campusMap)
                    .bindPopup('Selected location for report')
                    .openPopup();
                }
            },
            function(error) {
                alert('Unable to retrieve your location. Please select on map instead.');
                useCurrentLocationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Use My Location';
                useCurrentLocationBtn.disabled = false;
            }
        );
    });
    
    selectOnMapBtn.addEventListener('click', function() {
        if (!window.campusMap) {
            alert('Map is not ready yet. Please wait a moment.');
            return;
        }
        
        if (mapClickHandler) {
            window.campusMap.off('click', mapClickHandler);
        }
        
        selectOnMapBtn.innerHTML = '<i class="fas fa-map-pin"></i> Click on map...';
        selectOnMapBtn.disabled = true;
        
        mapClickHandler = function(e) {
            selectedLocation = {
                lat: e.latlng.lat,
                lng: e.latlng.lng
            };
            locationCoords.value = `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`;
            selectOnMapBtn.innerHTML = '<i class="fas fa-map-pin"></i> Click on Map';
            selectOnMapBtn.disabled = false;
            
            // Add a temporary marker
            if (tempMarker) {
                window.campusMap.removeLayer(tempMarker);
            }
            tempMarker = L.marker([selectedLocation.lat, selectedLocation.lng], {
                icon: L.divIcon({
                    className: 'temp-marker',
                    html: '<i class="fas fa-map-pin" style="color: #2c7bb6; font-size: 24px;"></i>',
                    iconSize: [24, 24]
                })
            }).addTo(window.campusMap)
            .bindPopup('Report location selected')
            .openPopup();
        };
        
        window.campusMap.on('click', mapClickHandler);
        alert('Please click anywhere on the map to select the issue location.');
    });
    
    // ===== FORM SUBMISSION =====
    issueForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate location
        if (!selectedLocation) {
            alert('Please select a location first');
            return;
        }
        
        // Validate issue type
        const issueType = document.getElementById('issue-type').value;
        if (!issueType) {
            alert('Please select an issue type');
            return;
        }
        
        // Validate description
        const description = document.getElementById('issue-description').value.trim();
        if (description.length < 10) {
            alert('Please provide a more detailed description (at least 10 characters)');
            return;
        }
        
        // Prepare report data
        const reportData = {
            type: issueType,
            description: description,
            location: selectedLocation,
            timestamp: new Date().toISOString(),
            status: 'pending',
            reporter: 'Anonymous User'
        };
        
        // Show loading state
        const submitBtn = issueForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        try {
            // TODO: Replace with Firebase submission
            console.log('Submitting report:', reportData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            showNotification('Report submitted successfully!');
            
            // Add to issues panel
            addIssueToPanel(reportData);
            
            // Update stats
            updateStatsAfterReport();
            
            // Reset and close
            closeReportModal();
            
        } catch (error) {
            console.error('Error submitting report:', error);
            showNotification('Failed to submit report. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // ===== HELPER FUNCTIONS =====
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Style
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    function addIssueToPanel(reportData) {
        const issuesList = document.getElementById('issues-list');
        if (!issuesList) return;
        
        const issueElement = document.createElement('div');
        issueElement.className = 'issue-item';
        
        // Format time ago
        const timeAgo = getTimeAgo(new Date(reportData.timestamp));
        
        issueElement.innerHTML = `
            <div class="issue-title">
                ${getIssueTypeLabel(reportData.type)}
                <span class="issue-status status-pending">Pending</span>
            </div>
            <div class="issue-description">${reportData.description}</div>
            <div class="issue-meta">
                <span>${timeAgo}</span>
                <span>Just reported</span>
            </div>
        `;
        
        // Add click handler
        issueElement.addEventListener('click', function() {
            if (window.campusMap && reportData.location) {
                window.campusMap.setView([reportData.location.lat, reportData.location.lng], 17);
                
                // Show popup
                L.popup()
                    .setLatLng([reportData.location.lat, reportData.location.lng])
                    .setContent(`
                        <strong>${getIssueTypeLabel(reportData.type)}</strong><br>
                        ${reportData.description}<br>
                        <small><em>Status: Pending</em></small>
                    `)
                    .openOn(window.campusMap);
            }
        });
        
        // Add to top of list
        issuesList.insertBefore(issueElement, issuesList.firstChild);
        
        // Update total count
        const totalIssues = document.getElementById('total-issues');
        totalIssues.textContent = parseInt(totalIssues.textContent) + 1;
    }
    
    function updateStatsAfterReport() {
        const activeCount = document.getElementById('active-count');
        const todayCount = document.getElementById('today-count');
        
        activeCount.textContent = parseInt(activeCount.textContent) + 1;
        todayCount.textContent = parseInt(todayCount.textContent) + 1;
    }
    
    function getIssueTypeLabel(type) {
        const labels = {
            'blocked_path': '🚧 Blocked Pathway',
            'elevator_out': '🛗 Elevator Not Working',
            'ramp_issue': '♿ Ramp Access Problem',
            'parking': '🅿️ Accessible Parking Issue',
            'washroom': '🚻 Washroom Accessibility',
            'lighting': '💡 Poor Lighting',
            'other': '❓ Other Issue'
        };
        return labels[type] || 'Unknown Issue';
    }
    
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .temp-marker {
            background: transparent !important;
            border: none !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('Reports system initialized');
})();