// server.js

import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// تخزين OTP مؤقتًا (في الذاكرة)
const otpStore = new Map();

// إعداد SMTP (مثال Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your@email.com",       // ضع هنا بريدك
    pass: "your_app_password"     // ضع هنا App Password من Gmail
  }
});

// توليد OTP عشوائي 5 أرقام
function generateOTP() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// --- Route لإرسال OTP ---
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const otp = generateOTP();
  otpStore.set(email, otp);

  try {
    await transporter.sendMail({
      from: `"Red Diamond" <your@email.com>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your OTP code is: ${otp}`
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// --- Route للتحقق من OTP ---
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore.get(email) === otp) {
    otpStore.delete(email);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
