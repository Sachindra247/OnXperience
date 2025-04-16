const sql = require("mssql");

// Enable CORS (customize as needed)
const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || "*";
const CORS_METHODS = "GET, POST, OPTIONS";
const CORS_HEADERS = "Content-Type";

// Azure SQL DB config (store these in Vercel env variables)
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

module.exports = async (req, res) => {
  // Handle CORS preflight
  res.setHeader("Access-Control-Allow-Origin", CORS_ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", CORS_METHODS);
  res.setHeader("Access-Control-Allow-Headers", CORS_HEADERS);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .query("SELECT * FROM Subscription_Licenses");
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error("SQL error:", err);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  } else if (req.method === "POST") {
    const { SubscriptionID, LicensesPurchased, LicensesUsed } = req.body;

    if (
      !SubscriptionID ||
      LicensesPurchased === undefined ||
      LicensesUsed === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const pool = await sql.connect(dbConfig);
      const request = pool.request();

      // SQL query to update the values
      await request.query(
        `UPDATE Subscription_Licenses
         SET LicensesPurchased = @LicensesPurchased, LicensesUsed = @LicensesUsed
         WHERE SubscriptionID = @SubscriptionID`,
        {
          SubscriptionID,
          LicensesPurchased,
          LicensesUsed,
        }
      );

      res.status(200).json({ message: "Data updated successfully" });
    } catch (err) {
      console.error("SQL error:", err);
      res.status(500).json({ error: "Failed to update data" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
