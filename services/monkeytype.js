// Import required modules
const puppeteer = require("puppeteer");
const path = require("path");
const logger = require("../logger");
const { clickRejectAll } = require("../utils/rejectAll");
const { loadCookies, saveCookies } = require("../utils/cookies");
const { typeWords } = require("../utils/typing");

// Main automation function for Monkeytype
const monkeyType = async () => {
  // Launch a new browser instance
  logger.info("Launching browser...");
  const browser = await puppeteer.launch({
    headless: false, // Show the browser window
    slowMo: 10,      // Slow down operations for visibility
    defaultViewport: null,
    args: ["--start-maximized"], // Start maximized
  });

  // Get the first page (tab) in the browser
  const pages = await browser.pages();
  const page = pages[0];

  // Path to store cookies
  const cookiesPath = path.resolve(__dirname, "../cookies.json");

  // Handle cookie consent pop-up if present
  await clickRejectAll(page, logger);

  // Go to the login page using the environment variable
  await page.goto(process.env.MONKEY_TYPE_LOGIN_URL);
  logger.info("Navigated to login page.");
  await clickRejectAll(page, logger);

  // Wait for the login form and enter credentials
  await page.waitForSelector('input[name="current-email"]', { timeout: 10000 });
  logger.info("Login form loaded. Typing email and password.");
  await page.type(
    'input[name="current-email"]',
    process.env.MONKEY_TYPE_EMAIL,
    { delay: 150 }
  );
  await page.type(
    'input[name="current-password"]',
    process.env.MONKEY_TYPE_PASSWORD,
    { delay: 150 }
  );

  // Submit the login form
  await page.evaluate(() => {
    document.querySelector("button.signIn").click();
  });
  logger.info("Submitted login form.");

  // Wait for navigation to complete after login
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await clickRejectAll(page, logger);
  logger.info("Login successful. Saving cookies.");
  await saveCookies(page, cookiesPath, logger);

  // Go to the Monkeytype homepage
  await page.goto("https://monkeytype.com/");
  logger.info("Navigated to main typing test page.");
  await clickRejectAll(page, logger);

  // Continuously perform typing tests
  while (true) {
    try {
      await typeWords(page, logger);
    } catch (e) {
      logger.warn("No words found or an error occurred. Retrying in 2 seconds...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
};

// Export the main function
module.exports = { monkeyType }; 