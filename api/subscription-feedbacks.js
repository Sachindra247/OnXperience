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
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const validateToken = async (pool, token, subscriptionId) => {
  const result = await pool
    .request()
    .input("Token", sql.VarChar, token)
    .input("SubscriptionID", sql.VarChar, subscriptionId).query(`
      SELECT * FROM Feedback_Tokens
      WHERE Token = @Token
        AND SubscriptionID = @SubscriptionID
        AND Expiry > GETDATE()
        AND Used = 0
    `);
  return result.recordset.length > 0;
};

const sendFeedbackEmail = async (emailData) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: emailData.customerEmail,
    subject: "We'd love your feedback!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <h2 style="color: #2c3e50;">Hi ${emailData.customerName},</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you for being a valued customer. We're constantly working to improve our service
            and would greatly appreciate your feedback.
          </p>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${emailData.feedbackLink}" style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #3498db;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              font-size: 16px;
            ">Share Your Feedback</a>
          </div>

          <p style="font-size: 14px; color: #7f8c8d;">
            This link will expire in 7 days. If you didn't request this survey,
            please ignore this email.
          </p>

          <p style="font-size: 16px; line-height: 1.5;">
            We appreciate your time and look forward to serving you better!
          </p>

          <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">
            Best regards,<br>
            <strong>The ${process.env.COMPANY_NAME} Team</strong>
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
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
          SELECT
            sl.SubscriptionID,
            sl.CustomerName,
            sl.CustomerEmail,
            sf.SurveyScore,
            sf.NPSScore,
            sf.SurveyQ1,
            sf.SurveyQ2,
            sf.SurveyQ3,
            sf.LastUpdated,
            (SELECT COUNT(*) FROM Feedback_Tokens ft
             WHERE ft.SubscriptionID = sl.SubscriptionID
             AND ft.Used = 0 AND ft.Expiry > GETDATE()) as PendingRequests
          FROM Subscription_Licenses sl
          LEFT JOIN Subscription_Feedbacks sf ON sl.SubscriptionID = sf.SubscriptionID
          ORDER BY sf.LastUpdated DESC
          LIMIT 100
        `);

        const data = result.recordset.map((row) => ({
          SubscriptionID: row.SubscriptionID,
          CustomerName: row.CustomerName,
          CustomerEmail: row.CustomerEmail,
          SurveyScore: row.SurveyScore ?? 0,
          NPSScore: row.NPSScore ?? 0,
          SurveyQ1: row.SurveyQ1 ?? 0,
          SurveyQ2: row.SurveyQ2 ?? 0,
          SurveyQ3: row.SurveyQ3 ?? 0,
          LastUpdated: row.LastUpdated,
          PendingRequests: row.PendingRequests ?? 0,
        }));

        return res.status(200).json(data);
      } catch (err) {
        console.error("GET Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve feedback data",
          error: err.message,
        });
      }
    }

    if (req.method === "POST") {
      try {
        const { subscriptionId, customerEmail, customerName } = req.body;

        if (!subscriptionId || !customerEmail) {
          return res.status(400).json({
            success: false,
            message: "Subscription ID and customer email are required",
          });
        }

        // Generate unique token
        const token = crypto.randomBytes(32).toString("hex");
        const feedbackLink = `${process.env.BASE_URL}/feedback?token=${token}&sub=${subscriptionId}`;

        // Store token in database
        await pool
          .request()
          .input("SubscriptionID", sql.VarChar, subscriptionId)
          .input("Token", sql.VarChar, token)
          .input(
            "Expiry",
            sql.DateTime,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          ).query(`
            INSERT INTO Feedback_Tokens (SubscriptionID, Token, Expiry)
            VALUES (@SubscriptionID, @Token, @Expiry)
          `);

        // Send email
        await sendFeedbackEmail({
          customerEmail,
          customerName,
          feedbackLink,
        });

        return res.status(200).json({
          success: true,
          message: "Feedback request sent successfully",
          data: {
            recipient: customerEmail,
            expiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        });
      } catch (err) {
        console.error("POST Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to process feedback request",
          error: err.message,
        });
      }
    }

    if (req.method === "PUT") {
      let transaction;
      try {
        const {
          SubscriptionID,
          NPSScore = 0,
          SurveyScore = 0,
          SurveyQ1 = 0,
          SurveyQ2 = 0,
          SurveyQ3 = 0,
          token,
        } = req.body;

        if (!SubscriptionID) {
          return res.status(400).json({
            success: false,
            message: "SubscriptionID is required",
          });
        }

        // Validate token if present
        if (token && !(await validateToken(pool, token, SubscriptionID))) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired feedback token",
          });
        }

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
          const request = new sql.Request(transaction);
          await request
            .input("SubscriptionID", sql.VarChar, SubscriptionID)
            .input("NPSScore", sql.Int, NPSScore)
            .input("SurveyScore", sql.Int, SurveyScore)
            .input("SurveyQ1", sql.Int, SurveyQ1)
            .input("SurveyQ2", sql.Int, SurveyQ2)
            .input("SurveyQ3", sql.Int, SurveyQ3).query(`
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

          // Mark token as used if present
          if (token) {
            await new sql.Request(transaction)
              .input("Token", sql.VarChar, token)
              .query(
                "UPDATE Feedback_Tokens SET Used = 1, UsedAt = GETDATE() WHERE Token = @Token"
              );
          }

          await transaction.commit();

          return res.status(200).json({
            success: true,
            message: "Feedback submitted successfully",
            data: {
              SubscriptionID,
              NPSScore,
              SurveyScore,
              SurveyQ1,
              SurveyQ2,
              SurveyQ3,
              submittedAt: new Date().toISOString(),
            },
          });
        } catch (err) {
          await transaction.rollback();
          throw err;
        }
      } catch (err) {
        console.error("PUT Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to submit feedback",
          error: err.message,
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
    });
  }
};
