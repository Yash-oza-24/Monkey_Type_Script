async function typeWords(page, logger) {
  // Wait for the words to load
  await page.waitForSelector(".word", { timeout: 10000 });
  logger.info("Words loaded. Extracting words to type.");

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
    logger.info(`Typing: ${textToType}`);
    await page.keyboard.type(textToType, { delay: 0 });
  }
}

module.exports = { typeWords }; 