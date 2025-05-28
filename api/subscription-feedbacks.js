// const sql = require("mssql");

// const dbConfig = {
//   user: process.env.AZURE_SQL_USER,
//   password: process.env.AZURE_SQL_PASSWORD,
//   server: process.env.AZURE_SQL_SERVER,
//   database: process.env.AZURE_SQL_DATABASE,
//   options: {
//     encrypt: true,
//     enableArithAbort: true,
//     trustServerCertificate: true,
//     connectionTimeout: 30000,
//     requestTimeout: 30000,
//     pool: {
//       max: 10,
//       min: 0,
//       idleTimeoutMillis: 30000,
//     },
//   },
// };

// let pool;
// const getPool = async () => {
//   try {
//     if (pool && pool.connected) return pool;

//     console.log("Creating new database connection pool...");
//     pool = new sql.ConnectionPool(dbConfig);

//     pool.on("error", (err) => {
//       console.error("Database pool error:", err);
//       pool = null;
//     });

//     await pool.connect();
//     console.log("Successfully connected to SQL database");
//     return pool;
//   } catch (err) {
//     console.error("Database connection error:", err);
//     throw new Error("Failed to connect to database");
//   }
// };

// module.exports = async (req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Access-Control-Max-Age", "86400");

//   if (req.method === "OPTIONS") {
//     return res.status(204).end();
//   }

//   try {
//     const pool = await getPool();

//     if (req.method === "GET") {
//       try {
//         const result = await pool.request().query(`
//           SELECT TOP 100
//             sl.SubscriptionID,
//             sl.CustomerName,
//             sf.SurveyScore,
//             sf.NPSScore,
//             sf.LastUpdated
//           FROM Subscription_Licenses sl
//           LEFT JOIN Subscription_Feedbacks sf ON sl.SubscriptionID = sf.SubscriptionID
//           ORDER BY sf.LastUpdated DESC
//         `);

//         const data = result.recordset.map((row) => ({
//           ...row,
//           SurveyScore: row.SurveyScore ?? 0,
//           NPSScore: row.NPSScore ?? 0,
//         }));

//         return res.status(200).json(data);
//       } catch (err) {
//         console.error("GET Error:", err);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to retrieve feedback data",
//           error: err.message,
//           stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//         });
//       }
//     }

//     if (req.method === "PUT") {
//       let transaction;
//       try {
//         const { SubscriptionID, NPSScore, SurveyScore } = req.body;

//         if (!SubscriptionID) {
//           return res.status(400).json({
//             success: false,
//             message: "SubscriptionID is required",
//           });
//         }

//         transaction = new sql.Transaction(pool);
//         await transaction.begin();

//         const mergeRequest = new sql.Request(transaction);
//         await mergeRequest
//           .input("SubscriptionID", sql.VarChar, SubscriptionID)
//           .input("NPSScore", sql.Int, NPSScore || 0)
//           .input("SurveyScore", sql.Int, SurveyScore || 0).query(`
//             MERGE INTO Subscription_Feedbacks AS target
//             USING (SELECT @SubscriptionID AS SubscriptionID) AS source
//             ON target.SubscriptionID = source.SubscriptionID
//             WHEN MATCHED THEN
//               UPDATE SET
//                 NPSScore = @NPSScore,
//                 SurveyScore = @SurveyScore,
//                 LastUpdated = GETDATE()
//             WHEN NOT MATCHED THEN
//               INSERT (SubscriptionID, NPSScore, SurveyScore)
//               VALUES (@SubscriptionID, @NPSScore, @SurveyScore);
//           `);

//         await transaction.commit();

//         return res.status(200).json({
//           success: true,
//           message: "Feedback updated successfully",
//           SubscriptionID,
//           NPSScore: NPSScore || 0,
//           SurveyScore: SurveyScore || 0,
//         });
//       } catch (err) {
//         console.error("PUT Error:", err);
//         if (transaction) {
//           try {
//             await transaction.rollback();
//             console.log("Transaction rolled back");
//           } catch (rollbackErr) {
//             console.error("Rollback failed:", rollbackErr);
//           }
//         }
//         return res.status(500).json({
//           success: false,
//           message: "Failed to update feedback",
//           error: err.message,
//           stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//         });
//       }
//     }

//     return res.status(405).json({
//       success: false,
//       message: "Method not allowed",
//     });
//   } catch (err) {
//     console.error("API handler error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//       stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//     });
//   }
// };

//Email ratings modification

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

    pool.on("error", (err) => {
      console.error("Database pool error:", err);
      pool = null;
    });

    await pool.connect();
    console.log("Successfully connected to SQL database");
    return pool;
  } catch (err) {
    console.error("Database connection error:", err);
    throw new Error("Failed to connect to database");
  }
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const pool = await getPool();

    if (req.method === "GET") {
      try {
        const result = await pool.request().query(`
          SELECT TOP 100
            sl.SubscriptionID,
            sl.CustomerName,
            sf.SurveyScore,
            sf.SurveyQ1,
            sf.SurveyQ2,
            sf.SurveyQ3,
            sf.NPSScore,
            sf.LastUpdated
          FROM Subscription_Licenses sl
          LEFT JOIN Subscription_Feedbacks sf ON sl.SubscriptionID = sf.SubscriptionID
          ORDER BY sf.LastUpdated DESC
        `);

        const data = result.recordset.map((row) => ({
          ...row,
          SurveyScore: row.SurveyScore ?? 0,
          SurveyQ1: row.SurveyQ1 ?? 0,
          SurveyQ2: row.SurveyQ2 ?? 0,
          SurveyQ3: row.SurveyQ3 ?? 0,
          NPSScore: row.NPSScore ?? 0,
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
      let transaction;
      try {
        const {
          SubscriptionID,
          NPSScore,
          SurveyScore,
          SurveyQ1,
          SurveyQ2,
          SurveyQ3,
        } = req.body;

        if (!SubscriptionID) {
          return res.status(400).json({
            success: false,
            message: "SubscriptionID is required",
          });
        }

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const mergeRequest = new sql.Request(transaction);
        await mergeRequest
          .input("SubscriptionID", sql.VarChar, SubscriptionID)
          .input("NPSScore", sql.Int, NPSScore || 0)
          .input("SurveyScore", sql.Int, SurveyScore || 0)
          .input("SurveyQ1", sql.Int, SurveyQ1 || 0)
          .input("SurveyQ2", sql.Int, SurveyQ2 || 0)
          .input("SurveyQ3", sql.Int, SurveyQ3 || 0).query(`
            MERGE INTO Subscription_Feedbacks AS target
            USING (SELECT @SubscriptionID AS SubscriptionID) AS source
            ON target.SubscriptionID = source.SubscriptionID
            WHEN MATCHED THEN
              UPDATE SET
                NPSScore = @NPSScore,
                SurveyScore = @SurveyScore,
                SurveyQ1 = @SurveyQ1,
                SurveyQ2 = @SurveyQ2,
                SurveyQ3 = @SurveyQ3,
                LastUpdated = GETDATE()
            WHEN NOT MATCHED THEN
              INSERT (SubscriptionID, NPSScore, SurveyScore, SurveyQ1, SurveyQ2, SurveyQ3)
              VALUES (@SubscriptionID, @NPSScore, @SurveyScore, @SurveyQ1, @SurveyQ2, @SurveyQ3);
          `);

        await transaction.commit();

        return res.status(200).json({
          success: true,
          message: "Feedback updated successfully",
          SubscriptionID,
          NPSScore: NPSScore || 0,
          SurveyScore: SurveyScore || 0,
          SurveyQ1: SurveyQ1 || 0,
          SurveyQ2: SurveyQ2 || 0,
          SurveyQ3: SurveyQ3 || 0,
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
