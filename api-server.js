const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store for pending commands - in production you'd use a proper database
let commandQueue = [];
let commandHistory = [];

// API endpoint to receive commands
app.post('/api/command', (req, res) => {
    const { command, data = {} } = req.body;

    if (!command) {
        return res.status(400).json({
            success: false,
            error: 'Command is required'
        });
    }

    const commandId = Date.now().toString();
    const commandObj = {
        id: commandId,
        command,
        data,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };

    commandQueue.push(commandObj);
    console.log(`Received command: ${command}`, data);

    res.json({
        success: true,
        commandId,
        message: `Command '${command}' queued successfully`
    });
});

// Endpoint for extension to poll for new commands
app.get('/api/commands/poll', (req, res) => {
    if (commandQueue.length === 0) {
        return res.json({
            success: true,
            commands: []
        });
    }

    // Return all pending commands and clear the queue
    const commands = [...commandQueue];
    commandQueue = [];

    res.json({
        success: true,
        commands
    });
});

// Endpoint for extension to report command results
app.post('/api/commands/:commandId/result', (req, res) => {
    const { commandId } = req.params;
    const { success, message, data = {} } = req.body;

    const result = {
        commandId,
        success,
        message,
        data,
        completedAt: new Date().toISOString()
    };

    commandHistory.push(result);
    console.log(`Command ${commandId} completed:`, { success, message });

    res.json({
        success: true,
        message: 'Result recorded'
    });
});

// Get command history
app.get('/api/commands/history', (req, res) => {
    res.json({
        success: true,
        history: commandHistory.slice(-50) // Return last 50 commands
    });
});

// Get server status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'running',
        queueLength: commandQueue.length,
        historyLength: commandHistory.length,
        uptime: process.uptime()
    });
});

// Available commands documentation
app.get('/api/commands', (req, res) => {
    const availableCommands = {
        'search': {
            description: 'Search Reddit',
            parameters: { query: 'Search term' },
            example: { command: 'search', data: { query: 'javascript' } }
        },
        'login': {
            description: 'Login to Reddit',
            parameters: { email: 'Email/username', password: 'Password' },
            example: { command: 'login', data: { email: 'user@example.com', password: 'password' } }
        },
        'logout': {
            description: 'Logout from Reddit',
            parameters: {},
            example: { command: 'logout' }
        },
        'checkAuth': {
            description: 'Check authentication status',
            parameters: {},
            example: { command: 'checkAuth' }
        },
        'startAutoBrowse': {
            description: 'Start auto browsing',
            parameters: { duration: 'Duration in minutes' },
            example: { command: 'startAutoBrowse', data: { duration: 5 } }
        },
        'browseHomeFeed': {
            description: 'Browse home feed',
            parameters: { duration: 'Duration in minutes' },
            example: { command: 'browseHomeFeed', data: { duration: 10 } }
        },
        'stopAutoBrowse': {
            description: 'Stop auto browsing',
            parameters: {},
            example: { command: 'stopAutoBrowse' }
        },
        'scrollDown': {
            description: 'Scroll down the page',
            parameters: {},
            example: { command: 'scrollDown' }
        },
        'scrollUp': {
            description: 'Scroll up the page',
            parameters: {},
            example: { command: 'scrollUp' }
        },
        'scrollToTop': {
            description: 'Scroll to top of page',
            parameters: {},
            example: { command: 'scrollToTop' }
        },
        'goHome': {
            description: 'Go to Reddit home',
            parameters: {},
            example: { command: 'goHome' }
        },
        'refresh': {
            description: 'Refresh current page',
            parameters: {},
            example: { command: 'refresh' }
        }
    };

    res.json({
        success: true,
        commands: availableCommands
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Reddit Helper API Server running on http://localhost:${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api/commands`);
    console.log(`📊 Server Status: http://localhost:${PORT}/api/status`);
    console.log(`📝 Command History: http://localhost:${PORT}/api/commands/history`);
    console.log('');
    console.log('Example usage:');
    console.log(`curl -X POST http://localhost:${PORT}/api/command -H "Content-Type: application/json" -d '{"command": "search", "data": {"query": "programming"}}'`);
});

module.exports = app;