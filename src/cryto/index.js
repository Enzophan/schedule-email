const axios = require('axios');
const cheerio = require('cheerio');

async function getPriceFeed() {
    try {
        const urlSite = "https://coinmarketcap.com";

        const { data } = await axios({
            method: "GET",
            url: urlSite
        });

        const $ = cheerio.load(data);
        const eleSelector = "div>table.cmc-table>tbody>tr";

        const keys = [
            "rank",
            "name",
            "price",
            "24h",
            "7d",
            "marketCap",
            "volume24h",
            "circulatingSupply"
        ];
        const coinArr = []

        $(eleSelector).each((parentIdx, parentElem) => {
            let keyIndex = 0;
            const coinObj = {};
            if (parentIdx <= 9) {
                $(parentElem).children().each((childIdx, childElem) => {
                    let tdValue = $(childElem).text();

                    if (keyIndex == 1 || keyIndex == 6) {
                        tdValue = $('p:first-child', $(childElem).html()).text()
                    };

                    if (keyIndex == 5) {
                        tdValue = $('span:last-child', $(childElem).html()).text()
                    };

                    if (tdValue) {
                        coinObj[keys[keyIndex]] = tdValue
                        keyIndex++
                    }
                })
                coinArr.push(coinObj)
            }
            // console.log("parentElem ", parentElem)
        });
        // console.log("coinArr ", coinArr)
        return coinArr;
    } catch (err) {
        console.log("Error ", err)
    }
}

module.exports = {
    getPriceFeed
}