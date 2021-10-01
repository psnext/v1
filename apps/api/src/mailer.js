
import nodemailer from "nodemailer";

let mailer;
if (process.env.NODE_ENV==='test') {
  mailer = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.TMAIL_USER, // generated ethereal user
      pass: process.env.TMAIL_PASS, // generated ethereal password
    },
  });
} else {
  // The credentials for the email account you want to send mail from.
  const credentials = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      // These environment variables will be pulled from the env
      user: (process.env.MAIL_USER || '').trim(),
      pass: (process.env.MAIL_PASS || '').trim(),
    },
  };
  // setup Nodemailer with the credentials for when the 'sendEmail()'
  // function is called.
  mailer = nodemailer.createTransport(credentials);
}

export default mailer;