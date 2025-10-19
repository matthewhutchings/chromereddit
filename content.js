// Content script for Reddit Helper extension

console.log('Reddit Helper content script loaded');

// Function to find the search input element in shadow DOM
function findSearchInput() {
    console.log('🔍 Looking for search input...');

    // Look for the faceplate-search-input custom element
    const faceplateSearch = document.querySelector('faceplate-search-input');
    if (faceplateSearch) {
        console.log('✅ Found faceplate-search-input element:', faceplateSearch);

        // Check if it has shadow root
        if (faceplateSearch.shadowRoot) {
            console.log('🌟 Shadow root found, looking inside...');

            // Look for input inside shadow root
            const shadowInput = faceplateSearch.shadowRoot.querySelector('input');
            if (shadowInput) {
                console.log('✅ Found input in shadow DOM:', shadowInput);
                return { element: faceplateSearch, input: shadowInput };
            }
        }

        // If no shadow root, try to access the input directly
        console.log('⚠️ No shadow root found, trying direct access...');
        return { element: faceplateSearch, input: faceplateSearch };
    }

    // Fallback to regular input search
    const regularInputs = [
        'input[name="q"]',
        'input[placeholder*="Search"]',
        'input[type="search"]',
        '#search-input'
    ];

    for (const selector of regularInputs) {
        const element = document.querySelector(selector);
        if (element) {
            console.log('✅ Found regular search input with selector:', selector);
            return { element: element, input: element };
        }
    }

    console.log('❌ No search input found');
    return null;
}

// Function to perform search with shadow DOM support
function performSearch(query) {
    console.log('🚀 Attempting to search for:', query);

    const searchResult = findSearchInput();
    if (!searchResult) {
        console.error('❌ Could not find search input');
        return false;
    }

    console.log('✅ Found search components:', searchResult);

    // Use the shadow DOM approach
    searchWithShadowDOM(searchResult.element, searchResult.input, query);

    return true;
}

// Function to interact with shadow DOM search input
async function searchWithShadowDOM(faceplateElement, inputElement, query) {
    console.log('🌟 Starting shadow DOM search interaction...');

    // First, click on the faceplate-search-input to activate it
    console.log('🖱️ Clicking on faceplate-search-input...');
    faceplateElement.click();
    faceplateElement.focus();

    // Wait a moment for the element to become active
    await new Promise(resolve => setTimeout(resolve, 300));

    // Try to focus the actual input inside shadow DOM
    if (inputElement && inputElement !== faceplateElement) {
        console.log('🎯 Focusing on shadow DOM input...');
        inputElement.focus();
        inputElement.click();
    }

    // Wait another moment
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('⌨️ Starting to type query...');

    // Type the query character by character
    await typeInShadowInput(faceplateElement, inputElement, query);
}

// Function to type in shadow DOM input
async function typeInShadowInput(faceplateElement, inputElement, text) {
    console.log('🔤 Starting to type:', text);

    // Clear any existing value
    if (inputElement && inputElement.value !== undefined) {
        inputElement.value = '';
    }

    // Dispatch focus event
    const focusEvent = new Event('focus', { bubbles: true });
    if (inputElement && inputElement.dispatchEvent) {
        inputElement.dispatchEvent(focusEvent);
    }
    faceplateElement.dispatchEvent(focusEvent);

    // Type each character
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        console.log(`⌨️ Typing character: "${char}" (${i + 1}/${text.length})`);

        // Create keyboard events
        const keyboardEvents = createKeyboardEventsForChar(char);

        // Dispatch events on both elements
        for (const event of keyboardEvents) {
            if (inputElement && inputElement.dispatchEvent) {
                inputElement.dispatchEvent(event.cloneNode ? event.cloneNode() : new event.constructor(event.type, event));
            }
            faceplateElement.dispatchEvent(event);
        }

        // Update the input value
        if (inputElement && inputElement.value !== undefined) {
            inputElement.value += char;
        }

        // Dispatch input event
        const inputEvent = new Event('input', { bubbles: true });
        if (inputElement && inputElement.dispatchEvent) {
            inputElement.dispatchEvent(inputEvent);
        }
        faceplateElement.dispatchEvent(inputEvent);

        // Human-like delay
        const delay = Math.random() * 120 + 80;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Dispatch change event
    const changeEvent = new Event('change', { bubbles: true });
    if (inputElement && inputElement.dispatchEvent) {
        inputElement.dispatchEvent(changeEvent);
    }
    faceplateElement.dispatchEvent(changeEvent);

    // Wait before submitting
    const finalDelay = Math.random() * 700 + 500;
    console.log(`⏳ Waiting ${Math.round(finalDelay)}ms before submitting...`);

    setTimeout(() => {
        console.log('🚀 Submitting search...');
        submitShadowSearch(faceplateElement, inputElement);
    }, finalDelay);
}

// Function to create keyboard events for a character
function createKeyboardEventsForChar(char) {
    const charCode = char.charCodeAt(0);
    const keyCode = char.toUpperCase().charCodeAt(0);

    return [
        new KeyboardEvent('keydown', {
            key: char,
            code: `Key${char.toUpperCase()}`,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        }),
        new KeyboardEvent('keypress', {
            key: char,
            code: `Key${char.toUpperCase()}`,
            keyCode: charCode,
            which: charCode,
            bubbles: true,
            cancelable: true
        }),
        new KeyboardEvent('keyup', {
            key: char,
            code: `Key${char.toUpperCase()}`,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        })
    ];
}

// Function to submit search in shadow DOM
function submitShadowSearch(faceplateElement, inputElement) {
    console.log('🎯 Submitting shadow DOM search...');

    // Create Enter key events
    const enterEvents = [
        new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        }),
        new KeyboardEvent('keypress', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        }),
        new KeyboardEvent('keyup', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        })
    ];

    // Dispatch Enter events on both elements
    for (const event of enterEvents) {
        if (inputElement && inputElement.dispatchEvent) {
            inputElement.dispatchEvent(event.cloneNode ? event.cloneNode() : new event.constructor(event.type, event));
        }
        faceplateElement.dispatchEvent(event);
    }

    // Try form submission as backup
    const form = faceplateElement.closest('form');
    if (form) {
        console.log('📝 Found form, submitting...');
        form.submit();
    }

    console.log('✅ Search submission complete');
}

// OLD TAB NAVIGATION FUNCTIONS (Commented out - now using shadow DOM approach)
/*
// Function to navigate to search box using Tab key and then type
async function navigateToSearchWithTabs(query) {
    console.log('🔍 Starting Tab navigation to search box...');
    console.log('📋 Current active element before starting:', document.activeElement);

    // Focus on the document body first to start tabbing from the beginning
    document.body.focus();
    console.log('📌 Focused on document body');

    // Get all focusable elements for debugging
    const focusableElements = getFocusableElements();
    console.log('🎯 Found', focusableElements.length, 'focusable elements');

    // Press Tab 3 times to get to the search box
    for (let i = 1; i <= 3; i++) {
        console.log(`\n⌨️  Pressing Tab ${i}/3...`);
        console.log('📍 Current active element before Tab:', document.activeElement.tagName, document.activeElement.className || 'no-class');

        // Create multiple Tab key events for better compatibility
        const tabKeydownEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            code: 'Tab',
            keyCode: 9,
            which: 9,
            bubbles: true,
            cancelable: true
        });

        const tabKeypressEvent = new KeyboardEvent('keypress', {
            key: 'Tab',
            code: 'Tab',
            keyCode: 9,
            which: 9,
            bubbles: true,
            cancelable: true
        });

        const tabKeyupEvent = new KeyboardEvent('keyup', {
            key: 'Tab',
            code: 'Tab',
            keyCode: 9,
            which: 9,
            bubbles: true,
            cancelable: true
        });

        // Dispatch all Tab events
        console.log('🚀 Dispatching Tab keydown event...');
        const keydownResult = document.activeElement.dispatchEvent(tabKeydownEvent);
        console.log('📤 Tab keydown dispatched, result:', keydownResult);

        console.log('🚀 Dispatching Tab keypress event...');
        const keypressResult = document.activeElement.dispatchEvent(tabKeypressEvent);
        console.log('📤 Tab keypress dispatched, result:', keypressResult);

        console.log('🚀 Dispatching Tab keyup event...');
        const keyupResult = document.activeElement.dispatchEvent(tabKeyupEvent);
        console.log('📤 Tab keyup dispatched, result:', keyupResult);

        // Manually simulate tab behavior by moving focus
        const currentIndex = focusableElements.indexOf(document.activeElement);
        console.log('📊 Current element index in focusable list:', currentIndex);

        if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
            const nextElement = focusableElements[currentIndex + 1];
            console.log('➡️  Moving focus to next element:', nextElement.tagName, nextElement.className || 'no-class');
            nextElement.focus();
            console.log('✅ Focus moved to:', document.activeElement.tagName, document.activeElement.className || 'no-class');
        } else {
            console.log('⚠️  Could not find next focusable element');
        }

        // Wait between tab presses
        console.log('⏳ Waiting 200ms before next Tab...');
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n🎯 Tab navigation complete!');
    console.log('📍 Final active element:', document.activeElement.tagName, document.activeElement.className || 'no-class');
    console.log('🔤 Is it an input?', document.activeElement.tagName === 'INPUT');
    console.log('🔍 Input type:', document.activeElement.type || 'not-an-input');
    console.log('📝 Placeholder:', document.activeElement.placeholder || 'no-placeholder');

    console.log('⌨️  Starting to type query...');

    // Now type the query character by character
    await typeCharacterByCharacter(document.activeElement, query);
}

// Function to get all focusable elements on the page
function getFocusableElements() {
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ];

    return Array.from(document.querySelectorAll(focusableSelectors.join(', ')))
        .filter(element => {
            return element.offsetWidth > 0 &&
                   element.offsetHeight > 0 &&
                   !element.hidden;
        });
}// Function to simulate clicking an element
function clickElement(element) {
    console.log('Clicking search input...');

    // Create mouse events
    const mouseEvents = [
        new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
        new MouseEvent('mouseup', { bubbles: true, cancelable: true }),
        new MouseEvent('click', { bubbles: true, cancelable: true })
    ];

    // Dispatch the mouse events
    mouseEvents.forEach(event => {
        element.dispatchEvent(event);
    });

    // Also focus the element
    element.focus();
}

// Function to type characters one by one with human-like delays
async function typeCharacterByCharacter(inputElement, text) {
    console.log('Starting to type:', text);

    // Clear any existing value
    inputElement.value = '';
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));

    // Type each character with realistic keyboard events
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charCode = char.charCodeAt(0);
        const keyCode = char.toUpperCase().charCodeAt(0);

        // Create keyboard events for this character
        const keydownEvent = new KeyboardEvent('keydown', {
            key: char,
            code: `Key${char.toUpperCase()}`,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        });

        const keypressEvent = new KeyboardEvent('keypress', {
            key: char,
            code: `Key${char.toUpperCase()}`,
            keyCode: charCode,
            which: charCode,
            bubbles: true,
            cancelable: true
        });

        const keyupEvent = new KeyboardEvent('keyup', {
            key: char,
            code: `Key${char.toUpperCase()}`,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true
        });

        // Dispatch the keyboard events
        inputElement.dispatchEvent(keydownEvent);
        inputElement.dispatchEvent(keypressEvent);

        // Add the character to the input value
        inputElement.value += char;

        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        inputElement.dispatchEvent(inputEvent);

        // Dispatch keyup
        inputElement.dispatchEvent(keyupEvent);

        // Random delay between 80-200ms per character to simulate human typing
        const delay = Math.random() * 120 + 80;
        await new Promise(resolve => setTimeout(resolve, delay));

        console.log(`Typed character: "${char}" (${i + 1}/${text.length})`);
    }

    // Trigger change event after all characters are typed
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    inputElement.dispatchEvent(changeEvent);

    // Wait a moment after finishing typing before submitting
    const finalDelay = Math.random() * 700 + 500; // 500-1200ms delay
    console.log(`Waiting ${Math.round(finalDelay)}ms before submitting...`);

    setTimeout(() => {
        console.log('Submitting search...');
        submitSearch(inputElement);
    }, finalDelay);
}

// Function to submit the search
function submitSearch(inputElement) {
    console.log('Submitting search by pressing Enter...');

    // Just press Enter - no need to click since we're already focused from Tab navigation
    const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
    });

    const keypressEvent = new KeyboardEvent('keypress', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
    });

    const keyupEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
    });

    // Dispatch keyboard events in sequence
    inputElement.dispatchEvent(keydownEvent);
    inputElement.dispatchEvent(keypressEvent);
    inputElement.dispatchEvent(keyupEvent);

    // Also try form submission if the input is in a form
    const form = inputElement.closest('form');
    if (form) {
        console.log('Found form, submitting...');
        form.submit();
    }

    console.log('Search submitted successfully');
}
*/
// END OF COMMENTED OLD FUNCTIONS

// Smooth scrolling functions
function smoothScrollDown() {
    const scrollAmount = window.innerHeight * 0.8; // Scroll 80% of viewport height
    window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
    });
}

function smoothScrollUp() {
    const scrollAmount = window.innerHeight * 0.8;
    window.scrollBy({
        top: -scrollAmount,
        behavior: 'smooth'
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Navigation functions
function goToRedditHome() {
    if (window.location.hostname.includes('reddit.com')) {
        window.location.href = 'https://www.reddit.com';
    }
}

function refreshPage() {
    window.location.reload();
}

// Login function
function performLogin(email, password) {
    console.log('Attempting to login with email:', email);

    // Check if we're on the login page
    if (!window.location.href.includes('/login')) {
        console.log('Navigating to login page...');
        window.location.href = 'https://www.reddit.com/login/';

        // Wait for page to load, then try login twice
        setTimeout(() => {
            console.log('First login attempt after navigation...');
            performLoginOnPage(email, password);

            // Second attempt after a short delay
            setTimeout(() => {
                console.log('Second login attempt after navigation...');
                performLoginOnPage(email, password);
            }, 2000);
        }, 3000);
        return true;
    } else {
        console.log('Already on login page, attempting login twice...');
        // First attempt
        setTimeout(() => {
            console.log('First login attempt...');
            performLoginOnPage(email, password);

            // Second attempt after a short delay
            setTimeout(() => {
                console.log('Second login attempt...');
                performLoginOnPage(email, password);
            }, 2000);
        }, 1000);
        return true;
    }
}

function performLoginOnPage(email, password) {
    console.log('Filling login form...');

    // Find the email/username input field
    const emailSelectors = [
        'input[name="username"]',
        'input[autocomplete="username"]',
        '#login-username input',
        'faceplate-text-input[name="username"] input',
        'input[type="text"]'
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
        emailInput = document.querySelector(selector);
        if (emailInput) {
            console.log('Found email input with selector:', selector);
            break;
        }
    }

    // Try to find in shadow DOM
    if (!emailInput) {
        const faceplateEmailInput = document.querySelector('#login-username');
        if (faceplateEmailInput && faceplateEmailInput.shadowRoot) {
            emailInput = faceplateEmailInput.shadowRoot.querySelector('input');
            if (emailInput) {
                console.log('Found email input in shadow DOM');
            }
        }
    }

    // Find the password input field
    const passwordSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        'input[autocomplete="current-password"]',
        '#login-password input',
        'faceplate-text-input[name="password"] input'
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
        passwordInput = document.querySelector(selector);
        if (passwordInput) {
            console.log('Found password input with selector:', selector);
            break;
        }
    }

    // Try to find in shadow DOM
    if (!passwordInput) {
        const faceplatePasswordInput = document.querySelector('#login-password');
        if (faceplatePasswordInput && faceplatePasswordInput.shadowRoot) {
            passwordInput = faceplatePasswordInput.shadowRoot.querySelector('input');
            if (passwordInput) {
                console.log('Found password input in shadow DOM');
            }
        }
    }

    if (!emailInput || !passwordInput) {
        console.error('Could not find login form inputs');
        console.log('Email input found:', !!emailInput);
        console.log('Password input found:', !!passwordInput);
        return false;
    }

    // Fill in the form
    console.log('Filling email field...');
    emailInput.focus();
    emailInput.value = '';
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));

    setTimeout(() => {
        console.log('Filling password field...');
        passwordInput.focus();
        passwordInput.value = '';
        passwordInput.value = password;
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));

        // Wait 2 seconds after filling credentials, then click login button
        setTimeout(() => {
            console.log('Looking for login button after 2 second wait...');

            // Try to find the specific login button from the provided HTML
            const loginButtonSelectors = [
                'button.login',
                'button:contains("Log In")',
                'div[slot="primaryButton"] button',
                'faceplate-tracker[noun="login"] button',
                'button.button-brand:contains("Log In")',
                'button[type="button"]:contains("Log In")'
            ];

            let loginButton = null;

            // First try the specific selectors
            for (const selector of loginButtonSelectors) {
                if (selector.includes('contains')) {
                    // Handle text-based selection manually since querySelector doesn't support :contains
                    const buttons = document.querySelectorAll('button');
                    for (const button of buttons) {
                        if (button.textContent && button.textContent.includes('Log In')) {
                            loginButton = button;
                            console.log('Found login button by text content');
                            break;
                        }
                    }
                } else {
                    loginButton = document.querySelector(selector);
                }

                if (loginButton) {
                    console.log('Found login button with selector:', selector);
                    break;
                }
            }

            if (loginButton) {
                console.log('Clicking login button...');
                loginButton.click();
                console.log('Login button clicked');
            } else {
                console.log('Login button not found, trying fallback methods...');

                // Fallback: Try pressing Enter on password field
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true
                });
                passwordInput.dispatchEvent(enterEvent);

                // Also try form submission
                const form = passwordInput.closest('form');
                if (form) {
                    console.log('Found form, submitting...');
                    form.submit();
                }
            }
        }, 2000); // Wait 2 seconds as requested
    }, 500);

    return true;
}

// Authentication check function
function checkAuthentication() {
    console.log('Checking Reddit authentication status...');

    // First, try to find the user avatar button to click on
    const avatarSelectors = [
        'div.max-h-xl span[avatar]',
        'faceplate-partial[src*="user-drawer-button-logged-in"]',
        'span[avatar] img[alt="User Avatar"]',
        'div.max-h-xl img[src*="avatar"]'
    ];

    let avatarButton = null;
    for (const selector of avatarSelectors) {
        avatarButton = document.querySelector(selector);
        if (avatarButton) {
            console.log('Found avatar button with selector:', selector);
            break;
        }
    }

    if (!avatarButton) {
        // Try to find any avatar-like element
        const avatarImages = document.querySelectorAll('img[alt*="User Avatar"], img[src*="avatar"]');
        if (avatarImages.length > 0) {
            // Find the clickable parent
            for (const img of avatarImages) {
                const clickableParent = img.closest('div, span, button, a');
                if (clickableParent) {
                    avatarButton = clickableParent;
                    console.log('Found avatar button via image parent');
                    break;
                }
            }
        }
    }

    if (!avatarButton) {
        console.log('No avatar button found, user likely not logged in');
        return Promise.resolve({ loggedIn: false, username: null });
    }

    // Click the avatar to open the user menu
    console.log('Clicking avatar button...');
    avatarButton.click();

    // Wait a moment for the menu to appear, then look for username
    return new Promise((resolve) => {
        setTimeout(() => {
            // Look for the username link in the dropdown menu
            const usernameSelectors = [
                'a[href*="/user/"] span:contains("u/")',
                'span.text-12:contains("u/")',
                'a[href*="/user/"]',
                'span:contains("u/Diligent_Face_6420")'
            ];

            let usernameElement = null;
            let username = null;

            // Try different approaches to find username
            for (const selector of usernameSelectors) {
                if (selector.includes('contains')) {
                    // Handle text-based selection manually
                    const elements = document.querySelectorAll('span, a');
                    for (const element of elements) {
                        if (element.textContent && element.textContent.includes('u/')) {
                            usernameElement = element;
                            username = element.textContent.trim();
                            console.log('Found username by text content:', username);
                            break;
                        }
                    }
                } else {
                    usernameElement = document.querySelector(selector);
                    if (usernameElement) {
                        // Extract username from href or text content
                        if (usernameElement.href && usernameElement.href.includes('/user/')) {
                            const match = usernameElement.href.match(/\/user\/([^\/]+)/);
                            if (match) {
                                username = `u/${match[1]}`;
                            }
                        } else if (usernameElement.textContent) {
                            username = usernameElement.textContent.trim();
                        }
                        console.log('Found username element:', username);
                    }
                }

                if (username) break;
            }

            // Also try to find the "View Profile" link and extract username from it
            if (!username) {
                const profileLinks = document.querySelectorAll('a[href*="/user/"]');
                for (const link of profileLinks) {
                    const match = link.href.match(/\/user\/([^\/]+)/);
                    if (match) {
                        username = `u/${match[1]}`;
                        console.log('Found username from profile link:', username);
                        break;
                    }
                }
            }

            // Close the menu by clicking elsewhere
            document.body.click();

            if (username) {
                console.log('User is logged in as:', username);
                resolve({ loggedIn: true, username: username });
            } else {
                console.log('Could not determine username, user may not be logged in');
                resolve({ loggedIn: false, username: null });
            }
        }, 1000); // Wait 1 second for menu to load
    });
}

// Logout function
function performLogout() {
    console.log('Attempting to logout from Reddit...');

    // First, try to find the user avatar button to click on
    const avatarSelectors = [
        'div.max-h-xl span[avatar]',
        'faceplate-partial[src*="user-drawer-button-logged-in"]',
        'span[avatar] img[alt="User Avatar"]',
        'div.max-h-xl img[src*="avatar"]'
    ];

    let avatarButton = null;
    for (const selector of avatarSelectors) {
        avatarButton = document.querySelector(selector);
        if (avatarButton) {
            console.log('Found avatar button with selector:', selector);
            break;
        }
    }

    if (!avatarButton) {
        // Try to find any avatar-like element
        const avatarImages = document.querySelectorAll('img[alt*="User Avatar"], img[src*="avatar"]');
        if (avatarImages.length > 0) {
            // Find the clickable parent
            for (const img of avatarImages) {
                const clickableParent = img.closest('div, span, button, a');
                if (clickableParent) {
                    avatarButton = clickableParent;
                    console.log('Found avatar button via image parent');
                    break;
                }
            }
        }
    }

    if (!avatarButton) {
        console.log('No avatar button found, user likely not logged in');
        return Promise.resolve({ success: false, message: 'No avatar button found' });
    }

    // Click the avatar to open the user menu
    console.log('Clicking avatar button to open menu...');
    avatarButton.click();

    // Wait a moment for the menu to appear, then look for logout button
    return new Promise((resolve) => {
        setTimeout(() => {
            // Look for the logout button in the dropdown menu
            const logoutSelectors = [
                'user-drawer-logout',
                '#logout-list-item',
                'div:contains("Log Out")',
                'span:contains("Log Out")',
                'li[id*="logout"]',
                'faceplate-tracker[noun="logout"]'
            ];

            let logoutButton = null;

            // Try different approaches to find logout button
            for (const selector of logoutSelectors) {
                if (selector.includes('contains')) {
                    // Handle text-based selection manually
                    const elements = document.querySelectorAll('div, span, li, button');
                    for (const element of elements) {
                        if (element.textContent && element.textContent.includes('Log Out')) {
                            logoutButton = element;
                            console.log('Found logout button by text content');
                            break;
                        }
                    }
                } else {
                    logoutButton = document.querySelector(selector);
                }

                if (logoutButton) {
                    console.log('Found logout button with selector:', selector);
                    break;
                }
            }

            if (!logoutButton) {
                // Try to find the logout button within user-drawer-logout
                const userDrawerLogout = document.querySelector('user-drawer-logout');
                if (userDrawerLogout) {
                    const clickableElement = userDrawerLogout.querySelector('div[tabindex="0"], li, button');
                    if (clickableElement) {
                        logoutButton = clickableElement;
                        console.log('Found logout button within user-drawer-logout');
                    }
                }
            }

            if (logoutButton) {
                console.log('Clicking logout button...');
                logoutButton.click();

                // Wait a moment for logout to process
                setTimeout(() => {
                    console.log('Logout initiated');
                    resolve({ success: true, message: 'Logout completed' });
                }, 1000);
            } else {
                console.log('Logout button not found');
                // Close the menu by clicking elsewhere
                document.body.click();
                resolve({ success: false, message: 'Logout button not found' });
            }
        }, 1000); // Wait 1 second for menu to load
    });
}

// Message listener for commands from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);

    if (request.action === 'executeOnReddit') {
        const command = request.command;
        const data = request.data || {};

        switch (command) {
            case 'search':
                console.log('Search command received with query:', data.query);
                const success = performSearch(data.query);
                const message = success ? `Search initiated for "${data.query}"` : 'Failed to find search input';
                console.log(message);
                sendResponse({ success, message });
                break;

            case 'scrollDown':
                smoothScrollDown();
                sendResponse({ success: true, message: 'Scrolled down' });
                break;

            case 'scrollUp':
                smoothScrollUp();
                sendResponse({ success: true, message: 'Scrolled up' });
                break;

            case 'scrollToTop':
                scrollToTop();
                sendResponse({ success: true, message: 'Scrolled to top' });
                break;

            case 'goHome':
                goToRedditHome();
                sendResponse({ success: true, message: 'Navigating to home' });
                break;

            case 'refresh':
                refreshPage();
                sendResponse({ success: true, message: 'Refreshing page' });
                break;

            case 'test':
                console.log('Test command received in content script');
                // Debug: log all input elements on the page
                const allInputs = document.querySelectorAll('input');
                console.log('All input elements found:', allInputs.length);
                allInputs.forEach((input, index) => {
                    console.log(`Input ${index}:`, {
                        type: input.type,
                        name: input.name,
                        placeholder: input.placeholder,
                        id: input.id,
                        className: input.className
                    });
                });

                // Try to find the search input
                const searchInput = findSearchInput();
                if (searchInput) {
                    console.log('Current search input found:', searchInput);
                    sendResponse({ success: true, message: 'Content script working! Search input found.' });
                } else {
                    sendResponse({ success: true, message: 'Content script working! But search input not found.' });
                }
                break;

            case 'startAutoBrowse':
                const started = startAutoBrowse(data.duration || 5);
                sendResponse({
                    success: started,
                    message: started ? `Auto browse started for ${data.duration || 5} minutes` : 'Auto browse already running'
                });
                break;

            case 'browseHomeFeed':
                const homeFeedStarted = startHomeFeedBrowse(data.duration || 5);
                sendResponse({
                    success: homeFeedStarted,
                    message: homeFeedStarted ? `Home feed browse started for ${data.duration || 5} minutes` : 'Browse already running'
                });
                break;

            case 'stopAutoBrowse':
                stopAutoBrowse();
                sendResponse({ success: true, message: 'Auto browse stopped' });
                break;            case 'login':
                console.log('Login command received');
                const loginSuccess = performLogin(data.email, data.password);
                sendResponse({
                    success: loginSuccess,
                    message: loginSuccess ? 'Login initiated' : 'Failed to find login form'
                });
                break;

            case 'checkAuth':
                console.log('Auth check command received');
                checkAuthentication().then(result => {
                    sendResponse({
                        success: result.loggedIn,
                        message: result.loggedIn ? `Logged in as ${result.username}` : 'Not logged in',
                        username: result.username
                    });
                }).catch(error => {
                    console.error('Auth check failed:', error);
                    sendResponse({
                        success: false,
                        message: 'Auth check failed'
                    });
                });
                return true; // Keep message channel open for async response

            case 'logout':
                console.log('Logout command received');
                performLogout().then(result => {
                    sendResponse({
                        success: result.success,
                        message: result.message
                    });
                }).catch(error => {
                    console.error('Logout failed:', error);
                    sendResponse({
                        success: false,
                        message: 'Logout failed'
                    });
                });
                return true; // Keep message channel open for async response

            default:
                sendResponse({ success: false, message: 'Unknown command' });
        }
    }

    return true; // Keep message channel open for async response
});

// Auto-scroll functionality (optional - can be triggered from popup)
let autoScrolling = false;
let autoScrollInterval;

// Auto-browse functionality
let autoBrowsing = false;
let autoBrowseTimeout;
let browseStartTime;
let browseDuration;

function startAutoScroll(interval = 2000) {
    if (autoScrolling) return;

    autoScrolling = true;
    autoScrollInterval = setInterval(() => {
        smoothScrollDown();
    }, interval);
}

function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
    autoScrolling = false;
}

// Auto-browse functions
function findPostLinks() {
    // Find all post title links on the current page
    const postLinks = document.querySelectorAll('a[data-testid="post-title"]');
    console.log(`Found ${postLinks.length} post links`);
    return Array.from(postLinks);
}

function findHomeFeedPostLinks() {
    // Find all home feed post links using the new structure
    const homeFeedSelectors = [
        'a[slot="full-post-link"]',
        'a[data-ks-id^="t3_"]',
        'a[href*="/comments/"]'
    ];

    let postLinks = [];
    for (const selector of homeFeedSelectors) {
        const links = document.querySelectorAll(selector);
        if (links.length > 0) {
            postLinks = Array.from(links);
            console.log(`Found ${postLinks.length} home feed post links with selector: ${selector}`);
            break;
        }
    }

    // If no links found with specific selectors, try a broader search
    if (postLinks.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="/r/"][href*="/comments/"]');
        postLinks = Array.from(allLinks);
        console.log(`Found ${postLinks.length} home feed post links with fallback selector`);
    }

    return postLinks;
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function continuousScroll(duration) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const endTime = startTime + duration;
        let lastScrollHeight = 0;
        let reachedBottom = false;

        function performScroll() {
            const currentTime = Date.now();

            // Check if time is up
            if (currentTime >= endTime) {
                console.log(`Continuous scrolling finished after ${duration/1000} seconds`);
                resolve();
                return;
            }

            const currentScrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            const viewportHeight = window.innerHeight;
            const currentScrollTop = window.pageYOffset;

            // Check if we've reached the bottom
            const isAtBottom = (currentScrollTop + viewportHeight) >= (currentScrollHeight - 50);

            if (isAtBottom && currentScrollHeight === lastScrollHeight) {
                // We're at bottom and no new content, scroll back up and continue
                if (!reachedBottom) {
                    console.log('Reached bottom, scrolling back up to continue browsing...');
                    reachedBottom = true;
                }

                // Scroll back up to a random position to continue browsing
                const randomPosition = Math.floor(Math.random() * currentScrollHeight * 0.7);
                window.scrollTo({
                    top: randomPosition,
                    behavior: 'smooth'
                });
            } else {
                // Continue scrolling down
                const scrollAmount = viewportHeight * getRandomDelay(40, 100) / 100; // Random scroll amount
                const scrollDirection = Math.random() < 0.85 ? 1 : -0.3; // 85% down, 15% slight up

                window.scrollBy({
                    top: scrollAmount * scrollDirection,
                    behavior: 'smooth'
                });

                // Reset bottom flag if we're scrolling
                if (scrollDirection > 0) {
                    reachedBottom = false;
                }
            }

            lastScrollHeight = currentScrollHeight;

            // Continue scrolling with varied timing
            const nextScrollDelay = getRandomDelay(600, 1200);
            setTimeout(performScroll, nextScrollDelay);
        }

        console.log(`Starting continuous scroll for ${duration/1000} seconds`);
        performScroll();
    });
}

function humanLikeScroll() {
    return new Promise((resolve) => {
        let scrollAttempts = 0;
        let lastScrollHeight = 0;
        let stagnantScrolls = 0;
        const maxScrollAttempts = 20; // Maximum number of scroll attempts
        const maxStagnantScrolls = 3; // Stop if no new content loads after 3 tries

        function scrollStep() {
            const currentScrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            const viewportHeight = window.innerHeight;
            const currentScrollTop = window.pageYOffset;

            // Check if we've reached the actual bottom (no more scrolling possible)
            const isAtBottom = (currentScrollTop + viewportHeight) >= (currentScrollHeight - 50);

            if (isAtBottom || scrollAttempts >= maxScrollAttempts || stagnantScrolls >= maxStagnantScrolls) {
                console.log(`Finished scrolling. At bottom: ${isAtBottom}, Attempts: ${scrollAttempts}, Stagnant: ${stagnantScrolls}`);
                resolve();
                return;
            }

            // Check if new content was loaded since last scroll
            if (currentScrollHeight === lastScrollHeight) {
                stagnantScrolls++;
                console.log(`No new content loaded. Stagnant scrolls: ${stagnantScrolls}`);

                // Try to trigger content loading by scrolling to absolute bottom
                if (stagnantScrolls === 2) {
                    console.log('Trying to trigger more content by scrolling to very bottom...');
                    window.scrollTo({
                        top: currentScrollHeight,
                        behavior: 'smooth'
                    });
                }
            } else {
                stagnantScrolls = 0; // Reset if new content appeared
                console.log(`New content detected. Page height: ${currentScrollHeight}`);
            }

            lastScrollHeight = currentScrollHeight;

            // Scroll down a chunk
            const scrollAmount = viewportHeight * 0.8;
            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });

            scrollAttempts++;

            // Wait for potential dynamic content to load
            // Give Reddit more time to load comments dynamically
            const waitTime = getRandomDelay(1200, 2000);
            setTimeout(scrollStep, waitTime);
        }

        // Start scrolling
        scrollStep();
    });
}

function scrollMainPage() {
    return new Promise((resolve) => {
        // Scroll down the main page to discover more posts
        const scrollActions = Math.floor(Math.random() * 3) + 2; // 2-4 scroll actions
        let actionsCompleted = 0;

        function performMainPageScroll() {
            const scrollAmount = window.innerHeight * 0.6; // Scroll 60% of viewport
            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });

            actionsCompleted++;
            if (actionsCompleted < scrollActions) {
                // Wait before next scroll action
                setTimeout(performMainPageScroll, getRandomDelay(800, 1500));
            } else {
                console.log('Finished scrolling main page');
                resolve();
            }
        }

        console.log('Scrolling main page to find more posts...');
        performMainPageScroll();
    });
}

function browsePost() {
    return new Promise((resolve) => {
        const postLinks = findPostLinks();
        if (postLinks.length === 0) {
            console.log('No post links found');
            resolve();
            return;
        }

        // Select a random post from visible posts
        const randomPost = postLinks[Math.floor(Math.random() * postLinks.length)];
        console.log('Clicking on post:', randomPost.getAttribute('aria-label'));

        // Click the post
        randomPost.click();

        // Wait for page to load, then start continuous scrolling
        setTimeout(async () => {
            console.log('Starting continuous scrolling session...');

            // Stay time for continuous browsing (20 seconds to 1.2 minutes)
            const stayTime = getRandomDelay(20000, 72000);
            console.log(`Continuously scrolling for ${stayTime/1000} seconds`);

            // Start continuous scrolling
            const scrollingPromise = continuousScroll(stayTime);

            // Wait for the scrolling session to finish
            await scrollingPromise;

            // Go back to previous page
            console.log('Going back...');
            window.history.back();

            // Shorter wait time for faster transitions
            setTimeout(() => {
                resolve();
            }, getRandomDelay(800, 1500));
        }, getRandomDelay(1000, 2000)); // Wait for page load
    });
}

function browseHomeFeedPost() {
    return new Promise((resolve) => {
        const postLinks = findHomeFeedPostLinks();
        if (postLinks.length === 0) {
            console.log('No home feed post links found');
            resolve();
            return;
        }

        // Select a random post from visible home feed posts
        const randomPost = postLinks[Math.floor(Math.random() * postLinks.length)];
        const postTitle = randomPost.querySelector('faceplate-screen-reader-content')?.textContent ||
                         randomPost.getAttribute('href') || 'Unknown post';
        console.log('Clicking on home feed post:', postTitle);

        // Click the post
        randomPost.click();

        // Wait for page to load, then start continuous scrolling
        setTimeout(async () => {
            console.log('Starting continuous scrolling session on home feed post...');

            // Stay time for continuous browsing (20 seconds to 1.2 minutes)
            const stayTime = getRandomDelay(20000, 72000);
            console.log(`Continuously scrolling for ${stayTime/1000} seconds`);

            // Start continuous scrolling
            const scrollingPromise = continuousScroll(stayTime);

            // Wait for the scrolling session to finish
            await scrollingPromise;

            // Go back to previous page
            console.log('Going back...');
            window.history.back();

            // Shorter wait time for faster transitions
            setTimeout(() => {
                resolve();
            }, getRandomDelay(800, 1500));
        }, getRandomDelay(1000, 2000)); // Wait for page load
    });
}function startHomeFeedBrowse(durationMinutes) {
    if (autoBrowsing) {
        console.log('Auto browse already running');
        return false;
    }

    autoBrowsing = true;
    browseStartTime = Date.now();
    browseDuration = durationMinutes * 60 * 1000; // Convert to milliseconds

    console.log(`Starting home feed browse for ${durationMinutes} minutes`);

    async function homeFeedBrowseLoop() {
        if (!autoBrowsing) return;

        // Check if time is up
        const elapsed = Date.now() - browseStartTime;
        if (elapsed >= browseDuration) {
            console.log('Home feed browse time completed');
            stopAutoBrowse();
            return;
        }

        try {
            // Focus on home feed posts - 80% browse posts, 20% scroll main page
            const action = Math.random();

            if (action < 0.8) {
                // 80% chance to browse a home feed post
                await browseHomeFeedPost();
            } else {
                // 20% chance to just scroll the main page
                await scrollMainPage();
            }

            if (!autoBrowsing) return; // Check if stopped during browsing

            // Instead of waiting, scroll down the main page between actions
            console.log('Scrolling main page before next action...');
            await scrollMainPage();

            // Much shorter wait after scrolling (1-3 seconds)
            const waitTime = getRandomDelay(1000, 3000);
            console.log(`Brief pause for ${waitTime/1000} seconds before next action...`);

            autoBrowseTimeout = setTimeout(homeFeedBrowseLoop, waitTime);
        } catch (error) {
            console.error('Error during home feed browse:', error);
            // Continue browsing even if there's an error, with faster retry
            autoBrowseTimeout = setTimeout(homeFeedBrowseLoop, getRandomDelay(2000, 5000));
        }
    }

    // Start the browse loop
    homeFeedBrowseLoop();
    return true;
}

function startAutoBrowse(durationMinutes) {
    if (autoBrowsing) {
        console.log('Auto browse already running');
        return false;
    }

    autoBrowsing = true;
    browseStartTime = Date.now();
    browseDuration = durationMinutes * 60 * 1000; // Convert to milliseconds

    console.log(`Starting auto browse for ${durationMinutes} minutes`);

    async function browseLoop() {
        if (!autoBrowsing) return;

        // Check if time is up
        const elapsed = Date.now() - browseStartTime;
        if (elapsed >= browseDuration) {
            console.log('Auto browse time completed');
            stopAutoBrowse();
            return;
        }

        try {
            // Randomly decide whether to scroll main page or browse a post
            const action = Math.random();

            if (action < 0.7) {
                // 70% chance to browse a post
                await browsePost();
            } else {
                // 30% chance to just scroll the main page
                await scrollMainPage();
            }

            if (!autoBrowsing) return; // Check if stopped during browsing

            // Instead of waiting, scroll down the main page between actions
            console.log('Scrolling main page before next action...');
            await scrollMainPage();

            // Much shorter wait after scrolling (1-3 seconds)
            const waitTime = getRandomDelay(1000, 3000);
            console.log(`Brief pause for ${waitTime/1000} seconds before next action...`);

            autoBrowseTimeout = setTimeout(browseLoop, waitTime);
        } catch (error) {
            console.error('Error during auto browse:', error);
            // Continue browsing even if there's an error, with faster retry
            autoBrowseTimeout = setTimeout(browseLoop, getRandomDelay(2000, 5000));
        }
    }

    // Start the browse loop
    browseLoop();
    return true;
}

function stopAutoBrowse() {
    console.log('Stopping auto browse');
    autoBrowsing = false;

    if (autoBrowseTimeout) {
        clearTimeout(autoBrowseTimeout);
        autoBrowseTimeout = null;
    }
}

// Keyboard shortcuts (optional)
document.addEventListener('keydown', (e) => {
    // Only work if not in an input field
    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
        return;
    }

    // Ctrl/Cmd + Shift + R for Reddit Helper (example shortcut)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        console.log('Reddit Helper shortcut activated');
        // Could trigger some default action here
    }
});

console.log('Reddit Helper content script initialized');

// API Server Integration
const API_SERVER_URL = 'http://localhost:3000';
let apiPollingInterval = null;
let isApiPollingActive = false;

// Function to poll the API server for new commands
async function pollApiCommands() {
    if (!isApiPollingActive) {
        return; // Don't poll if polling was stopped
    }

    try {
        const response = await fetch(`${API_SERVER_URL}/api/commands/poll`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.commands.length > 0) {
            console.log(`Reddit Helper: Received ${data.commands.length} API commands:`, data.commands);            // Process each command
            for (const command of data.commands) {
                await processApiCommand(command);
            }
        }
    } catch (error) {
        console.error('Reddit Helper: Error polling API commands:', error);
        // Don't stop polling on errors, just log them
        // This allows the extension to keep trying even if the server is temporarily down
    }
}

// Function to process a single API command
async function processApiCommand(commandObj) {
    const { id, command, data = {} } = commandObj;
    console.log(`Processing API command: ${command}`, data);

    let result = { success: false, message: 'Unknown command' };

    try {
        switch (command) {
            case 'search':
                if (data.query) {
                    const searchResult = performSearch(data.query);
                    result = {
                        success: searchResult,
                        message: searchResult ? `Search performed for: ${data.query}` : 'Search failed'
                    };
                } else {
                    result = { success: false, message: 'Query parameter required for search' };
                }
                break;

            case 'login':
                if (data.email && data.password) {
                    const loginResult = await performLogin(data.email, data.password);
                    result = {
                        success: loginResult,
                        message: loginResult ? 'Login attempted' : 'Login failed'
                    };
                } else {
                    result = { success: false, message: 'Email and password required for login' };
                }
                break;

            case 'logout':
                const logoutResult = await performLogout();
                result = {
                    success: logoutResult,
                    message: logoutResult ? 'Logout performed' : 'Logout failed'
                };
                break;

            case 'checkAuth':
                const authStatus = await checkAuthentication();
                result = {
                    success: true,
                    message: authStatus ? `Authenticated as: ${authStatus}` : 'Not authenticated',
                    data: { authenticated: !!authStatus, username: authStatus }
                };
                break;

            case 'startAutoBrowse':
                const duration = data.duration || 5; // Default 5 minutes
                const browseResult = startAutoBrowse(duration);
                result = {
                    success: browseResult,
                    message: browseResult ? `Auto browse started for ${duration} minutes` : 'Failed to start auto browse'
                };
                break;

            case 'browseHomeFeed':
                const homeDuration = data.duration || 10; // Default 10 minutes
                const homeResult = startHomeFeedBrowse(homeDuration);
                result = {
                    success: homeResult,
                    message: homeResult ? `Home feed browse started for ${homeDuration} minutes` : 'Failed to start home feed browse'
                };
                break;

            case 'stopAutoBrowse':
                stopAutoBrowse();
                result = { success: true, message: 'Auto browse stopped' };
                break;

            case 'scrollDown':
                await scrollDown();
                result = { success: true, message: 'Scrolled down' };
                break;

            case 'scrollUp':
                await scrollUp();
                result = { success: true, message: 'Scrolled up' };
                break;

            case 'scrollToTop':
                await scrollToTop();
                result = { success: true, message: 'Scrolled to top' };
                break;

            case 'goHome':
                window.location.href = 'https://www.reddit.com/';
                result = { success: true, message: 'Navigating to Reddit home' };
                break;

            case 'refresh':
                window.location.reload();
                result = { success: true, message: 'Page refreshed' };
                break;

            default:
                result = { success: false, message: `Unknown command: ${command}` };
        }
    } catch (error) {
        console.error(`Error processing API command ${command}:`, error);
        result = { success: false, message: `Error: ${error.message}` };
    }

    // Report the result back to the API server
    await reportCommandResult(id, result);
}

// Function to report command results back to the API server
async function reportCommandResult(commandId, result) {
    try {
        const response = await fetch(`${API_SERVER_URL}/api/commands/${commandId}/result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(result)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(`Reported result for command ${commandId}:`, result);
    } catch (error) {
        console.error('Error reporting command result:', error);
    }
}

// Function to start API polling
function startApiPolling() {
    if (isApiPollingActive) {
        console.log('Reddit Helper: API polling already active');
        return true;
    }

    console.log('Reddit Helper: Starting API polling...');
    isApiPollingActive = true;

    // Poll every 2 seconds
    apiPollingInterval = setInterval(pollApiCommands, 2000);

    // Test connection immediately and start polling
    pollApiCommands().then(() => {
        console.log('Reddit Helper: API polling started successfully');
    }).catch((error) => {
        console.log('Reddit Helper: Initial API connection failed, but continuing to poll:', error.message);
    });

    return true;
}// Function to stop API polling
function stopApiPolling() {
    if (!isApiPollingActive) {
        console.log('API polling not active');
        return;
    }

    console.log('Stopping API polling...');
    isApiPollingActive = false;

    if (apiPollingInterval) {
        clearInterval(apiPollingInterval);
        apiPollingInterval = null;
    }
}

// Auto-start API polling when the script loads
console.log('Reddit Helper: Auto-starting API polling...');
startApiPolling();

// Also start API polling after a short delay to ensure everything is ready
setTimeout(() => {
    if (!isApiPollingActive) {
        console.log('Reddit Helper: Retry starting API polling after delay...');
        startApiPolling();
    }
}, 3000);

// Listen for messages from popup and background script to control API polling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startApiPolling') {
        console.log('Reddit Helper: Received startApiPolling message');
        startApiPolling();
        sendResponse({ success: true, message: 'API polling started', isPolling: isApiPollingActive });
    } else if (request.action === 'stopApiPolling') {
        console.log('Reddit Helper: Received stopApiPolling message');
        stopApiPolling();
        sendResponse({ success: true, message: 'API polling stopped', isPolling: isApiPollingActive });
    } else if (request.action === 'getApiStatus') {
        sendResponse({
            success: true,
            isPolling: isApiPollingActive,
            serverUrl: API_SERVER_URL,
            message: isApiPollingActive ? 'API polling is active' : 'API polling is stopped'
        });
    }

    // Return true to indicate we'll send a response asynchronously (even though we send it immediately)
    return true;
});

// Global Tab key monitor for debugging
console.log('🔧 Setting up global Tab key monitor...');

document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab' || event.keyCode === 9) {
        console.log('\n🔍 TAB KEY DETECTED!');
        console.log('📍 Current active element:', event.target.tagName, event.target.className || 'no-class');
        console.log('🎯 Event target:', event.target);
        console.log('📋 Document active element:', document.activeElement.tagName, document.activeElement.className || 'no-class');
        console.log('⌨️  Event details:', {
            key: event.key,
            code: event.code,
            keyCode: event.keyCode,
            bubbles: event.bubbles,
            cancelable: event.cancelable,
            defaultPrevented: event.defaultPrevented
        });

        // Show next focusable element if available
        const focusableElements = getFocusableElements();
        const currentIndex = focusableElements.indexOf(document.activeElement);
        if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
            const nextElement = focusableElements[currentIndex + 1];
            console.log('➡️  Next focusable element would be:', nextElement.tagName, nextElement.className || 'no-class', nextElement.placeholder || 'no-placeholder');
        } else {
            console.log('⚠️  No next focusable element found');
        }
        console.log('────────────────────────');
    }
}, true); // Use capture phase to catch all Tab events

console.log('✅ Tab key monitor active - will log all Tab presses');