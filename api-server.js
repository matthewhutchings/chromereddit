const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    logger.request(req.method, req.url, req.body);

    // Capture the original res.json method
    const originalJson = res.json;
    res.json = function(data) {
        logger.response(req.method, req.url, res.statusCode, data);
        return originalJson.call(this, data);
    };

    next();
});

// Store for pending commands - in production you'd use a proper database
let commandQueue = [];
let commandHistory = [];

// API endpoint to receive commands
app.post('/api/command', (req, res) => {
    try {
        const { command, data = {} } = req.body;

        if (!command) {
            logger.warn('Command request missing required command field', { body: req.body });
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
        logger.success(`Command queued: ${command}`, { commandId, data });

        res.json({
            success: true,
            commandId,
            message: `Command '${command}' queued successfully`
        });
    } catch (error) {
        logger.error('Error processing command request', error, { body: req.body });
        res.status(500).json({
            success: false,
            error: 'Internal server error processing command'
        });
    }
});

// Endpoint for extension to poll for new commands
app.get('/api/commands/poll', (req, res) => {
    try {
        if (commandQueue.length === 0) {
            return res.json({
                success: true,
                commands: []
            });
        }

        // Return all pending commands and clear the queue
        const commands = [...commandQueue];
        commandQueue = [];

        logger.info(`Polling returned ${commands.length} commands`, {
            commandIds: commands.map(c => c.id)
        });

        res.json({
            success: true,
            commands
        });
    } catch (error) {
        logger.error('Error during command polling', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during polling'
        });
    }
});

// Endpoint for extension to report command results
app.post('/api/commands/:commandId/result', (req, res) => {
    try {
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

        if (success) {
            logger.success(`Command ${commandId} completed successfully`, { message, data });
        } else {
            logger.error(`Command ${commandId} failed`, null, { message, data });
        }

        res.json({
            success: true,
            message: 'Result recorded'
        });
    } catch (error) {
        logger.error('Error recording command result', error, {
            commandId: req.params.commandId,
            body: req.body
        });
        res.status(500).json({
            success: false,
            error: 'Internal server error recording result'
        });
    }
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
    try {
        const statusData = {
            success: true,
            status: 'running',
            queueLength: commandQueue.length,
            historyLength: commandHistory.length,
            uptime: process.uptime()
        };

        logger.info('Status check requested', statusData);
        res.json(statusData);
    } catch (error) {
        logger.error('Error getting server status', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error getting status'
        });
    }
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
    logger.error('Unhandled server error', err, {
        method: req.method,
        url: req.url,
        body: req.body,
        headers: req.headers
    });

    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    logger.success(`Reddit Helper API Server started on http://localhost:${PORT}`);
    logger.info('API Endpoints available', {
        documentation: `http://localhost:${PORT}/api/commands`,
        status: `http://localhost:${PORT}/api/status`,
        history: `http://localhost:${PORT}/api/commands/history`,
        logs: 'Check logs/ directory for detailed activity logs'
    });

    console.log('🚀 Reddit Helper API Server running on http://localhost:${PORT}');
    console.log('📖 API Documentation: http://localhost:${PORT}/api/commands');
    console.log('📊 Server Status: http://localhost:${PORT}/api/status');
    console.log('📝 Command History: http://localhost:${PORT}/api/commands/history');
    console.log('📋 Activity Logs: ./logs/api.log');
    console.log('❌ Error Logs: ./logs/error.log');
    console.log('');
    console.log('Example usage:');
    console.log(`curl -X POST http://localhost:${PORT}/api/command -H "Content-Type: application/json" -d '{"command": "search", "data": {"query": "programming"}}'`);
});

module.exports = app;