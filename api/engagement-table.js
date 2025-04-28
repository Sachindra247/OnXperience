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
      // Get all customers from Subscription_Licenses table with their engagements
      const result = await pool.request().query(`
          SELECT sl.SubscriptionID, sl.CustomerName, se.EngagementType, se.EngagementPoints, se.EngagementDate
          FROM Subscription_Licenses sl
          LEFT JOIN Subscription_Engagements se ON sl.SubscriptionID = se.SubscriptionID
        `);

      const customers = result.recordset.reduce((acc, row) => {
        const customerIndex = acc.findIndex(
          (customer) => customer.SubscriptionID === row.SubscriptionID
        );

        if (customerIndex === -1) {
          acc.push({
            SubscriptionID: row.SubscriptionID,
            CustomerName: row.CustomerName,
            engagements: [
              {
                engagement: row.EngagementType,
                points: row.EngagementPoints,
                lastUpdated: row.EngagementDate,
              },
            ],
          });
        } else {
          acc[customerIndex].engagements.push({
            engagement: row.EngagementType,
            points: row.EngagementPoints,
            lastUpdated: row.EngagementDate,
          });
        }

        return acc;
      }, []);

      return res.status(200).json(customers);
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
          VALUES (@SubscriptionID, @EngagementType, @EngagementPoints, @EngagementDate)
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
