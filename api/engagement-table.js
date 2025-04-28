const sql = require("mssql");

const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || "*";
const CORS_METHODS = "GET, POST, OPTIONS";
const CORS_HEADERS = "Content-Type";

const dbConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

// Cache SQL connection pool across invocations
let cachedPool = null;

async function getConnection() {
  if (cachedPool) return cachedPool;
  cachedPool = await sql.connect(dbConfig);
  return cachedPool;
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", CORS_ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", CORS_METHODS);
  res.setHeader("Access-Control-Allow-Headers", CORS_HEADERS);

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const pool = await getConnection();

    if (req.method === "GET") {
      // Get all customers from Subscription_Licenses table
      const result = await pool
        .request()
        .query(
          "SELECT SubscriptionID, CustomerName FROM Subscription_Licenses"
        );
      return res.status(200).json(result.recordset);
    }

    if (req.method === "POST") {
      const { SubscriptionID, EngagementType, EngagementPoints } = req.body;

      console.log("POST body received:", req.body);

      if (
        typeof SubscriptionID !== "string" ||
        typeof EngagementType !== "string" ||
        isNaN(EngagementPoints)
      ) {
        return res.status(400).json({ error: "Missing or invalid fields" });
      }

      // Insert the engagement record into Subscription_Engagements
      await pool
        .request()
        .input("SubscriptionID", sql.VarChar, SubscriptionID)
        .input("EngagementType", sql.VarChar, EngagementType)
        .input("EngagementPoints", sql.Int, EngagementPoints)
        .input("EngagementDate", sql.DateTime, new Date()).query(`
          INSERT INTO Subscription_Engagements (SubscriptionID, EngagementType, EngagementPoints, EngagementDate)
          SELECT @SubscriptionID, @EngagementType, @EngagementPoints, @EngagementDate
          WHERE EXISTS (SELECT 1 FROM Subscription_Licenses WHERE SubscriptionID = @SubscriptionID)
        `);

      return res
        .status(200)
        .json({ message: "Engagement updated successfully" });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("SQL error:", err);
    return res
      .status(500)
      .json({ error: `Failed to update engagement: ${err.message}` });
  }
};
