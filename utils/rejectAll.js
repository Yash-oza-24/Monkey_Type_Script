async function clickRejectAll(page, logger) {
  try {
    await page.waitForSelector("button.rejectAll", { timeout: 3000 });
    await page.click("button.rejectAll");
    await new Promise((res) => setTimeout(res, 500));
    logger.info("Clicked 'Reject All' button.");
  } catch (e) {
    logger.info("'Reject All' button not found.");
  }
}

module.exports = { clickRejectAll }; 