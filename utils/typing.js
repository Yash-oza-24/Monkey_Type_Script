// Function to automate typing the words on Monkeytype
async function typeWords(page, logger) {
  // Wait for the words to load on the page
  await page.waitForSelector(".word", { timeout: 10000 });
  logger.info("Words loaded. Extracting words to type.");

  // Extract the words to type from the page
  const words = await page.$$eval(".word", (elements) =>
    elements.map((el) => el.textContent)
  );
  const textToType = words.join(" ");

  if (textToType.trim().length > 0) {
    // Focus the typing area to ensure input works
    await page.evaluate(() => {
      const editable = document.querySelector(
        '#wordsInput[contenteditable="true"]'
      );
      if (editable) editable.focus();
    });
    logger.info(`Typing: ${textToType}`);
    // Type the extracted words
    await page.keyboard.type(textToType, { delay: 0 });
  }
}

// Export the typing function
module.exports = { typeWords }; 