// Function to click the 'Reject All' button for cookie consent if present
async function clickRejectAll(page, logger) {
  try {
    // Wait for the 'Reject All' button and click it
    await page.waitForSelector("button.rejectAll", { timeout: 3000 });
    await page.click("button.rejectAll");
    await new Promise((res) => setTimeout(res, 500));
    logger.info("Clicked 'Reject All' button.");
  } catch (e) {
    // If the button is not found, log info and continue
    logger.info("'Reject All' button not found.");
  }
}

// Export the function
module.exports = { clickRejectAll }; 