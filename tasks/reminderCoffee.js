const axios = require('axios');
const data = '{\n    "cards": [\n        {\n            "sections": [\n                {\n                    "header": "Order Drinks",\n                    "widgets": [\n                        {\n                            "textParagraph": {\n                                "text": "<strong>Please order drinks before 8:45 AM and 1:30 PM...</strong><br> CLICK NOWWWWWWWW!!!!!!!: <a href=\\"https://coffee.ots.space/v2/menu?c=2\\">OTS Coffee App</a>"\n                            }\n                        }\n                    ]\n                }\n            ]\n        }\n    ]\n}';

module.exports = async function reminderCoffee() {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://chat.googleapis.com/v1/spaces/AAQAzl9xdaM/messages?key=${process.env.SALES_TEAM_KEY}&token=${process.env.SALES_TEAM_TOKEN}`,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Cookie': 'COMPASS=dynamite-integration=CgAQh96_yQYaTQAJa4lXk2paUewXa7sOHpWh74RScqaemOHMgXmX7CEYflxzu0MWaBrwEiVEuMd7yM25EU_Fs6208_JS0IZGnfHgHqrluZGNTnR4cuRfMAE'
            },
            data: data
        };

        const response = await axios.request(config);
        // console.log(JSON.stringify(response.data));
        console.log("Reminder sent successfully", response.status);

    } catch (error) {
        console.error("Error sending reminder:", error);
    }
}