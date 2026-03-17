
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const otpStore = new Map();

// إعداد SMTP (مثال Gmail - يمكنك تغييره لأي مزود)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your@email.com",
    pass: "your_app_password"
  }
});

// توليد OTP
function generateOTP() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

// إرسال OTP
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

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// تحقق من OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore.get(email) === otp) {
    otpStore.delete(email);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
