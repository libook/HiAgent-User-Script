# Hi Agent User Script

A userscript that enhances HiAgent interaction functionality.

## Features

- **Auto Save**: Intelligent auto-save mechanism to ensure data is never lost
- **Floating Text Area**: Drag-and-drop, convenient floating text editing area
- **Cookie Management**: Easy-to-use cookie operation interface
- **Database Storage**: Local persistent data storage
- **Request Handling**: Flexible network request functionality
- **Synchronization**: Real-time data synchronization mechanism
- **Timeline**: View content history
- **Table of Contents**: Quick navigation functionality

## Installation

### Method 1: Tampermonkey (Recommended)

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click [Install Script](https://raw.githubusercontent.com/libook7/hi-agent-user-script/main/hi-agent-user-script.user.js)
3. In the pop-up window, click "Install"

### Method 2: Violentmonkey

1. Install the [Violentmonkey](https://violentmonkey.github.io/) browser extension
2. Visit the script page and click "Install"

## Usage Instructions

1. After installation, visit a supported target website
2. Click the trigger button on the page to activate the features
3. Use the features as needed

## Configuration Options

The script supports the following configurable options:

- `AUTO_SAVE_DURATION`: Auto-save interval time
- `AUTO_SAVE_DB_DURATION`: Database auto-save interval
- `DEFAULT_WIDTH` / `DEFAULT_HEIGHT`: Default dimensions of the floating text area
- `SCROLL_TOLERANCE`: Scroll tolerance value

## Project Structure

```
hi-agent-user-script/
├── src/
│   ├── autosave.js       # Auto-save module
│   ├── cookies.js        # Cookie operations
│   ├── db.js             # Database storage
│   ├── floatingTextarea/ # Floating text area
│   │   ├── event.js      # Event handling
│   │   ├── index.js      # Main entry
│   │   ├── state.js      # State management
│   │   ├── sync.js       # Synchronization
│   │   ├── timeline.js   # Timeline
│   │   ├── toc.js        # Table of contents
│   │   └── window.js     # Window management
│   ├── index.js          # Main entry
│   ├── metadata.js       # Metadata
│   ├── request.js        # Network requests
│   ├── style.js          # Styles
│   └── triggerButton.js  # Trigger button
├── package.json
├── rollup.config.mjs
└── eslint.config.js
```

## Development Guide

### Environment Requirements

- Node.js 14+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

### Build Script

```bash
npm run build
```

### Code Linting

```bash
npm run lint
```

## License

This project is licensed under the MIT License.

## Contribution Guidelines

Issues and pull requests are welcome.

## Feedback and Suggestions

For any issues or suggestions, please submit an Issue via the Gitee repository.