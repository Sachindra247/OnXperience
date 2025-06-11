import sgMail from "@sendgrid/mail";

console.log("SENDGRID_API_KEY exists:", !!process.env.SENDGRID_API_KEY);
console.log("DEV_EMAIL:", process.env.DEV_EMAIL);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  console.log("API hit: send-feedback-email");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, email, subscriptionId } = req.body;

  if (!name || !email || !subscriptionId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const feedbackUrl = `https://on-xperience.vercel.app/feedback-email?subscriptionId=${subscriptionId}`;

  const msg = {
    to: "srimalsachindra@gmail.com", // for now still hardcoded
    //from: process.env.DEV_EMAIL,
    from: process.env.DEV_EMAIL,
    subject: `Feedback Request from On-Xperience`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${name},</h2>
        <p>We'd appreciate your feedback. Please click below to fill out a short survey:</p>
        <a
          href="${feedbackUrl}"
          style="background-color: #007BFF; color: white; padding: 10px 16px; text-decoration: none; border-radius: 5px;"
        >
          Provide Feedback
        </a>
        <p style="margin-top: 10px;">Or open the link directly: <a href="${feedbackUrl}">${feedbackUrl}</a></p>
        <p>Thank you,<br/>On-Xperience Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("SendGrid Error:", err.response?.body || err.message || err);
    res.status(500).json({
      message: "Email failed to send",
      error: err.response?.body || err.message || "Unknown error",
    });
  }
}
