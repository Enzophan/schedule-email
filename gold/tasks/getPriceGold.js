const puppeteer = require("puppeteer");
// const fs = require("fs");

const getDataGoldPrice = async () => {
    const data = [];
    console.log("Scraping Gold Prices...", process.env.GOLD_PRICE_URL);

    if (!process.env.GOLD_PRICE_URL) {
        throw new Error('GOLD_PRICE_URL environment variable is not set');
    }

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: false,
        args: [
            "--no-sandbox", // Required for unprivileged environments
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage", // Overcome limited resource problems
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu",
        ],
    });

    const page = await browser.newPage();

    // Set a user agent to avoid being blocked
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    try {
        try {
            await page.goto(process.env.GOLD_PRICE_URL, { waitUntil: 'networkidle2' });
            console.log('Page loaded successfully');

            // Try multiple potential selectors
            const selectors = [
                'div.info-topic.box-giavang-new',
                'div.box-giavang-new',
                'div.info-topic',
                'table.table-price',
                '.gold-price-table'
            ];

            let foundSelector = null;
            for (const selector of selectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 10000 });
                    foundSelector = selector;
                    console.log(`Found selector: ${selector}`);
                    break;
                } catch (err) {
                    console.log(`Selector ${selector} not found, trying next...`);
                }
            }

            if (!foundSelector) {
                // Take a screenshot for debugging
                await page.screenshot({
                    path: 'data/debug_page.png',
                    fullPage: true
                });
                console.log('Debug screenshot saved to data/debug_page.png');

                // Get page HTML for debugging
                const html = await page.content();
                console.log('Page HTML length:', html.length);

                throw new Error('No valid selector found on the page');
            }
        } catch (error) {
            console.error('Error loading or finding selectors:', error.message);
            await page.screenshot({
                path: 'data/error_screenshot.png',
                fullPage: true
            });
            throw error;
        }
        // await page.screenshot({
        //     path: 'data/giavang_homnay.png',
        //     fullPage: true
        // });
        // Try multiple potential table row selectors
        let records = [];
        const tableSelectors = [
            'div.box-giavang-new > div > table > tbody > tr',
            'div.box-giavang-new table tbody tr',
            'table tbody tr',
            '.gold-price-table tbody tr',
            'table tr'
        ];

        for (const selector of tableSelectors) {
            records = await page.$$(selector);
            if (records.length > 0) {
                console.log(`Found ${records.length} records using selector: ${selector}`);
                break;
            }
        }

        if (records.length === 0) {
            console.log('No data rows found with any selector');
            return [];
        }
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            let name = "Null";
            let todayPurchasePrice = "Null";
            let todaySellingPrice = "Null";
            let yesterdayPurchasePrice = "Null";
            let yesterdaySellingPrice = "Null";

            try {
                // Try different selectors for the name field
                const nameSelectors = ['td > h2', 'td:first-child h2', 'td:first-child', 'th'];
                for (const selector of nameSelectors) {
                    const nameElement = await page.evaluate((el, sel) => {
                        const element = el.querySelector(sel);
                        return element ? element.textContent : null;
                    }, record, selector);
                    if (nameElement) {
                        name = nameElement.trim();
                        break;
                    }
                }

                // Extract prices with error handling
                const extractPrice = async (selector) => {
                    try {
                        const price = await page.evaluate((el, sel) => {
                            const element = el.querySelector(sel);
                            return element ? element.textContent : "Null";
                        }, record, selector);
                        return price ? price.trim() : "Null";
                    } catch (err) {
                        return "Null";
                    }
                };

                todayPurchasePrice = await extractPrice("td:nth-child(2)");
                todaySellingPrice = await extractPrice("td:nth-child(3)");
                yesterdayPurchasePrice = await extractPrice("td:nth-child(4)");
                yesterdaySellingPrice = await extractPrice("td:nth-child(5)");

                if (name !== "Null") {
                    data.push({ name, todayPurchasePrice, todaySellingPrice, yesterdayPurchasePrice, yesterdaySellingPrice });
                }
            } catch (error) {
                console.error(`Error processing record ${i}:`, error.message);
                continue;
            }
        }

        console.log(`Successfully scraped ${data.length} gold price records`);

        // await page.screenshot({
        //     path: 'data/giavang_homnay.png',
        //     fullPage: true
        // });

    } catch (error) {
        console.error('Error during scraping process:', error.message);
        // Still try to take a screenshot for debugging
        try {
            await page.screenshot({
                path: 'data/error_final.png',
                fullPage: true
            });
        } catch (screenshotError) {
            console.error('Could not take error screenshot:', screenshotError.message);
        }
        throw error;
    } finally {
        await browser.close();
    }

    /* Export Data to JSON */
    // fs.writeFile("data/data_gold.json", JSON.stringify(data), 'utf8', (error) => {
    //     if (error) {
    //         // logging the error
    //         console.error(error);
    //         throw error;
    //     }
    //     console.log("data_gold.json written correctly");
    // });

    return data;
}


module.exports = {
    getDataGoldPrice
}