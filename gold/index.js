require('dotenv').config();
// const { sendNotify } = require("./tasks/common");
const { getDataGoldPrice } = require('./tasks/getPriceGold');
// const reminderCoffee = require('./tasks/reminderCoffee');

(async () => {
    console.log(`Hello. Message: ${process.env.SECRET_TEST_MESSAGE}`);
    const dataGold = await getDataGoldPrice();
    console.log("Gold Prices:", dataGold);
    // await sendNotify('Gold Price Today', dataGold);
    // await reminderCoffee();
})();