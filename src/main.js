require('dotenv').config();
const nodemailer = require("nodemailer");
const moment = require('moment');

(async function run() {
    const date = moment().format('MMMM Do YYYY, h:mm:ss a');

    console.log('Running report: ', date)


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
        html: `<h1>Daily News at Date ${date}</h1>`, // html body
    });

    console.log("Message sent: %s", info.messageId);


})();