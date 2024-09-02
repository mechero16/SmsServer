import express from "express";
import twilio from "twilio";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = 3001;

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// CORS Middleware
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend origin
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.post("/sendsms", async (req, res) => {
  const contacts = req.body.contacts;

  if (!contacts) {
    return res.status(400).json({ error: "No contacts provided" });
  }

  const results = [];
  const errors = [];
  const date = new Date();
  const formattedDate = date.toDateString();

  for (const [name, number] of Object.entries(contacts)) {
    try {
      const message = await client.messages.create({
        body: `Dear Parent/Guardian,\n
We would like to inform you that ${name} is absent from college today, ${formattedDate}. Please ensure that [he/she] catch up on missed work and assignments. If you have any questions or need assistance, feel free to contact us.\n
Thank you for your attention.`,
        from: "+13344328465",
        to: `+91${number}`,
      });

      results.push({ name, number, sid: message.sid });
    } catch (error) {
      errors.push({ name, number, error: error.message });
    }
  }

  res.status(200).json({ results, errors });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
