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

      // Use MERGE to handle insertion or update and sum the points
      await pool
        .request()
        .input("SubscriptionID", sql.VarChar, SubscriptionID)
        .input("EngagementType", sql.VarChar, EngagementType)
        .input("EngagementPoints", sql.Int, EngagementPoints)
        .input("EngagementDate", sql.DateTime, new Date()).query(`
          MERGE INTO dbo.Subscription_Engagements AS target
          USING (SELECT @SubscriptionID AS SubscriptionID, @EngagementType AS EngagementType, @EngagementPoints AS EngagementPoints) AS source
          ON target.SubscriptionID = source.SubscriptionID AND target.EngagementType = source.EngagementType
          WHEN MATCHED THEN
              UPDATE SET target.EngagementPoints = target.EngagementPoints + source.EngagementPoints, target.EngagementDate = @EngagementDate
          WHEN NOT MATCHED THEN
              INSERT (SubscriptionID, EngagementType, EngagementPoints, EngagementDate)
              VALUES (source.SubscriptionID, source.EngagementType, source.EngagementPoints, @EngagementDate);
        `);

      // Update total points (sum of all engagement points)
      const totalPointsResult = await pool
        .request()
        .input("SubscriptionID", sql.VarChar, SubscriptionID).query(`
          SELECT SUM(EngagementPoints) AS TotalPoints
          FROM Subscription_Engagements
          WHERE SubscriptionID = @SubscriptionID
        `);

      const totalPoints = totalPointsResult.recordset[0]?.TotalPoints || 0;

      await pool
        .request()
        .input("SubscriptionID", sql.VarChar, SubscriptionID)
        .input("TotalPoints", sql.Int, totalPoints).query(`
          UPDATE Subscription_Licenses
          SET TotalPoints = @TotalPoints
          WHERE SubscriptionID = @SubscriptionID
        `);

      return res.status(200).json({
        message:
          "Engagement added (or updated) and total points updated successfully",
      });
    }

    if (req.method === "PUT") {
      console.log("PUT body received:", req.body);
      const { SubscriptionID, TotalPoints } = req.body;

      if (!SubscriptionID || TotalPoints == null) {
        return res
          .status(400)
          .json({ error: "Missing fields in request body" });
      }

      if (
        typeof SubscriptionID !== "string" ||
        typeof TotalPoints !== "number"
      ) {
        return res.status(400).json({ error: "Invalid field types" });
      }

      await pool
        .request()
        .input("SubscriptionID", sql.VarChar, SubscriptionID)
        .input("TotalPoints", sql.Int, TotalPoints).query(`
          UPDATE Subscription_Licenses
          SET TotalPoints = @TotalPoints
          WHERE SubscriptionID = @SubscriptionID
        `);

      return res
        .status(200)
        .json({ message: "Total points updated successfully" });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("SQL error:", err);
    return res
      .status(500)
      .json({ error: `Failed to process request: ${err.message}` });
  }
};
