const axios = require('axios');

const sendNotify = async (type, data) => {
    try {
        if (!data || data.length === 0) {
            console.log("No data to send notification.");
            return;
        }
        // console.log(`Sending notification... for ${type}:`, data);
        const message = {
            "cards": [
                {
                    "sections": [
                        {
                            "header": `${type} Update`,
                            "widgets": [
                                {
                                    "textParagraph": {
                                        "text":
                                            `
                                         ${data.map(item => `
                                            <strong><em>${item.name}</em></strong>: Mua vào hôm nay: ${item.todayPurchasePrice}, Bán ra hôm nay: ${item.todaySellingPrice} <br>
                                         `).join('')}
                                         ️<br>
                                         Nguồn: <a href="https://vnexpress.net/chu-de/gia-vang-1403">VNExpress</a>
                                         `
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://chat.googleapis.com/v1/spaces/AAQAzl9xdaM/messages?key=${process.env.SALES_TEAM_KEY}&token=${process.env.SALES_TEAM_TOKEN}`,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': 'COMPASS=dynamite-integration=CgAQh96_yQYaTQAJa4lXk2paUewXa7sOHpWh74RScqaemOHMgXmX7CEYflxzu0MWaBrwEiVEuMd7yM25EU_Fs6208_JS0IZGnfHgHqrluZGNTnR4cuRfMAE'
            },
            data: message
        };

        const response = await axios.request(config);
        // console.log(JSON.stringify(response.data));

    } catch (error) {
        console.error("Error sending reminder:", error);
    }

}

const trimPrice = (price) => {
    if (!price) return "Null";
    return price.replace(/[^0-9.,]/g, '').trim() || "Null";
}

module.exports = {
    sendNotify,
    trimPrice
}