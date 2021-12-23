const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "narorojay2@gmail.com",
    subject: "Welcome to the Task Manager Application",
    text: `Welcom, ${name}, to the Task Manager application. Our aim is to make your experience as hustle free as possible`,
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "narorojay2@gmail.com",
    subject: "Sad to see you leave",
    text: `${name}, we are sad to see you leave.`,
  });
};
module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
