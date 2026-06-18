import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 587,
  secure: false,
  auth: {
    user: "ravi@whitehopefoundation.com",
    pass: "YOUR_PASSWORD",
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Error:", err);
  } else {
    console.log("✅ SMTP working");
  }
});
