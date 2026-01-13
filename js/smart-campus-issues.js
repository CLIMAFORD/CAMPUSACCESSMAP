/**
 * Smart Campus Access Map - Issues Management Module
 * Handles issue creation, updates, deletion, and rendering
 */

const IssuesManager = (() => {
    let currentIssue = null;

    const createIssue = (formData) => {
        const issue = {
            id: `issue_${Date.now()}`,
            type: formData.type,
            location: formData.location,
            description: formData.description,
            severity: formData.severity || 'low',
            status: 'pending',
            latitude: formData.latitude,
            longitude: formData.longitude,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            reporter: formData.reporter || 'Anonymous',
            attachments: formData.attachments || []
        };

        try {
            // Use HybridStorageManager if available, fall back to StorageManager
            const storage = typeof HybridStorageManager !== 'undefined' ? HybridStorageManager : StorageManager;
            storage.saveIssue(issue);
            
            // Add marker to map if MapManager is available
            if (typeof MapManager !== 'undefined' && MapManager && MapManager.addIssueMarker) {
                MapManager.addIssueMarker(issue);
            } else {
                console.warn('MapManager.addIssueMarker not available');
            }
            
            refreshIssuesList();
            
            // Update analytics if available
            if (typeof updateAnalytics === 'function') {
                updateAnalytics();
            }
            
            return {
                success: true,
                issue: issue,
                message: 'Issue reported successfully!'
            };
        } catch (error) {
            console.error('Error creating issue:', error);
            return {
                success: false,
                message: 'Error reporting issue. Please try again.'
            };
        }
    };

    const updateIssueStatus = (issueId, status, notes = '') => {
        try {
            const issue = StorageManager.getIssueById(issueId);
            if (!issue) {
                return { success: false, message: 'Issue not found' };
            }

            StorageManager.updateIssueStatus(issueId, status);
            
            if (notes) {
                issue.statusNotes = notes;
                issue.lastStatusUpdate = new Date().toISOString();
                StorageManager.saveIssue(issue);
            }

            MapManager.addIssueMarker(issue);
            refreshIssuesList();
            updateAnalytics();
            
            return {
                success: true,
                message: `Issue status updated to ${status}`
            };
        } catch (error) {
            console.error('Error updating issue status:', error);
            return {
                success: false,
                message: 'Error updating issue status'
            };
        }
    };

    const deleteIssue = (issueId) => {
        try {
            StorageManager.deleteIssue(issueId);
            MapManager.removeIssueMarker(issueId);
            refreshIssuesList();
            updateAnalytics();
            
            return {
                success: true,
                message: 'Issue deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting issue:', error);
            return {
                success: false,
                message: 'Error deleting issue'
            };
        }
    };

    const selectIssue = (issueId) => {
        currentIssue = StorageManager.getIssueById(issueId);
        if (currentIssue) {
            MapManager.fitToIssue(currentIssue);
            showIssueDetails();
        }
    };

    const showIssueDetails = () => {
        if (!currentIssue) return;

        const modal = `
            <div class="modal fade" id="issueModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Issue Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Type</label>
                                    <p>${currentIssue.type.replace(/-/g, ' ').toUpperCase()}</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Severity</label>
                                    <p>
                                        <span class="badge bg-${MapManager.getSeverityClass(currentIssue.severity)}">
                                            ${currentIssue.severity.toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Location</label>
                                    <p>${currentIssue.location}</p>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Status</label>
                                    <p>
                                        <span class="badge bg-${MapManager.getStatusClass(currentIssue.status)}">
                                            ${currentIssue.status.replace('-', ' ').toUpperCase()}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">Description</label>
                                <p>${currentIssue.description}</p>
                            </div>

                            <div class="row mb-3 small text-muted">
                                <div class="col-md-6">
                                    <p><strong>Reported:</strong> ${new Date(currentIssue.createdAt).toLocaleString()}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Updated:</strong> ${new Date(currentIssue.updatedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            ${currentIssue.statusNotes ? `
                                <div class="alert alert-info">
                                    <strong>Status Notes:</strong> ${currentIssue.statusNotes}
                                </div>
                            ` : ''}

                            <hr>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Update Status</label>
                                <div class="btn-group w-100" role="group">
                                    <input type="radio" class="btn-check" name="statusUpdate" id="status-pending" value="pending">
                                    <label class="btn btn-outline-warning" for="status-pending">Pending</label>
                                    
                                    <input type="radio" class="btn-check" name="statusUpdate" id="status-in-progress" value="in-progress">
                                    <label class="btn btn-outline-info" for="status-in-progress">In Progress</label>
                                    
                                    <input type="radio" class="btn-check" name="statusUpdate" id="status-resolved" value="resolved" checked>
                                    <label class="btn btn-outline-success" for="status-resolved">Resolved</label>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">Status Notes</label>
                                <textarea class="form-control" id="statusNotesInput" rows="3" 
                                          placeholder="Add notes about this status update...">${currentIssue.statusNotes || ''}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-danger" onclick="IssuesManager.confirmDelete('${currentIssue.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                            <button type="button" class="btn btn-primary" onclick="IssuesManager.saveStatus('${currentIssue.id}')">
                                <i class="fas fa-save"></i> Update Status
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove old modal if exists
        const oldModal = document.getElementById('issueModal');
        if (oldModal) oldModal.remove();

        // Add new modal to body
        document.body.insertAdjacentHTML('beforeend', modal);

        // Show modal
        const modalElement = new bootstrap.Modal(document.getElementById('issueModal'));
        modalElement.show();
    };

    const saveStatus = (issueId) => {
        const statusRadio = document.querySelector('input[name="statusUpdate"]:checked');
        const notes = document.getElementById('statusNotesInput').value;
        
        if (!statusRadio) {
            NotificationManager.show('Please select a status', 'warning');
            return;
        }

        const result = updateIssueStatus(issueId, statusRadio.value, notes);
        
        if (result.success) {
            NotificationManager.show(result.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('issueModal')).hide();
        } else {
            NotificationManager.show(result.message, 'danger');
        }
    };

    const confirmDelete = (issueId) => {
        if (confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
            const result = deleteIssue(issueId);
            if (result.success) {
                NotificationManager.show(result.message, 'success');
                bootstrap.Modal.getInstance(document.getElementById('issueModal')).hide();
            } else {
                NotificationManager.show(result.message, 'danger');
            }
        }
    };

    const refreshIssuesList = () => {
        const issuesList = document.getElementById('issuesList');
        if (!issuesList) return;

        const issues = StorageManager.getIssues();
        
        // Render all issues on the map
        if (typeof MapManager !== 'undefined' && MapManager && MapManager.renderAllIssues) {
            MapManager.renderAllIssues();
        }
        
        if (issues.length === 0) {
            issuesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No issues reported yet</p>
                    <small>Use the Report Issue tab to add one</small>
                </div>
            `;
            return;
        }

        issuesList.innerHTML = issues.map(issue => `
            <div class="issue-card severity-${issue.severity}">
                <div class="issue-card-header">
                    <h6 class="issue-card-title">${issue.type.replace(/-/g, ' ').toUpperCase()}</h6>
                    <span class="issue-card-status ${issue.status}">
                        ${issue.status.replace('-', ' ')}
                    </span>
                </div>
                <div class="issue-card-meta">
                    <i class="fas fa-map-marker-alt"></i> ${issue.location}
                </div>
                <div class="issue-card-meta">
                    <i class="fas fa-clock"></i> ${new Date(issue.createdAt).toLocaleDateString()}
                </div>
                <p class="issue-card-description">${issue.description.substring(0, 100)}${issue.description.length > 100 ? '...' : ''}</p>
                <div class="issue-card-actions">
                    <button class="btn-view" onclick="IssuesManager.selectIssue('${issue.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-update" onclick="IssuesManager.selectIssue('${issue.id}')">
                        <i class="fas fa-sync"></i> Update
                    </button>
                </div>
            </div>
        `).join('');
    };

    return {
        createIssue,
        updateIssueStatus,
        deleteIssue,
        selectIssue,
        showIssueDetails,
        saveStatus,
        confirmDelete,
        refreshIssuesList,
        get currentIssue() {
            return currentIssue;
        }
    };
})();

// Initialize issues list on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        IssuesManager.refreshIssuesList();
    }, 100);
});
