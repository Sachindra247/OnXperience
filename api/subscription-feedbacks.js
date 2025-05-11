const sql = require("mssql");

const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || "*";
const CORS_METHODS = "GET, POST, PUT, OPTIONS";
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
        SELECT sl.SubscriptionID, sl.CustomerName, sf.SurveyScore, sf.NPSScore
        FROM Subscription_Licenses sl
        LEFT JOIN Subscription_Feedbacks sf ON sl.SubscriptionID = sf.SubscriptionID
        ORDER BY sl.SubscriptionID
      `);

      return res.status(200).json(result.recordset);
    }

    if (req.method === "POST" || req.method === "PUT") {
      const { SubscriptionID, SurveyScore, NPSScore } = req.body;

      if (!SubscriptionID || SurveyScore == null || NPSScore == null) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Clamp values between 0 and 10
      const clampedSurvey = Math.max(0, Math.min(10, Math.round(SurveyScore)));
      const clampedNPS = Math.max(0, Math.min(10, Math.round(NPSScore)));

      await pool
        .request()
        .input("SubscriptionID", sql.VarChar, SubscriptionID)
        .input("SurveyScore", sql.Int, clampedSurvey)
        .input("NPSScore", sql.Int, clampedNPS).query(`
          MERGE INTO Subscription_Feedbacks AS target
          USING (SELECT @SubscriptionID AS SubscriptionID) AS source
          ON target.SubscriptionID = source.SubscriptionID
          WHEN MATCHED THEN
            UPDATE SET
              SurveyScore = @SurveyScore,
              NPSScore = @NPSScore
          WHEN NOT MATCHED THEN
            INSERT (SubscriptionID, SurveyScore, NPSScore)
            VALUES (@SubscriptionID, @SurveyScore, @NPSScore);
        `);

      return res
        .status(200)
        .json({ message: "Feedback saved", SubscriptionID });
    }

    res.status(405).end(); // Method Not Allowed
  } catch (err) {
    console.error("Error in subscription-feedbacks handler:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};
