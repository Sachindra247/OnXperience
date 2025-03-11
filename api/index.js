const axios = require("axios");

// Load CORS settings from environment variables
const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || "*"; // Allow all origins or specify frontend URL
const CORS_METHODS = process.env.CORS_METHODS || "GET, POST, OPTIONS";
const CORS_HEADERS = process.env.CORS_HEADERS || "Content-Type, Authorization";

// Azure Power BI Credentials (Ensure these are set in Vercel environment variables)
const POWER_BI_CLIENT_ID = process.env.POWER_BI_CLIENT_ID;
const POWER_BI_CLIENT_SECRET = process.env.POWER_BI_CLIENT_SECRET;
const POWER_BI_TENANT_ID = process.env.POWER_BI_TENANT_ID;
const POWER_BI_WORKSPACE_ID = process.env.POWER_BI_WORKSPACE_ID;
const POWER_BI_REPORT_ID = process.env.POWER_BI_REPORT_ID;

// Function to get access token from Azure
const getAccessToken = async () => {
  const url = `https://login.microsoftonline.com/${POWER_BI_TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", POWER_BI_CLIENT_ID);
  params.append("client_secret", POWER_BI_CLIENT_SECRET);
  params.append("scope", "https://analysis.windows.net/powerbi/api/.default");

  try {
    const response = await axios.post(url, params);
    console.log("Access Token fetched successfully");
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error fetching access token:",
      error.response?.data || error
    );
    throw new Error("Failed to get access token");
  }
};

// API handler for Vercel
module.exports = async (req, res) => {
  // Prevent API from interfering with static files
  if (
    req.url.startsWith("/static/") ||
    req.url.startsWith("/favicon.ico") ||
    req.url.startsWith("/logo192.png") ||
    req.url.startsWith("/manifest.json")
  ) {
    return res.status(404).send("Not found");
  }

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", CORS_ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", CORS_METHODS);
  res.setHeader("Access-Control-Allow-Headers", CORS_HEADERS);

  // Handle preflight request for CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const accessToken = await getAccessToken();
    const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${POWER_BI_WORKSPACE_ID}/reports/${POWER_BI_REPORT_ID}/GenerateToken`;

    const embedTokenResponse = await axios.post(
      embedTokenUrl,
      { accessLevel: "view" },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("Embed token generated successfully");

    // Send embed token as JSON response
    res.status(200).json({ embedToken: embedTokenResponse.data.token });
  } catch (error) {
    console.error(
      "Error generating embed token:",
      error.response?.data || error
    );
    res.status(500).json({ error: "Failed to generate embed token" });
  }
};
