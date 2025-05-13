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
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};

let pool;
const getPool = async () => {
  try {
    if (pool && pool.connected) return pool;

    console.log("Creating new database connection pool...");
    pool = new sql.ConnectionPool(dbConfig);

    // Attach error handler
    pool.on("error", (err) => {
      console.error("Database pool error:", err);
      pool = null; // Force new pool creation on next request
    });

    await pool.connect();
    console.log("Successfully connected to SQL database");
    return pool;
  } catch (err) {
    console.error("Database connection error:", err);
    throw new Error("Failed to connect to database");
  }
};

const calculateSurveyScore = (surveyScores) => {
  if (!surveyScores?.length) return 0;

  const totalScore = surveyScores.reduce((sum, q) => sum + q.score, 0);
  const averageScore = totalScore / surveyScores.length;
  const normalizedScore = (averageScore / 5) * 100; // Convert 0-5 scale to 0-100
  return Math.round(normalizedScore);
};

module.exports = async (req, res) => {
  // Enhanced CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    console.log(`Handling ${req.method} request for ${req.url}`);
    const pool = await getPool();

    if (req.method === "GET") {
      try {
        console.log("Executing GET query...");
        const result = await pool.request().query(`
          SELECT TOP 100
            sl.SubscriptionID,
            sl.CustomerName,
            sf.SurveyScore,
            sf.NPSPercentage,
            sf.NPSScore,
            sf.LastUpdated,
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
          ORDER BY sf.LastUpdated DESC
        `);

        if (!result.recordset) {
          throw new Error("No data returned from query");
        }

        console.log(`Retrieved ${result.recordset.length} records`);

        const data = result.recordset.map((row) => ({
          ...row,
          SurveyScores: row.SurveyScores ? JSON.parse(row.SurveyScores) : [],
        }));

        return res.status(200).json(data);
      } catch (err) {
        console.error("GET Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve feedback data",
          error: err.message,
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
      }
    }

    if (req.method === "PUT") {
      let transaction; // Declare transaction at the function scope

      try {
        const { SubscriptionID, SurveyScores, NPSPercentage } = req.body;
        console.log("PUT request data:", {
          SubscriptionID,
          SurveyScores,
          NPSPercentage,
        });

        if (!SubscriptionID) {
          return res.status(400).json({
            success: false,
            message: "SubscriptionID is required",
          });
        }

        // Start transaction
        transaction = new sql.Transaction(pool);
        await transaction.begin();
        console.log("Transaction started");

        // Calculate scores
        const surveyScore = calculateSurveyScore(SurveyScores);
        const npsScore = Math.round((NPSPercentage / 100) * 100);
        console.log("Calculated scores:", { surveyScore, npsScore });

        // Update main feedback record
        const mergeRequest = new sql.Request(transaction);
        await mergeRequest
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
        console.log("Main feedback record updated");

        // Update survey questions
        const deleteRequest = new sql.Request(transaction);
        await deleteRequest.input("SubscriptionID", sql.VarChar, SubscriptionID)
          .query(`
            DELETE FROM Subscription_Feedback_Questions
            WHERE SubscriptionID = @SubscriptionID
          `);
        console.log("Cleared existing survey questions");

        if (SurveyScores?.length > 0) {
          console.log(`Inserting ${SurveyScores.length} survey questions`);
          for (const q of SurveyScores) {
            const insertRequest = new sql.Request(transaction);
            await insertRequest
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
        console.log("Transaction committed successfully");

        return res.status(200).json({
          success: true,
          message: "Feedback updated successfully",
          SubscriptionID,
          SurveyScore: surveyScore,
          NPSPercentage,
          NPSScore: npsScore,
        });
      } catch (err) {
        console.error("PUT Error:", err);
        if (transaction) {
          try {
            await transaction.rollback();
            console.log("Transaction rolled back");
          } catch (rollbackErr) {
            console.error("Rollback failed:", rollbackErr);
          }
        }
        return res.status(500).json({
          success: false,
          message: "Failed to update feedback",
          error: err.message,
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
      }
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (err) {
    console.error("API handler error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
