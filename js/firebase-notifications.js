/**
 * Smart Campus Access Map - Firebase Notifications Module
 * Handles real-time notifications for maintenance teams
 * Supports push notifications, email alerts, and in-app notifications
 */

const FirebaseNotifications = (() => {
    let messaging = null;
    let isInitialized = false;
    let subscribers = [];

    /**
     * Initialize Firebase Cloud Messaging
     */
    async function initialize() {
        if (!FIREBASE_ENABLED) {
            console.warn('Firebase not configured. Notifications disabled.');
            return false;
        }

        try {
            messaging = firebase.messaging();
            
            // Request permission for notifications
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('✅ Notifications permission granted');
                    
                    // Get FCM token
                    const token = await messaging.getToken({
                        vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE'
                    });
                    
                    console.log('📱 Device FCM Token:', token);
                    
                    // Save token to localStorage
                    localStorage.setItem('scam_fcm_token', token);
                    
                    // Listen for messages
                    setupMessageListener();
                }
            } catch (error) {
                console.warn('Notification permission denied:', error);
            }

            isInitialized = true;
            return true;
        } catch (error) {
            console.error('FCM initialization failed:', error);
            return false;
        }
    }

    /**
     * Setup message listener for foreground notifications
     */
    function setupMessageListener() {
        if (!messaging) return;

        messaging.onMessage((payload) => {
            console.log('📬 Message received in foreground:', payload);
            
            const notification = {
                title: payload.notification?.title || 'New Alert',
                body: payload.notification?.body || '',
                data: payload.data || {},
                timestamp: new Date().toISOString()
            };

            // Show notification
            showNotification(notification);

            // Trigger event
            window.dispatchEvent(new CustomEvent('scam:firebaseNotification', {
                detail: notification
            }));

            // Call subscribers
            subscribers.forEach(callback => callback(notification));
        });
    }

    /**
     * Show browser notification
     */
    function showNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.body,
                icon: '/images/logo.png',
                tag: 'scam-notification',
                requireInteraction: false
            });
        }
    }

    /**
     * Send notification to maintenance team (server-side triggered)
     * In production, this would be called by Cloud Functions
     */
    async function notifyMaintenanceTeam(issue) {
        if (!FIREBASE_ENABLED) return;

        try {
            // Create notification record in Firestore
            await firebase.firestore().collection('notifications').add({
                type: 'new_issue',
                issue: issue,
                severity: issue.severity,
                recipients: 'maintenance_team',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });

            console.log('📢 Maintenance team notified about issue:', issue.id);
            return true;
        } catch (error) {
            console.error('Error notifying maintenance team:', error);
            return false;
        }
    }

    /**
     * Get unread notifications
     */
    async function getUnreadNotifications() {
        if (!FIREBASE_ENABLED) return [];

        try {
            const db = firebase.firestore();
            const userId = localStorage.getItem('scam_user_id');
            
            const snapshot = await db.collection('notifications')
                .where('read', '==', false)
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            const notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });

            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    /**
     * Mark notification as read
     */
    async function markAsRead(notificationId) {
        if (!FIREBASE_ENABLED) return false;

        try {
            await firebase.firestore().collection('notifications').doc(notificationId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Subscribe to notification updates
     */
    function subscribe(callback) {
        subscribers.push(callback);
        return () => {
            subscribers = subscribers.filter(cb => cb !== callback);
        };
    }

    /**
     * Listen for high-severity issues in real-time
     */
    function listenForHighSeverityIssues(callback) {
        if (!FIREBASE_ENABLED) return () => {};

        try {
            const db = firebase.firestore();
            return db.collection('issues')
                .where('severity', '==', 'high')
                .where('status', '==', 'pending')
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const issue = { id: change.doc.id, ...change.doc.data() };
                            callback({
                                type: 'high_severity_alert',
                                issue: issue,
                                message: `🚨 High Priority: ${issue.type} at ${issue.location}`
                            });
                        }
                    });
                });
        } catch (error) {
            console.error('Error setting up high severity listener:', error);
            return () => {};
        }
    }

    /**
     * Send email notification to maintenance staff
     * Calls Firebase Cloud Function
     */
    async function sendEmailAlert(issue, emailAddresses) {
        if (!FIREBASE_ENABLED) return false;

        try {
            const functions = firebase.functions();
            const sendEmail = functions.httpsCallable('sendEmailAlert');

            const result = await sendEmail({
                issue: issue,
                recipients: emailAddresses,
                subject: `New Accessibility Issue: ${issue.type}`,
                template: 'maintenance_alert'
            });

            console.log('📧 Email alert sent:', result.data);
            return true;
        } catch (error) {
            console.error('Error sending email alert:', error);
            return false;
        }
    }

    /**
     * Create SMS alert (requires Twilio integration)
     * Calls Firebase Cloud Function
     */
    async function sendSMSAlert(issue, phoneNumbers) {
        if (!FIREBASE_ENABLED) return false;

        try {
            const functions = firebase.functions();
            const sendSMS = functions.httpsCallable('sendSMSAlert');

            const result = await sendSMS({
                issue: issue,
                recipients: phoneNumbers,
                message: `Accessibility Issue: ${issue.type} at ${issue.location}. Severity: ${issue.severity}`
            });

            console.log('📱 SMS alert sent:', result.data);
            return true;
        } catch (error) {
            console.error('Error sending SMS alert:', error);
            return false;
        }
    }

    /**
     * Get notification statistics
     */
    async function getNotificationStats() {
        if (!FIREBASE_ENABLED) return null;

        try {
            const db = firebase.firestore();
            const userId = localStorage.getItem('scam_user_id');

            const allSnapshot = await db.collection('notifications')
                .where('userId', '==', userId)
                .get();

            const unreadSnapshot = await db.collection('notifications')
                .where('userId', '==', userId)
                .where('read', '==', false)
                .get();

            return {
                total: allSnapshot.size,
                unread: unreadSnapshot.size,
                read: allSnapshot.size - unreadSnapshot.size
            };
        } catch (error) {
            console.error('Error fetching notification stats:', error);
            return null;
        }
    }

    return {
        initialize,
        showNotification,
        notifyMaintenanceTeam,
        getUnreadNotifications,
        markAsRead,
        subscribe,
        listenForHighSeverityIssues,
        sendEmailAlert,
        sendSMSAlert,
        getNotificationStats
    };
})();
