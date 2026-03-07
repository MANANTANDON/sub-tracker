import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import jwt from "jsonwebtoken";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get token from headers
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified for user:", decoded.userId);

    // Connect to DB
    await connectDB();

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.googleAccessToken) {
      return res.status(400).json({ error: "No Gmail access token" });
    }

    console.log("Fetching subscriptions from Gmail...");

    // Fetch emails from Gmail
    const subscriptions = await getSubscriptionEmails(user.googleAccessToken);
    console.log("Found subscriptions:", subscriptions);

    // Save to MongoDB
    for (let sub of subscriptions) {
      await Subscription.findOneAndUpdate(
        { userId: user._id, name: sub.name },
        {
          ...sub,
          userId: user._id,
          lastEmailDate: new Date(),
        },
        { upsert: true, new: true },
      );
    }

    // Update user's last sync time
    user.lastSyncedAt = new Date();
    await user.save();

    // Get all subscriptions for this user
    const allSubscriptions = await Subscription.find({ userId: user._id });

    res.status(200).json({ subscriptions: allSubscriptions });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ error: error.message });
  }
}

async function getSubscriptionEmails(accessToken) {
  const services = [
    {
      name: "Netflix",
      senders: ["info@netflix.com", "billing@netflix.com"],
      category: "Streaming",
    },
    {
      name: "Spotify",
      senders: ["noreply@spotify.com"],
      category: "Music",
    },
    {
      name: "Prime Video",
      senders: ["digital-orders@amazon.com", "payments-noreply@amazon.com"],
      category: "Streaming",
    },
  ];

  const subscriptions = [];

  for (let service of services) {
    const query = `from:(${service.senders.join(" OR ")}) subject:(billing OR payment OR renewal OR confirm OR charge)`;

    try {
      console.log(`Fetching ${service.name} emails...`);

      // Query Gmail API
      const listResponse = await axios.get(
        "https://www.googleapis.com/gmail/v1/users/me/messages",
        {
          params: { q: query, maxResults: 3 },
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (listResponse.data.messages && listResponse.data.messages.length > 0) {
        const messageId = listResponse.data.messages[0].id;

        // Get full message
        const messageResponse = await axios.get(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
          {
            params: { format: "full" },
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        const email = messageResponse.data;
        const parsed = parseEmail(service.name, service.category, email);

        if (parsed) {
          subscriptions.push(parsed);
          console.log(`✅ Parsed ${service.name}:`, parsed);
        }
      }
    } catch (error) {
      console.log(`Error fetching ${service.name}:`, error.message);
    }
  }

  return subscriptions;
}

function parseEmail(serviceName, category, emailData) {
  try {
    const body = getEmailBody(emailData.payload);

    // Extract price
    const priceMatch = body.match(/[\$€£]\s*(\d+[\d,]*\.?\d{0,2})/);
    const amount = priceMatch ? priceMatch[0] : "Unknown";

    // Extract date
    const datePatterns = [
      /next (?:billing|charge|renewal|payment).*?(\w+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i,
      /renewal.*?(\w+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i,
      /(?:will be charged|next charge).*?(\w+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i,
    ];

    let nextDate = "Unknown";
    for (let pattern of datePatterns) {
      const match = body.match(pattern);
      if (match) {
        nextDate = match[1];
        break;
      }
    }

    return {
      name: serviceName,
      amount,
      currency: amount.includes("$") ? "USD" : "EUR",
      nextBillingDate: nextDate,
      category,
      status: "active",
      billingCycle: "monthly",
    };
  } catch (error) {
    console.log("Error parsing email:", error.message);
    return null;
  }
}

function getEmailBody(payload) {
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  if (payload.parts) {
    return payload.parts
      .map((p) => getEmailBody(p))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}
