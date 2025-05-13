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
        SELECT
          sl.SubscriptionID,
          sl.CustomerName,
          sf.SurveyScore,
          sf.NPSScore,
          sf.NPSPercentage,
          sf.Rating,
          sf.Comment,
          (
            SELECT
              Question AS question,
              Score AS score
            FROM Subscription_Feedback_Questions
            WHERE SubscriptionID = sl.SubscriptionID
            FOR JSON PATH
          ) AS SurveyScores
        FROM Subscription_Licenses sl
        LEFT JOIN Subscription_Feedbacks sf ON sl.SubscriptionID = sf.SubscriptionID
        ORDER BY sl.CustomerName, sl.SubscriptionID
      `);

      // Parse the JSON survey scores
      const data = result.recordset.map((row) => ({
        ...row,
        SurveyScores: row.SurveyScores ? JSON.parse(row.SurveyScores) : null,
      }));

      return res.status(200).json(data);
    }

    if (req.method === "PUT") {
      const {
        SubscriptionID,
        SurveyScores,
        SurveyScore,
        NPSPercentage,
        NPSScore,
        Rating,
        Comment,
      } = req.body;

      if (!SubscriptionID) {
        return res.status(400).json({ error: "SubscriptionID is required" });
      }

      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        // Update or insert main feedback record
        await new sql.Request(transaction)
          .input("SubscriptionID", sql.VarChar, SubscriptionID)
          .input("SurveyScore", sql.Decimal(5, 2), SurveyScore || 0)
          .input("NPSPercentage", sql.Int, NPSPercentage || 0)
          .input("NPSScore", sql.Decimal(5, 2), NPSScore || 0)
          .input("Rating", sql.Int, Rating || 0)
          .input("Comment", sql.NVarChar, Comment || "").query(`
            MERGE INTO Subscription_Feedbacks AS target
            USING (SELECT @SubscriptionID AS SubscriptionID) AS source
            ON target.SubscriptionID = source.SubscriptionID
            WHEN MATCHED THEN
              UPDATE SET
                SurveyScore = @SurveyScore,
                NPSPercentage = @NPSPercentage,
                NPSScore = @NPSScore,
                Rating = @Rating,
                Comment = @Comment,
                LastUpdated = GETDATE()
            WHEN NOT MATCHED THEN
              INSERT (
                SubscriptionID,
                SurveyScore,
                NPSPercentage,
                NPSScore,
                Rating,
                Comment
              )
              VALUES (
                @SubscriptionID,
                @SurveyScore,
                @NPSPercentage,
                @NPSScore,
                @Rating,
                @Comment
              );
          `);

        // Update survey questions
        await new sql.Request(transaction)
          .input("SubscriptionID", sql.VarChar, SubscriptionID)
          .query(
            "DELETE FROM Subscription_Feedback_Questions WHERE SubscriptionID = @SubscriptionID"
          );

        if (Array.isArray(SurveyScores)) {
          for (const q of SurveyScores) {
            if (q.question && typeof q.score === "number") {
              await new sql.Request(transaction)
                .input("SubscriptionID", sql.VarChar, SubscriptionID)
                .input("Question", sql.NVarChar, q.question)
                .input("Score", sql.Int, q.score).query(`
                  INSERT INTO Subscription_Feedback_Questions (
                    SubscriptionID,
                    Question,
                    Score
                  ) VALUES (
                    @SubscriptionID,
                    @Question,
                    @Score
                  );
                `);
            }
          }
        }

        await transaction.commit();
        return res.status(200).json({
          success: true,
          SubscriptionID,
          SurveyScore,
          NPSScore,
          NPSPercentage,
        });
      } catch (innerErr) {
        await transaction.rollback();
        console.error("Transaction error:", innerErr);
        throw innerErr;
      }
    }

    res.status(405).end();
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message,
    });
  }
};
