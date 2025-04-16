import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AzureTable.css";

const AzureTablePage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedRows, setEditedRows] = useState({}); // Track edited rows

  // Fetch data on component mount
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

  // Handle changes to the edit fields
  const handleEditChange = (id, field, value) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Save changes and send them to the backend
  const handleSave = async (id) => {
    const row = rows.find((r) => r.SubscriptionID === id);
    const updatedRow = editedRows[id];

    if (!updatedRow) return; // No changes made, so no need to save

    try {
      // Send the update request to the server
      await axios.post("https://on-xperience.vercel.app/api/sql-table", {
        SubscriptionID: row.SubscriptionID,
        LicensesPurchased: updatedRow.LicensesPurchased,
        LicensesUsed: updatedRow.LicensesUsed,
      });

      // After saving, fetch the updated data
      const response = await axios.get(
        "https://on-xperience.vercel.app/api/sql-table"
      );
      setRows(response.data);

      // Clear the edited state after saving
      setEditedRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  };

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
            {rows.map((row) => (
              <tr key={row.SubscriptionID}>
                {Object.keys(row).map((col) => {
                  if (col === "LicensesPurchased" || col === "LicensesUsed") {
                    return (
                      <td key={col}>
                        <input
                          type="number"
                          value={
                            editedRows[row.SubscriptionID]
                              ? editedRows[row.SubscriptionID][col]
                              : row[col]
                          }
                          onChange={(e) =>
                            handleEditChange(
                              row.SubscriptionID,
                              col,
                              e.target.value
                            )
                          }
                        />
                        {editedRows[row.SubscriptionID] && (
                          <button
                            onClick={() => handleSave(row.SubscriptionID)}
                          >
                            Save
                          </button>
                        )}
                      </td>
                    );
                  }
                  return <td key={col}>{row[col]}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AzureTablePage;
