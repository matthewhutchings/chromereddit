const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.logFile = path.join(this.logDir, 'api.log');
        this.errorLogFile = path.join(this.logDir, 'error.log');
        
        // Ensure logs directory exists
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const dataString = data ? ` | Data: ${JSON.stringify(data)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataString}\n`;
    }

    writeToFile(filePath, content) {
        try {
            fs.appendFileSync(filePath, content, 'utf8');
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    }

    info(message, data = null) {
        const logMessage = this.formatMessage('info', message, data);
        this.writeToFile(this.logFile, logMessage);
        console.log(`ℹ️  ${message}`, data || '');
    }

    error(message, error = null, data = null) {
        const errorData = error ? {
            message: error.message,
            stack: error.stack,
            ...data
        } : data;
        
        const logMessage = this.formatMessage('error', message, errorData);
        this.writeToFile(this.logFile, logMessage);
        this.writeToFile(this.errorLogFile, logMessage);
        console.error(`❌ ${message}`, error || '', data || '');
    }

    warn(message, data = null) {
        const logMessage = this.formatMessage('warn', message, data);
        this.writeToFile(this.logFile, logMessage);
        console.warn(`⚠️  ${message}`, data || '');
    }

    success(message, data = null) {
        const logMessage = this.formatMessage('success', message, data);
        this.writeToFile(this.logFile, logMessage);
        console.log(`✅ ${message}`, data || '');
    }

    request(method, url, body = null) {
        const message = `${method} ${url}`;
        const data = body ? { body } : null;
        this.info(`REQUEST: ${message}`, data);
    }

    response(method, url, statusCode, responseData = null) {
        const message = `${method} ${url} - ${statusCode}`;
        this.info(`RESPONSE: ${message}`, responseData);
    }

    // Rotate log files when they get too large (10MB)
    rotateLogs() {
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        [this.logFile, this.errorLogFile].forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                if (stats.size > maxSize) {
                    const rotatedFile = `${file}.${Date.now()}`;
                    fs.renameSync(file, rotatedFile);
                    this.info(`Log file rotated: ${path.basename(file)} -> ${path.basename(rotatedFile)}`);
                }
            }
        });
    }
}

// Create singleton instance
const logger = new Logger();

// Rotate logs on startup
logger.rotateLogs();

module.exports = logger;