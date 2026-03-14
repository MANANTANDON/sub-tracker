import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`;

export default async function handler(req, res) {
  const { code } = req.query;
  let email = null;

  console.log("OAuth callback received with code:", code);

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    // Step 1: Exchange code for tokens with Google
    console.log("Exchanging code for tokens...");

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error("Token response error:", tokenData);
      return res.status(500).json({ error: "Failed to get access token" });
    }

    const googleAccessToken = tokenData.access_token;
    const googleRefreshToken = tokenData.refresh_token || null;

    console.log("Got access token!");

    // Fetch user info from Google to get email
    try {
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        {
          headers: { Authorization: `Bearer ${googleAccessToken}` },
        },
      );
      const userInfo = await userInfoResponse.json();
      console.log("Google user info:", userInfo);
      email = userInfo.email;
      if (!email) {
        console.error("No email in response:", userInfo);
        return res
          .status(400)
          .json({ error: "Could not get email from Google" });
      }
      console.log("Got user email from Google:", email);
    } catch (error) {
      console.error("Error fetching user info:", error);
      return res
        .status(500)
        .json({ error: `Failed to get user info: ${error.message}` });
    }

    // Step 2: Connect to MongoDB
    await connectDB();
    console.log("Connected to MongoDB");

    // Step 3: Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new user:", email);
      user = new User({
        email,
        password: "",
        googleAccessToken: googleAccessToken,
        googleRefreshToken: googleRefreshToken,
      });
    } else {
      console.log("Updating existing user:", email);
      user.googleAccessToken = googleAccessToken;
      if (googleRefreshToken) {
        user.googleRefreshToken = googleRefreshToken;
      }
    }

    await user.save();
    console.log("User saved to database");

    // Step 4: Create JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log("JWT token created");

    // Step 5: Redirect to dashboard with token
    res.redirect(`/dashboard?token=${jwtToken}`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: `Authentication failed: ${error.message}` });
  }
}
