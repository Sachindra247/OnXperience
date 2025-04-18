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
      const result = await pool
        .request()
        .query("SELECT * FROM Subscription_Licenses");
      return res.status(200).json(result.recordset);
    }

    if (req.method === "POST") {
      const { SubscriptionID, LicensesPurchased, LicensesUsed } = req.body;

      console.log("POST body received:", req.body);

      const parsedPurchased = Number(LicensesPurchased);
      const parsedUsed = Number(LicensesUsed);

      if (
        typeof SubscriptionID !== "string" ||
        isNaN(parsedPurchased) ||
        isNaN(parsedUsed)
      ) {
        return res.status(400).json({ error: "Missing or invalid fields" });
      }

      await pool
        .request()
        .input("SubscriptionID", sql.VarChar, SubscriptionID)
        .input("LicensesPurchased", sql.Int, parsedPurchased)
        .input("LicensesUsed", sql.Int, parsedUsed).query(`
            UPDATE Subscription_Licenses
            SET LicensesPurchased = @LicensesPurchased,
                LicensesUsed = @LicensesUsed
            WHERE SubscriptionID = @SubscriptionID
          `);

      return res.status(200).json({ message: "Data updated successfully" });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("SQL error:", err);
    return res.status(500).json({ error: "Failed to fetch or update data" });
  }
};
