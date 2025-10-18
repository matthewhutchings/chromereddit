# Reddit Helper Chrome Extension with API Server

A Chrome extension that automates Reddit browsing with both popup controls and HTTP API support.

## Features

- **Search Reddit**: Automatically search for terms
- **Auto Browse**: Randomly click posts and scroll with human-like behavior
- **Login/Logout**: Automatic Reddit authentication
- **Home Feed Browsing**: Browse and interact with home feed posts
- **Scroll Controls**: Smooth scrolling up, down, or to the top of the page
- **Navigation**: Quick access to Reddit home and page refresh
- **API Server**: Control the extension remotely via HTTP API

## Installation

### Chrome Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this folder
4. The extension will appear in your Chrome toolbar

### API Server
1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the API server:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000`

## Usage

### Using the Popup Interface
1. Click the Reddit Helper extension icon in Chrome
2. Navigate to reddit.com
3. Use the popup controls to interact with Reddit

### Using the API Server

The API server accepts POST requests to execute commands. Here are the available endpoints:

#### Execute Commands
```bash
POST http://localhost:3000/api/command
Content-Type: application/json

{
  "command": "search",
  "data": {
    "query": "programming"
  }
}
```

#### Available Commands

**Search Reddit**
```json
{
  "command": "search",
  "data": {
    "query": "javascript"
  }
}
```

**Login to Reddit**
```json
{
  "command": "login",
  "data": {
    "email": "your_username",
    "password": "your_password"
  }
}
```

**Logout from Reddit**
```json
{
  "command": "logout"
}
```

**Check Authentication Status**
```json
{
  "command": "checkAuth"
}
```

**Start Auto Browsing**
```json
{
  "command": "startAutoBrowse",
  "data": {
    "duration": 5
  }
}
```

**Browse Home Feed**
```json
{
  "command": "browseHomeFeed",
  "data": {
    "duration": 10
  }
}
```

**Stop Auto Browsing**
```json
{
  "command": "stopAutoBrowse"
}
```

**Scroll Controls**
```json
{
  "command": "scrollDown"
}
```
```json
{
  "command": "scrollUp"
}
```
```json
{
  "command": "scrollToTop"
}
```

**Navigation**
```json
{
  "command": "goHome"
}
```
```json
{
  "command": "refresh"
}
```

### API Endpoints

**Get Available Commands**
```bash
GET http://localhost:3000/api/commands
```

**Get Server Status**
```bash
GET http://localhost:3000/api/status
```

**Get Command History**
```bash
GET http://localhost:3000/api/commands/history
```

### Example Usage with curl

```bash
# Search for a term
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"command": "search", "data": {"query": "programming"}}'

# Start auto browsing for 5 minutes
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"command": "startAutoBrowse", "data": {"duration": 5}}'

# Check authentication status
curl -X POST http://localhost:3000/api/command \
  -H "Content-Type: application/json" \
  -d '{"command": "checkAuth"}'

# Get server status
curl http://localhost:3000/api/status
```

### Example Usage with Python

```python
import requests
import json

API_BASE = "http://localhost:3000"

# Search Reddit
response = requests.post(f"{API_BASE}/api/command",
    json={
        "command": "search",
        "data": {
            "query": "python programming"
        }
    }
)
print(response.json())

# Start auto browsing
response = requests.post(f"{API_BASE}/api/command",
    json={
        "command": "startAutoBrowse",
        "data": {
            "duration": 3
        }
    }
)
print(response.json())

# Check server status
response = requests.get(f"{API_BASE}/api/status")
print(response.json())
```

## How It Works

1. **Extension Side**: The Chrome extension content script polls the API server every 2 seconds for new commands
2. **API Server**: Receives HTTP requests, queues commands, and provides them to the extension
3. **Command Execution**: The extension executes commands and reports results back to the server
4. **Feedback Loop**: Results are stored in the server's command history

## Configuration

- **API Server Port**: Default is 3000, can be changed in `api-server.js`
- **Polling Interval**: Default is 2 seconds, can be changed in `content.js`
- **Auto Browse Duration**: Configurable via API or popup (1-60 minutes)

## Security Notes

- The API server runs locally and accepts connections from localhost
- CORS is enabled for local development
- No authentication is required for the local API server
- Reddit credentials are handled securely within the extension

## Troubleshooting

1. **Extension not working**: Make sure you're on reddit.com and the extension is loaded
2. **API commands not executing**: Check that API polling is active in the extension popup
3. **Server not responding**: Ensure the server is running with `npm start`
4. **Login not working**: Try running the login command twice or check your credentials

## Development

To modify the extension:
1. Make changes to the files
2. Go to `chrome://extensions/`
3. Click the refresh button on the Reddit Helper extension
4. Restart the API server if you made server changes

## Files Structure

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `content.js` - Main automation logic and API integration
- `background.js` - Extension background script
- `api-server.js` - HTTP API server
- `package.json` - Node.js dependencies

## Permissions

The extension requires the following permissions:
- `activeTab` - To interact with the current active tab
- `scripting` - To inject content scripts
- Host permissions for `reddit.com` domains

## Development

To modify the extension:
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh button for the Reddit Helper extension
4. Test your changes

## Troubleshooting

- **Extension not working**: Make sure you're on a Reddit page (reddit.com)
- **Search not working**: Reddit's DOM structure may have changed; check console for errors
- **Popup not opening**: Ensure the extension is properly loaded and enabled

## Browser Compatibility

This extension is designed for Chrome (Manifest V3) and should work with other Chromium-based browsers.