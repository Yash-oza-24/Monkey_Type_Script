const fs = require("fs");

async function loadCookies(page, cookiesPath, logger) {
  if (fs.existsSync(cookiesPath)) {
    logger.info("Found cookies.json. Attempting to use saved cookies.");
    const cookiesString = fs.readFileSync(cookiesPath, "utf8");
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
    logger.info("Cookies set from file.");
    return true;
  } else {
    logger.info("No cookies.json found.");
    return false;
  }
}

async function saveCookies(page, cookiesPath, logger) {
  const cookies = await page.cookies();
  fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
  logger.info("Cookies saved to cookies.json.");
}

module.exports = { loadCookies, saveCookies }; 