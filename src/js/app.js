// src/js/app.js
// Main Smart Campus Application Logic

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Smart Campus App Initialized');
        
        // Initialize components
        initializeFilters();
        initializeLiveUpdates();
        initializeSampleData();
        
        // Set initial time
        updateTime();
        setInterval(updateTime, 60000); // Update every minute
    });
    
    // ===== FILTER SYSTEM =====
    function initializeFilters() {
        const filterRadios = document.querySelectorAll('input[name="status"]');
        
        filterRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const status = this.value;
                console.log(`Filter changed to: ${status}`);
                
                // Update active filter styling
                filterRadios.forEach(r => {
                    r.parentElement.style.background = 'transparent';
                    r.parentElement.style.fontWeight = 'normal';
                });
                
                this.parentElement.style.background = '#e3f2fd';
                this.parentElement.style.fontWeight = '600';
                
                // Filter issues
                filterIssuesByStatus(status);
            });
        });
        
        // Set initial active filter
        if (filterRadios[0]) {
            filterRadios[0].parentElement.style.background = '#e3f2fd';
            filterRadios[0].parentElement.style.fontWeight = '600';
        }
    }
    
    function filterIssuesByStatus(status) {
        // This will filter issues when we have Firebase data
        console.log(`Filtering issues by status: ${status}`);
    }
    
    // ===== LIVE UPDATES =====
    function initializeLiveUpdates() {
        const liveStatus = document.getElementById('live-status');
        const statusIcon = liveStatus.querySelector('.status-live');
        
        // Animate the live status indicator
        setInterval(() => {
            statusIcon.style.opacity = statusIcon.style.opacity === '0.5' ? '1' : '0.5';
        }, 1000);
        
        // Simulate live updates
        setInterval(() => {
            updateTime();
            
            // Randomly update stats (demo only)
            if (Math.random() > 0.7) {
                updateRandomStat();
            }
        }, 30000);
    }
    
    function updateTime() {
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
        document.getElementById('update-time').textContent = timeString;
    }
    
    function updateRandomStat() {
        // Demo function - will be replaced with real data
        const stats = {
            'active-count': () => {
                const elem = document.getElementById('active-count');
                const current = parseInt(elem.textContent);
                elem.textContent = Math.max(0, current + (Math.random() > 0.5 ? 1 : -1));
            },
            'response-rate': () => {
                const elem = document.getElementById('response-rate');
                const current = parseInt(elem.textContent);
                elem.textContent = Math.min(100, Math.max(85, current + (Math.random() > 0.5 ? 1 : -1))) + '%';
            }
        };
        
        const statKeys = Object.keys(stats);
        const randomKey = statKeys[Math.floor(Math.random() * statKeys.length)];
        if (stats[randomKey]) stats[randomKey]();
    }
    
    // ===== SAMPLE DATA =====
    function initializeSampleData() {
        // Set sample data after delay
        setTimeout(function() {
            document.getElementById('active-count').textContent = '12';
            document.getElementById('resolved-count').textContent = '48';
            document.getElementById('avg-time').textContent = '4.2';
            document.getElementById('total-issues').textContent = '60';
            document.getElementById('today-count').textContent = '8';
            document.getElementById('response-rate').textContent = '92%';
            document.getElementById('avg-resolution').textContent = '4.2h';
        }, 2000);
    }
    
    // ===== EXPORT FUNCTIONS =====
    window.app = {
        updateTime: updateTime
    };
    
    console.log('App initialized successfully');
})();