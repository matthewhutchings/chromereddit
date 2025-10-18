#!/usr/bin/env node

// Quick test script to verify the Reddit Helper API auto-polling is working
const http = require('http');

const API_BASE = 'http://localhost:3000';

console.log('🚀 Testing Reddit Helper API auto-polling...\n');

// Function to make HTTP requests
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (e) {
                    resolve({ error: 'Invalid JSON response', data });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    try {
        // Test 1: Check server status
        console.log('1. Checking server status...');
        const status = await makeRequest('GET', '/api/status');
        if (status.success) {
            console.log('✅ Server is running');
            console.log(`   Queue length: ${status.queueLength}`);
            console.log(`   History length: ${status.historyLength}`);
        } else {
            console.log('❌ Server status check failed:', status);
            return;
        }

        // Test 2: Send a test command
        console.log('\n2. Sending test search command...');
        const searchCommand = {
            command: 'search',
            data: { query: 'test search from API' }
        };
        
        const searchResult = await makeRequest('POST', '/api/command', searchCommand);
        if (searchResult.success) {
            console.log('✅ Search command queued successfully');
            console.log(`   Command ID: ${searchResult.commandId}`);
        } else {
            console.log('❌ Search command failed:', searchResult);
        }

        // Test 3: Check if commands are being processed
        console.log('\n3. Waiting 5 seconds for extension to process command...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('\n4. Checking command history...');
        const history = await makeRequest('GET', '/api/commands/history');
        if (history.success && history.history.length > 0) {
            console.log('✅ Commands are being processed by extension');
            console.log(`   Recent commands: ${history.history.length}`);
            const lastCommand = history.history[history.history.length - 1];
            console.log(`   Last command: ${lastCommand.commandId} - ${lastCommand.success ? 'Success' : 'Failed'}`);
            console.log(`   Message: ${lastCommand.message}`);
        } else {
            console.log('⚠️ No command history found - extension might not be polling');
            console.log('   Make sure:');
            console.log('   - Chrome extension is loaded');
            console.log('   - You have a Reddit tab open');
            console.log('   - API polling is active in the extension');
        }

        // Test 4: Send a checkAuth command to test communication
        console.log('\n5. Testing authentication check command...');
        const authCommand = {
            command: 'checkAuth'
        };
        
        const authResult = await makeRequest('POST', '/api/command', authCommand);
        if (authResult.success) {
            console.log('✅ Auth check command queued successfully');
            console.log(`   Command ID: ${authResult.commandId}`);
        } else {
            console.log('❌ Auth check command failed:', authResult);
        }

        console.log('\n6. Final status check in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const finalHistory = await makeRequest('GET', '/api/commands/history');
        if (finalHistory.success) {
            const newCommands = finalHistory.history.length - (history.history ? history.history.length : 0);
            if (newCommands > 0) {
                console.log(`✅ ${newCommands} new commands processed - API auto-polling is working!`);
            } else {
                console.log('⚠️ No new commands processed - check extension connection');
            }
        }

        console.log('\n🎉 Test completed! If you see successful command processing above,');
        console.log('   your Reddit Helper extension is auto-polling and ready for API commands.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nMake sure:');
        console.log('1. The API server is running (npm start)');
        console.log('2. The Chrome extension is loaded');
        console.log('3. You have a Reddit tab open in Chrome');
    }
}

// Run the tests
runTests();