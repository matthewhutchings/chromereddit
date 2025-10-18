#!/usr/bin/env node

/**
 * Reddit Helper API Test Script
 *
 * This script demonstrates how to interact with the Reddit Helper API
 * programmatically. It shows various commands and how to check their status.
 */

const readline = require('readline');

const API_BASE = 'http://localhost:3000';

// Simple HTTP request function (using Node.js built-in modules)
async function makeRequest(url, options = {}) {
    const { default: fetch } = await import('node-fetch');

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Function to send a command to the API
async function sendCommand(command, data = {}) {
    console.log(`\n🔄 Sending command: ${command}`);
    if (Object.keys(data).length > 0) {
        console.log(`   Data:`, data);
    }

    const result = await makeRequest(`${API_BASE}/api/command`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command, data })
    });

    if (result.success) {
        console.log(`✅ Command sent successfully:`);
        console.log(`   Command ID: ${result.data.commandId}`);
        console.log(`   Message: ${result.data.message}`);
        return result.data.commandId;
    } else {
        console.log(`❌ Command failed:`, result.error || result.data);
        return null;
    }
}

// Function to check server status
async function checkStatus() {
    console.log('\n📊 Checking server status...');
    const result = await makeRequest(`${API_BASE}/api/status`);

    if (result.success) {
        const status = result.data;
        console.log('✅ Server is running:');
        console.log(`   Status: ${status.status}`);
        console.log(`   Queue Length: ${status.queueLength}`);
        console.log(`   History Length: ${status.historyLength}`);
        console.log(`   Uptime: ${Math.floor(status.uptime)}s`);
    } else {
        console.log('❌ Server is not responding:', result.error);
    }

    return result.success;
}

// Function to get command history
async function getHistory() {
    console.log('\n📝 Getting command history...');
    const result = await makeRequest(`${API_BASE}/api/commands/history`);

    if (result.success) {
        const history = result.data.history;
        console.log(`✅ Found ${history.length} recent commands:`);
        history.slice(-5).forEach((cmd, index) => {
            console.log(`   ${index + 1}. ${cmd.commandId}: ${cmd.success ? '✅' : '❌'} ${cmd.message}`);
        });
    } else {
        console.log('❌ Failed to get history:', result.error);
    }
}

// Function to get available commands
async function getAvailableCommands() {
    console.log('\n📖 Getting available commands...');
    const result = await makeRequest(`${API_BASE}/api/commands`);

    if (result.success) {
        const commands = result.data.commands;
        console.log('✅ Available commands:');
        Object.keys(commands).forEach(cmd => {
            console.log(`   • ${cmd}: ${commands[cmd].description}`);
        });
    } else {
        console.log('❌ Failed to get commands:', result.error);
    }
}

// Interactive mode
function startInteractiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log('\n🎮 Interactive Mode - Enter commands:');
    console.log('Commands: search, login, logout, checkAuth, startAutoBrowse, stopAutoBrowse');
    console.log('Special: status, history, commands, help, quit');
    console.log('Example: search programming\n');

    const askCommand = () => {
        rl.question('Enter command: ', async (input) => {
            const parts = input.trim().split(' ');
            const command = parts[0].toLowerCase();
            const args = parts.slice(1);

            switch (command) {
                case 'quit':
                case 'exit':
                    console.log('Goodbye! 👋');
                    rl.close();
                    return;

                case 'status':
                    await checkStatus();
                    break;

                case 'history':
                    await getHistory();
                    break;

                case 'commands':
                    await getAvailableCommands();
                    break;

                case 'help':
                    console.log('\nAvailable commands:');
                    console.log('  search <query>     - Search Reddit');
                    console.log('  login             - Login to Reddit (will prompt)');
                    console.log('  logout            - Logout from Reddit');
                    console.log('  checkauth         - Check authentication status');
                    console.log('  startbrowse <min> - Start auto browsing');
                    console.log('  stopbrowse        - Stop auto browsing');
                    console.log('  scrolldown        - Scroll down');
                    console.log('  scrollup          - Scroll up');
                    console.log('  gohome            - Go to Reddit home');
                    console.log('  refresh           - Refresh page');
                    console.log('  status            - Check server status');
                    console.log('  history           - Show command history');
                    console.log('  commands          - Show available commands');
                    console.log('  quit              - Exit interactive mode');
                    break;

                case 'search':
                    if (args.length === 0) {
                        console.log('Please provide a search query: search <query>');
                    } else {
                        await sendCommand('search', { query: args.join(' ') });
                    }
                    break;

                case 'login':
                    rl.question('Username: ', (username) => {
                        rl.question('Password: ', async (password) => {
                            await sendCommand('login', { email: username, password });
                            askCommand();
                        });
                        return;
                    });
                    return;

                case 'startbrowse':
                    const duration = args.length > 0 ? parseInt(args[0]) : 5;
                    await sendCommand('startAutoBrowse', { duration });
                    break;

                case 'logout':
                    await sendCommand('logout');
                    break;

                case 'checkauth':
                    await sendCommand('checkAuth');
                    break;

                case 'stopbrowse':
                    await sendCommand('stopAutoBrowse');
                    break;

                case 'scrolldown':
                    await sendCommand('scrollDown');
                    break;

                case 'scrollup':
                    await sendCommand('scrollUp');
                    break;

                case 'gohome':
                    await sendCommand('goHome');
                    break;

                case 'refresh':
                    await sendCommand('refresh');
                    break;

                default:
                    if (command) {
                        console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
                    }
            }

            askCommand();
        });
    };

    askCommand();
}

// Main function
async function main() {
    console.log('🤖 Reddit Helper API Test Script');
    console.log('==================================');

    // Check if server is running
    const serverRunning = await checkStatus();

    if (!serverRunning) {
        console.log('\n❌ Server is not running. Please start it with: npm start');
        process.exit(1);
    }

    // Get available commands
    await getAvailableCommands();

    // Check command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // No arguments, start interactive mode
        startInteractiveMode();
    } else if (args[0] === 'demo') {
        // Demo mode - run a series of commands
        console.log('\n🎭 Demo Mode - Running sample commands...');

        // Check auth status
        await sendCommand('checkAuth');

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Search for something
        await sendCommand('search', { query: 'javascript tutorials' });

        // Wait a bit more
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Scroll down
        await sendCommand('scrollDown');

        // Check history
        await new Promise(resolve => setTimeout(resolve, 2000));
        await getHistory();

        console.log('\n✅ Demo complete!');
    } else {
        // Command line mode
        const command = args[0];
        const data = {};

        if (command === 'search' && args[1]) {
            data.query = args.slice(1).join(' ');
        } else if (command === 'startAutoBrowse' && args[1]) {
            data.duration = parseInt(args[1]);
        }

        await sendCommand(command, data);
    }
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { sendCommand, checkStatus, getHistory };