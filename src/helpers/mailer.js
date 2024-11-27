const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_SMTP_USERNAME || "lucy.smith@ittech-news.com", 
        pass: process.env.EMAIL_SMTP_PASSWORD || "vmxazdvtlnrrrvkm", 
    },
    tls: {
        ciphers: 'SSLv3', 
        rejectUnauthorized: false 
    }
});

exports.send = async function (to, subject, html) {
    try {
        const mailResult = await transporter.sendMail({
            from: process.env.EMAIL_SMTP_USERNAME || "lucy.smith@ittech-news.com",
            to: to,
            subject: subject,
            html: html
        });
		console.log(mailResult)
        return mailResult;
    } catch (error) {
        console.error("Error sending email:", error);
        return error;
    }
};
