require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Helper to click 'Reject All' if present
async function clickRejectAll(page) {
  try {
    await page.waitForSelector("button.rejectAll", { timeout: 3000 });
    await page.click("button.rejectAll");
    await new Promise((res) => setTimeout(res, 500));
    console.log("[INFO] Clicked 'Reject All' button.");
  } catch (e) {
    // Button not found, ignore
    console.log("[INFO] 'Reject All' button not found.");
  }
}

const monkeyType = async () => {
  console.log("[INFO] Launching browser...");
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const pages = await browser.pages();
  const page = pages[0];

  const cookiesPath = path.resolve(__dirname, "cookies.json");
  let loggedIn = false;

  // Check if cookies file exists
  if (fs.existsSync(cookiesPath)) {
    console.log("[INFO] Found cookies.json. Attempting to use saved cookies.");
    const cookiesString = fs.readFileSync(cookiesPath, "utf8");
    const cookies = JSON.parse(cookiesString);
    await page.goto("https://monkeytype.com/");
    console.log("[INFO] Navigated to https://monkeytype.com/ to set cookies.");
    await clickRejectAll(page);
    await page.setCookie(...cookies);
    console.log("[INFO] Cookies set. Reloading page to apply cookies.");
    await clickRejectAll(page);
    console.log("[INFO] Reloading page to apply cookies...");
    await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
    console.log("[INFO] Reload complete.");
    await clickRejectAll(page);
    // Check if still logged in (look for a user-specific element)
    try {
      // Try multiple selectors for robustness
      await Promise.race([
        page.waitForSelector(".userProfile", { timeout: 5000 }),
        page.waitForSelector(".navProfile", { timeout: 5000 }),
        page.waitForSelector("[data-cy='userProfile']", { timeout: 5000 })
      ]);
      loggedIn = true;
      console.log("[INFO] Successfully logged in using cookies.");
    } catch (e) {
      // Not logged in, will proceed to login
      console.log("[WARN] Cookies invalid or expired. Proceeding to login.");
    }
  } else {
    console.log("[INFO] No cookies.json found. Proceeding to login.");
  }

  if (!loggedIn) {
    // Go to Monkeytype login page
    await page.goto("https://monkeytype.com/login");
    console.log("[INFO] Navigated to login page.");
    await clickRejectAll(page);

    // Wait for the login form fields to appear
    await page.waitForSelector('input[name="current-email"]', { timeout: 10000 });
    console.log("[INFO] Login form loaded. Typing email and password.");
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

    // Wait for the submit button to be enabled and click it
    await page.evaluate(() => {
      document.querySelector("button.signIn").click();
    });
    console.log("[INFO] Submitted login form.");

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await clickRejectAll(page);
    console.log("[INFO] Login successful. Saving cookies.");

    // Save cookies after login
    const cookies = await page.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log("[INFO] Cookies saved to cookies.json.");
  }

  // Go to the main typing test page
  await page.goto("https://monkeytype.com/");
  console.log("[INFO] Navigated to main typing test page.");
  await clickRejectAll(page);

  // Continuously check for new words and type them
  while (true) {
    try {
      // Wait for the words to load
      await page.waitForSelector(".word", { timeout: 10000 });
      console.log("[INFO] Words loaded. Extracting words to type.");

      // Extract the words to type
      const words = await page.$$eval(".word", (elements) =>
        elements.map((el) => el.textContent)
      );
      const textToType = words.join(" ");

      if (textToType.trim().length > 0) {
        // Focus the contenteditable typing area to avoid scrolling and ensure typing works
        await page.evaluate(() => {
          const editable = document.querySelector(
            '#wordsInput[contenteditable="true"]'
          );
          if (editable) editable.focus();
        });
        console.log(`[INFO] Typing: ${textToType}`);
        await page.keyboard.type(textToType, { delay: 0 });
      }
    } catch (e) {
      // If no words found, wait a bit and try again
      console.log("[WARN] No words found or an error occurred. Retrying in 2 seconds...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  // Optionally, close the browser after some time
};

monkeyType();
