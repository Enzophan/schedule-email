require('dotenv').config();
const fetch = require('node-fetch');
const nodemailer = require("nodemailer");
// const moment = require('moment');
const momentTZ = require('moment-timezone');
const querystring = require('querystring');
const { getPriceFeed } = require('./cryto');


(async function run() {
    const severity = {
        "0": "Unknown",
        "1": "Significant",
        "2": "Major",
        "3": "Moderate",
        "4": "Minor",
        "5": "Minimal",
        "6": "Insignificant",
        "7": "Informational"
    }
    const priceFeed = await getPriceFeed();
    const crytoPrice = priceFeed.map(item => {
        return (`
            <p>${item.name}: ${item.price}</p>
        `)
    }).join('');

    // Get current date
    const date = momentTZ(new Date()).tz('Asian/Ho_Chi_Minh').format('MMMM Do YYYY, h:mm:ss a');
    console.log('Running report: ', date);

    const apiKey = {
        apikey: process.env.API_KEY
    };
    const search = {
        q: "da nang",
    };
    const locationRequest = await fetch(`http://dataservice.accuweather.com/locations/v1/cities/search?${querystring.stringify({ ...apiKey, ...search })}`)
    const locationData = await locationRequest.json();
    const locationKey = locationData[0].Key;

    const forecastRequest = await fetch(`http://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}?${querystring.stringify(apiKey)}`);
    const forecastData = await forecastRequest.json();
    const temperature = forecastData.DailyForecasts[0].Temperature;

    // create reusable transporter object using the default SMTP transport
    // https://support.google.com/mail/answer/7126229?hl=en#zippy=%2Cstep-change-smtp-other-settings-in-your-email-client
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.USER_EMAIL, // generated ethereal user
            pass: process.env.USER_EMAIL_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Test Email 👻" <${process.env.MAIL_FROM}>`, // sender address
        to: `${process.env.MAIL_TO}`, // list of receivers
        subject: "Collect news ✔", // Subject line
        text: `Collect all news`, // plain text body
        html: `
            <h1>Daily News at Date ${date}</h1>
            <h2>The weather in ${locationData[0].EnglishName} ${locationData[0].Type} is about to ${forecastData.Headline.Category}</h2>
            <h5>Forecast: ${forecastData.Headline.Text}</h5>
            <p>Severity of the headline: ${severity[`${forecastData.Headline.Severity}`]}</p>
            <p>Min: ${Math.round((temperature.Minimum.Value - 32) / 1.8)} °C</p>
            <p>Max: ${Math.round((temperature.Maximum.Value - 32) / 1.8)} °C</p>
            <h2>Coin Market Cap</h2>
                ${crytoPrice}
    `, // html body
    });

    //formulation calculation °F to °C: https://www.rapidtables.com/convert/temperature/fahrenheit-to-celsius.html
    console.log("Message sent: %s", info.messageId);

})();