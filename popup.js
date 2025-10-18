// Popup script for Reddit Helper extension

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const scrollDownButton = document.getElementById('scrollDownButton');
    const scrollUpButton = document.getElementById('scrollUpButton');
    const scrollToTopButton = document.getElementById('scrollToTopButton');
    const goHomeButton = document.getElementById('goHomeButton');
    const refreshButton = document.getElementById('refreshButton');
    const testButton = document.getElementById('testButton');
    const loginButton = document.getElementById('loginButton');
    const checkAuthButton = document.getElementById('checkAuthButton');
    const logoutButton = document.getElementById('logoutButton');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const authStatus = document.getElementById('authStatus');
    const loginStatusText = document.getElementById('loginStatusText');
    const autoBrowseButton = document.getElementById('autoBrowseButton');
    const stopBrowseButton = document.getElementById('stopBrowseButton');
    const browseHomeFeedButton = document.getElementById('browseHomeFeedButton');
    const browseTimeInput = document.getElementById('browseTime');
    const browseStatus = document.getElementById('browseStatus');
    const status = document.getElementById('status');
    const startApiPollingButton = document.getElementById('startApiPollingButton');
    const stopApiPollingButton = document.getElementById('stopApiPollingButton');
    const apiStatusText = document.getElementById('apiStatusText');
    const versionNumber = document.getElementById('versionNumber');

    // Load and display version number from manifest
    function loadVersion() {
        const manifest = chrome.runtime.getManifest();
        if (manifest && manifest.version) {
            versionNumber.textContent = manifest.version;
        }
    }

    // Function to show status messages
    function showStatus(message, isError = false) {
        status.textContent = message;
        status.className = `status ${isError ? 'error' : 'success'}`;
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }

    // Function to send message to content script
    function sendToReddit(action, data = {}) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                // Check if we're on Reddit
                if (tabs[0].url && tabs[0].url.includes('reddit.com')) {
                    // Send message directly to content script
                    console.log('Sending message to tab:', tabs[0].id, 'Action:', action);
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'executeOnReddit',
                        command: action,
                        data: data
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Message sending failed:', chrome.runtime.lastError);
                            showStatus(`Error: ${chrome.runtime.lastError.message}`, true);
                        } else if (response) {
                            console.log('Response:', response);
                            if (response.success) {
                                showStatus(response.message || 'Action completed');

                                // Handle auth check response
                                if (action === 'checkAuth' && response.username) {
                                    updateAuthStatus(response.username);
                                }
                            } else {
                                showStatus(response.message || 'Action failed', true);

                                // Handle failed auth check
                                if (action === 'checkAuth') {
                                    updateAuthStatus(null);
                                }
                            }
                        } else {
                            console.error('No response received');
                            showStatus('No response from content script', true);
                        }
                    });
                } else {
                    // Navigate to Reddit first
                    chrome.tabs.update(tabs[0].id, {url: 'https://www.reddit.com'}, () => {
                        showStatus('Navigating to Reddit...');
                        // Wait for page to load, then try again
                        setTimeout(() => {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: 'executeOnReddit',
                                command: action,
                                data: data
                            });
                        }, 3000);
                    });
                }
            }
        });
    }

    // Search functionality
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            showStatus('Please enter a search term', true);
            return;
        }

        sendToReddit('search', { query: searchTerm });
        showStatus(`Searching for "${searchTerm}"...`);
        searchInput.value = ''; // Clear input after search
    });

    // Allow Enter key to trigger search
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });

    // Scroll controls
    scrollDownButton.addEventListener('click', function() {
        sendToReddit('scrollDown');
        showStatus('Scrolling down...');
    });

    scrollUpButton.addEventListener('click', function() {
        sendToReddit('scrollUp');
        showStatus('Scrolling up...');
    });

    scrollToTopButton.addEventListener('click', function() {
        sendToReddit('scrollToTop');
        showStatus('Going to top...');
    });

    // Navigation controls
    goHomeButton.addEventListener('click', function() {
        sendToReddit('goHome');
        showStatus('Going to Reddit home...');
    });

    refreshButton.addEventListener('click', function() {
        sendToReddit('refresh');
        showStatus('Refreshing page...');
    });

    // Authentication check functionality
    checkAuthButton.addEventListener('click', function() {
        sendToReddit('checkAuth');
        showStatus('Checking login status...');
        setTimeout(updateAuthStatus, 1000); // Update buttons after check
    });

    // Logout functionality
    logoutButton.addEventListener('click', function() {
        sendToReddit('logout');
        showStatus('Logging out...');
        setTimeout(updateAuthStatus, 1000); // Update buttons after logout
    });

    // Login functionality
    loginButton.addEventListener('click', function() {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            showStatus('Please enter both email and password', true);
            return;
        }

        sendToReddit('login', { email: email, password: password });
        showStatus('Logging in to Reddit...');

        // Clear password field for security
        loginPassword.value = '';

        setTimeout(updateAuthStatus, 2000); // Update buttons after login attempt
    });

    // Test connection button
    testButton.addEventListener('click', function() {
        sendToReddit('test');
        showStatus('Testing connection...');
    });

    // Auto browse functionality
    let browseInterval;

    autoBrowseButton.addEventListener('click', function() {
        const browseTimeMinutes = parseInt(browseTimeInput.value) || 5;
        sendToReddit('startAutoBrowse', { duration: browseTimeMinutes });

        // Update UI
        autoBrowseButton.style.display = 'none';
        stopBrowseButton.style.display = 'block';
        browseTimeInput.disabled = true;

        showStatus(`Starting auto browse for ${browseTimeMinutes} minutes...`);

        // Update status periodically
        let remainingTime = browseTimeMinutes * 60; // Convert to seconds
        browseStatus.textContent = `Auto browsing... ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} remaining`;

        browseInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime > 0) {
                browseStatus.textContent = `Auto browsing... ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} remaining`;
            } else {
                // Auto browse finished
                stopAutoBrowse();
            }
        }, 1000);
    });

    stopBrowseButton.addEventListener('click', function() {
        sendToReddit('stopAutoBrowse');
        stopAutoBrowse();
        showStatus('Auto browse stopped');
    });

    // Browse home feed functionality
    browseHomeFeedButton.addEventListener('click', function() {
        const browseTimeMinutes = parseInt(browseTimeInput.value) || 5;
        sendToReddit('browseHomeFeed', { duration: browseTimeMinutes });
        showStatus(`Starting home feed browsing for ${browseTimeMinutes} minutes...`);
    });

    // API Server controls
    startApiPollingButton.addEventListener('click', function() {
        sendToReddit('startApiPolling');
        showStatus('Starting API polling...');
        updateApiStatus();
    });

    stopApiPollingButton.addEventListener('click', function() {
        sendToReddit('stopApiPolling');
        showStatus('Stopping API polling...');
        updateApiStatus();
    });

    // Function to update API status
    function updateApiStatus() {
        // Show checking status immediately
        apiStatusText.textContent = '🔄 Checking API...';
        apiStatusText.style.color = '#6c757d';

        setTimeout(() => {
            sendToReddit('getApiStatus', {}, (response) => {
                if (response && response.success) {
                    const isPolling = response.isPolling;
                    if (isPolling) {
                        apiStatusText.textContent = '🟢 API Ready for Commands';
                        apiStatusText.style.color = '#28a745';
                        showStatus('API polling active - ready for remote commands!', false);
                    } else {
                        apiStatusText.textContent = '🔴 API Polling Stopped';
                        apiStatusText.style.color = '#dc3545';
                        // Try to restart it automatically
                        sendToReddit('startApiPolling');
                        setTimeout(updateApiStatus, 1000); // Check again after attempting restart
                    }
                    updateApiButtons(isPolling);
                } else {
                    apiStatusText.textContent = '⚠️ API Status Unknown';
                    apiStatusText.style.color = '#ffc107';
                    showStatus('Could not connect to content script', true);
                    updateApiButtons(false);
                }
            });
        }, 500);
    }

    // Function to update API button visibility based on polling status
    function updateApiButtons(isPolling) {
        if (isPolling) {
            startApiPollingButton.style.display = 'none';
            stopApiPollingButton.style.display = 'block';
        } else {
            startApiPollingButton.style.display = 'block';
            stopApiPollingButton.style.display = 'none';
        }
    }

    // Function to update auth status and button visibility
    function updateAuthStatus() {
        sendToReddit('checkAuthentication', {}, (response) => {
            if (response && response.success && response.username) {
                // User is logged in
                authStatus.style.display = 'block';
                loginStatusText.textContent = `Logged in as: ${response.username}`;
                updateAuthButtons(true, response.username);
            } else {
                // User is not logged in
                authStatus.style.display = 'none';
                updateAuthButtons(false);
            }
        });
    }

    // Function to update auth button visibility based on login status
    function updateAuthButtons(isLoggedIn, username = null) {
        if (isLoggedIn) {
            // Show logout button, hide login form
            loginEmail.style.display = 'none';
            loginPassword.style.display = 'none';
            loginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            checkAuthButton.textContent = `Refresh Status (${username})`;
        } else {
            // Show login form, hide logout button
            loginEmail.style.display = 'block';
            loginPassword.style.display = 'block';
            loginButton.style.display = 'block';
            logoutButton.style.display = 'none';
            checkAuthButton.textContent = 'Check Login Status';
        }
    }

    function stopAutoBrowse() {
        // Update UI
        autoBrowseButton.style.display = 'block';
        stopBrowseButton.style.display = 'none';
        browseTimeInput.disabled = false;
        browseStatus.textContent = '';

        // Clear interval
        if (browseInterval) {
            clearInterval(browseInterval);
            browseInterval = null;
        }
    }

    // Load version number
    loadVersion();

    // Check if we're on Reddit and show appropriate status
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            console.log('Current tab URL:', tabs[0].url);
            const isOnReddit = tabs[0].url && tabs[0].url.includes('reddit.com');
            if (!isOnReddit) {
                showStatus('Navigate to Reddit to use all features', false);
                // Still update button states even when not on Reddit
                updateApiStatus();
                updateAuthStatus();
            } else {
                showStatus('Ready to interact with Reddit!');
                // Update all statuses when on Reddit
                updateApiStatus();
                updateAuthStatus();
            }
        }
    });
});