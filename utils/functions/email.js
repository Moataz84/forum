import { createTransport } from "nodemailer"

export default function sendEmail(recipent, subject, body) {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  })
  const mailOptions = {
    from: "Forum",
    to: recipent,
    subject,
    text: body
  }
  transporter.sendMail(mailOptions, err => {
    if (err) console.log(err)
  })
}