import nodemailer from "nodemailer";


const mail = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  secure: process.env.MAIL_SECURE === "true",
  port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});


export default mail;
