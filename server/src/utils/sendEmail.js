import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create reusable transporter object using Gmail SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Automatically sets host to smtp.gmail.com and port to 465/587 correctly
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Send mail with defined transport object
  const message = {
    from: `${process.env.FROM_NAME || 'AppointHQ'} <${process.env.FROM_EMAIL || 'noreply@appointhq.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`, // Fallback to HTML version of text
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  return info;
};

export default sendEmail;