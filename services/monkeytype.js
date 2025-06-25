const puppeteer = require("puppeteer");
const path = require("path");
const logger = require("../logger");
const { clickRejectAll } = require("../utils/rejectAll");
const { loadCookies, saveCookies } = require("../utils/cookies");
const { typeWords } = require("../utils/typing");

const monkeyType = async () => {
  logger.info("Launching browser...");
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const pages = await browser.pages();
  const page = pages[0];

  const cookiesPath = path.resolve(__dirname, "../cookies.json");
  let loggedIn = false;

  await clickRejectAll(page, logger);
  await page.goto(process.env.MONKEY_TYPE_LOGIN_URL);
  logger.info("Navigated to login page.");
  await clickRejectAll(page, logger);
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
  await page.evaluate(() => {
    document.querySelector("button.signIn").click();
  });
  logger.info("Submitted login form.");
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  await clickRejectAll(page, logger);
  logger.info("Login successful. Saving cookies.");
  await saveCookies(page, cookiesPath, logger);

  await page.goto("https://monkeytype.com/");
  logger.info("Navigated to main typing test page.");
  await clickRejectAll(page, logger);

  while (true) {
    try {
      await typeWords(page, logger);
    } catch (e) {
      logger.warn("No words found or an error occurred. Retrying in 2 seconds...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
};

module.exports = { monkeyType }; 