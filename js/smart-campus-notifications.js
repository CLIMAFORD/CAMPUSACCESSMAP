/**
 * Smart Campus Access Map - Notifications Module
 * Handles toast notifications and user alerts
 */

const NotificationManager = (() => {
    const show = (message, type = 'info', duration = 4000) => {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toastId = `toast_${Date.now()}`;
        const toastHTML = `
            <div id="${toastId}" class="toast ${type}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex align-items-center gap-2">
                    <div class="toast-body">
                        <i class="fas fa-${getIcon(type)}"></i> ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white ms-auto me-2" 
                            data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);
        
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: duration
        });

        toast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    };

    const getIcon = (type) => {
        const icons = {
            'success': 'check-circle',
            'danger': 'times-circle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'circle';
    };

    const success = (message, duration = 3000) => show(message, 'success', duration);
    const error = (message, duration = 4000) => show(message, 'danger', duration);
    const warning = (message, duration = 3500) => show(message, 'warning', duration);
    const info = (message, duration = 3000) => show(message, 'info', duration);

    return {
        show,
        success,
        error,
        warning,
        info
    };
})();
