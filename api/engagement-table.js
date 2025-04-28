const sql = require("mssql");

const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || "*";
const CORS_METHODS = "GET, POST, OPTIONS, PUT";
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
            engagements: row.EngagementType
              ? [
                  {
                    engagement: row.EngagementType,
                    points: row.EngagementPoints,
                    lastUpdated: row.EngagementDate,
                  },
                ]
              : [],
          });
        } else if (row.EngagementType) {
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
      console.log("POST body received:", req.body);
      const { SubscriptionID, EngagementType, EngagementPoints } = req.body;

      if (!SubscriptionID || !EngagementType || EngagementPoints == null) {
        return res
          .status(400)
          .json({ error: "Missing fields in request body" });
      }

      if (
        typeof SubscriptionID !== "string" ||
        typeof EngagementType !== "string" ||
        typeof EngagementPoints !== "number"
      ) {
        return res.status(400).json({ error: "Invalid field types" });
      }

      // Simplified MERGE statement - only updates Subscription_Engagements table
      await pool
        .request()
        .input("SubscriptionID", sql.VarChar, SubscriptionID)
        .input("EngagementType", sql.VarChar, EngagementType)
        .input("EngagementPoints", sql.Int, EngagementPoints).query(`
          MERGE INTO Subscription_Engagements AS target
          USING (SELECT @SubscriptionID AS SubscriptionID, @EngagementType AS EngagementType) AS source
          ON target.SubscriptionID = source.SubscriptionID AND target.EngagementType = source.EngagementType
          WHEN MATCHED THEN
            UPDATE SET
              target.EngagementPoints = target.EngagementPoints + @EngagementPoints,
              target.EngagementDate = GETDATE()
          WHEN NOT MATCHED THEN
            INSERT (SubscriptionID, EngagementType, EngagementPoints, EngagementDate)
            VALUES (@SubscriptionID, @EngagementType, @EngagementPoints, GETDATE());
        `);

      return res.status(200).json({ message: "Engagement added successfully" });
    }

    res.status(405).end(); // Method Not Allowed
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
