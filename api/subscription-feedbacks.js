const sql = require("mssql");

const dbConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
};

let pool;
const getPool = async () => {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  return pool;
};

const calculateSurveyScore = (surveyScores) => {
  if (!surveyScores?.length) return 0;

  const totalScore = surveyScores.reduce((sum, q) => sum + q.score, 0);
  const averageScore = totalScore / surveyScores.length;
  const normalizedScore = (averageScore / 5) * 100; // Convert 0-5 scale to 0-100
  return Math.round(normalizedScore);
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const pool = await getPool();

    if (req.method === "GET") {
      try {
        const result = await pool.request().query(`
          SELECT
            sl.SubscriptionID,
            sl.CustomerName,
            sf.SurveyScore,
            sf.NPSPercentage,
            sf.NPSScore,
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
          ORDER BY sl.CustomerName
        `);

        const data = result.recordset.map((row) => ({
          ...row,
          SurveyScores: row.SurveyScores ? JSON.parse(row.SurveyScores) : [],
        }));

        return res.status(200).json(data);
      } catch (err) {
        console.error("Database query error:", err);
        return res.status(500).json({
          error: "Database error",
          details: err.message,
        });
      }
    }

    if (req.method === "PUT") {
      const { SubscriptionID, SurveyScores, NPSPercentage } = req.body;

      if (!SubscriptionID) {
        return res.status(400).json({ error: "SubscriptionID is required" });
      }

      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();

        // Calculate scores
        const surveyScore = calculateSurveyScore(SurveyScores);
        const npsScore = Math.round((NPSPercentage / 100) * 100);

        // Update main feedback record
        await new sql.Request(transaction)
          .input("SubscriptionID", sql.VarChar, SubscriptionID)
          .input("SurveyScore", sql.Int, surveyScore)
          .input("NPSPercentage", sql.Int, NPSPercentage || 0)
          .input("NPSScore", sql.Int, npsScore || 0).query(`
            MERGE INTO Subscription_Feedbacks AS target
            USING (SELECT @SubscriptionID AS SubscriptionID) AS source
            ON target.SubscriptionID = source.SubscriptionID
            WHEN MATCHED THEN
              UPDATE SET
                SurveyScore = @SurveyScore,
                NPSPercentage = @NPSPercentage,
                NPSScore = @NPSScore,
                LastUpdated = GETDATE()
            WHEN NOT MATCHED THEN
              INSERT (SubscriptionID, SurveyScore, NPSPercentage, NPSScore)
              VALUES (@SubscriptionID, @SurveyScore, @NPSPercentage, @NPSScore);
          `);

        // Update survey questions
        await new sql.Request(transaction).input(
          "SubscriptionID",
          sql.VarChar,
          SubscriptionID
        ).query(`
            DELETE FROM Subscription_Feedback_Questions
            WHERE SubscriptionID = @SubscriptionID
          `);

        if (SurveyScores?.length > 0) {
          for (const q of SurveyScores) {
            await new sql.Request(transaction)
              .input("SubscriptionID", sql.VarChar, SubscriptionID)
              .input("Question", sql.NVarChar, q.question)
              .input("Score", sql.Int, q.score).query(`
                INSERT INTO Subscription_Feedback_Questions
                (SubscriptionID, Question, Score)
                VALUES (@SubscriptionID, @Question, @Score)
              `);
          }
        }

        await transaction.commit();

        return res.status(200).json({
          success: true,
          SubscriptionID,
          SurveyScore: surveyScore,
          NPSPercentage,
          NPSScore: npsScore,
        });
      } catch (err) {
        await transaction.rollback();
        console.error("Transaction error:", err);
        return res.status(500).json({
          error: "Database transaction failed",
          details: err.message,
        });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("API handler error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};
