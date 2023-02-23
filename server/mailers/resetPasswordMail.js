const nodemailer = require("nodemailer");

const resetPasswordMail = async (email, subject, html) => {
    try {
        // const transporter = nodemailer.createTransport({
            //   // host​:​ ​"​smtp.gmail.com​"​,
        //     host: process.env.HOST,
        //     service: process.env.SERVICE,
        //     port: 587,
        //     secure: true,
        //     auth: {
        //         user: process.env.USER,
        //         pass: process.env.PASS,
        //     },
        // });

        var transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER, 
                pass: process.env.MAILTRAP_PASS,
            }
        });
        

        await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS,
            to: email,
            subject: subject,
            html: html,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = resetPasswordMail;
