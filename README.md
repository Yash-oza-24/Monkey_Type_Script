# Monkeytype Automation

Automate typing tests and login on [Monkeytype](https://monkeytype.com/) using Puppeteer.

## Features
- Automated login (with cookie persistence)
- Automated typing test execution
- Cookie management for session reuse
- Console logging with Winston

## Requirements
- Node.js (v18+ recommended)
- npm

## Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root directory with your Monkeytype credentials and URLs:
   ```env
   MONKEY_TYPE_EMAIL=your_email@example.com
   MONKEY_TYPE_PASSWORD=your_password
   MONKEY_TYPE_LOGIN_URL=monkey_type_login_url
   MONKEY_TYPE_HOMEPAGE_URL=monkey_type_homepage_url
   ```
3. (Optional) Delete `cookies.json` to force a fresh login.

## Usage
Start the automation:
```bash
npm start
```

## File Structure
```
├── index.js              # Entry point
├── logger.js             # Winston logger setup
├── services/
│   └── monkeytype.js     # Main automation logic
├── utils/
│   ├── cookies.js        # Cookie load/save helpers
│   ├── rejectAll.js      # Cookie consent rejection
│   └── typing.js         # Typing automation
├── package.json
├── .gitignore
```

## Environment Variables
- `MONKEY_TYPE_EMAIL`: Your Monkeytype account email
- `MONKEY_TYPE_PASSWORD`: Your Monkeytype account password
- `MONKEY_TYPE_LOGIN_URL`: The login page URL for Monkeytype (e.g., https://monkeytype.com/login)
- `MONKEY_TYPE_HOMEPAGE_URL`: The homepage URL for Monkeytype (e.g., https://monkeytype.com/)

## Main Functions

### `monkeyType()` (services/monkeytype.js)
- Launches Puppeteer, manages login (using cookies if available), navigates to Monkeytype, and continuously performs typing tests.
- Uses helper functions for cookie management, consent rejection, and typing.

### `typeWords(page, logger)` (utils/typing.js)
- Waits for words to load, extracts them, focuses the typing area, and types the words automatically.

### `loadCookies(page, cookiesPath, logger)` / `saveCookies(page, cookiesPath, logger)` (utils/cookies.js)
- Loads cookies from `cookies.json` and sets them in the browser, or saves current cookies to the file for session reuse.

### `clickRejectAll(page, logger)` (utils/rejectAll.js)
- Clicks the 'Reject All' button for cookie consent if present.

### `logger` (logger.js)
- Configured Winston logger for colored console output.

## Notes
- `.env`, `cookies.json`, and `node_modules/` are gitignored.
- `cookies.json` is generated automatically after a successful login.
- For a fresh login, delete `cookies.json` and restart the script.

## License
ISC 