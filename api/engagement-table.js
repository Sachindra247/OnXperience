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
        ORDER BY sl.SubscriptionID, se.EngagementDate DESC
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

    if (req.method === "POST" || req.method === "PUT") {
      console.log("Request body received:", req.body);
      const { SubscriptionID, EngagementType, EngagementPoints, UpdateType } =
        req.body;

      if (!SubscriptionID || !EngagementType || EngagementPoints == null) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (req.method === "PUT" && UpdateType === "exact") {
        // Handle exact count updates (from the edit count feature)
        await pool
          .request()
          .input("SubscriptionID", sql.VarChar, SubscriptionID)
          .input("EngagementType", sql.VarChar, EngagementType).query(`
            DELETE FROM Subscription_Engagements
            WHERE SubscriptionID = @SubscriptionID
            AND EngagementType = @EngagementType
          `);

        // Only insert new record if points > 0
        if (EngagementPoints > 0) {
          await pool
            .request()
            .input("SubscriptionID", sql.VarChar, SubscriptionID)
            .input("EngagementType", sql.VarChar, EngagementType)
            .input("EngagementPoints", sql.Int, EngagementPoints).query(`
              INSERT INTO Subscription_Engagements
                (SubscriptionID, EngagementType, EngagementPoints, EngagementDate)
              VALUES
                (@SubscriptionID, @EngagementType, @EngagementPoints, GETDATE())
            `);
        }
      } else {
        // Original merge behavior for POST requests and PUT without UpdateType
        await pool
          .request()
          .input("SubscriptionID", sql.VarChar, SubscriptionID)
          .input("EngagementType", sql.VarChar, EngagementType)
          .input("EngagementPoints", sql.Int, EngagementPoints).query(`
            MERGE INTO Subscription_Engagements AS target
            USING (SELECT @SubscriptionID AS SubscriptionID,
                          @EngagementType AS EngagementType,
                          @EngagementPoints AS EngagementPoints) AS source
            ON target.SubscriptionID = source.SubscriptionID
               AND target.EngagementType = source.EngagementType
            WHEN MATCHED THEN
              UPDATE SET
                target.EngagementPoints = target.EngagementPoints + source.EngagementPoints,
                target.EngagementDate = GETDATE()
            WHEN NOT MATCHED THEN
              INSERT (SubscriptionID, EngagementType, EngagementPoints, EngagementDate)
              VALUES (source.SubscriptionID, source.EngagementType, source.EngagementPoints, GETDATE());
          `);
      }

      return res.status(200).json({
        message: "Engagement updated successfully",
        subscriptionId: SubscriptionID,
        engagementType: EngagementType,
      });
    }

    res.status(405).end(); // Method Not Allowed
  } catch (err) {
    console.error("Error in request handler:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};
