// components/AzureTable/AzureTablePage.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AzureTable.css";

const AzureTablePage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await axios.get(
          "https://on-xperience.vercel.app/api/sql-table"
        );
        setRows(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch SQL table:", error);
        setLoading(false);
      }
    };

    fetchTableData();
  }, []);

  return (
    <div className="azure-table-wrapper">
      {loading ? (
        <p>Loading table data...</p>
      ) : (
        <table className="azure-table">
          <thead>
            <tr>
              {rows.length > 0 &&
                Object.keys(rows[0]).map((col) => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AzureTablePage;
