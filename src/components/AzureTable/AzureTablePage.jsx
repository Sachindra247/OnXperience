import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AzureTable.css";

const AzureTablePage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedRows, setEditedRows] = useState({});

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

  const handleEditChange = (id, field, value) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id) => {
    const row = rows.find((r) => r.SubscriptionID === id);
    const updatedRow = editedRows[id];

    if (!updatedRow) return;

    const licensesPurchased =
      parseInt(updatedRow.LicensesPurchased ?? row.LicensesPurchased) || 0;
    const licensesUsed =
      parseInt(updatedRow.LicensesUsed ?? row.LicensesUsed) || 0;

    // Validation check
    if (licensesUsed > licensesPurchased) {
      alert("Licenses Used cannot be greater than Licenses Purchased.");
      return;
    }

    console.log("Saving row:", {
      SubscriptionID: row.SubscriptionID,
      LicensesPurchased: licensesPurchased,
      LicensesUsed: licensesUsed,
    });

    try {
      await axios.post("https://on-xperience.vercel.app/api/sql-table", {
        SubscriptionID: row.SubscriptionID,
        LicensesPurchased: licensesPurchased,
        LicensesUsed: licensesUsed,
      });

      const response = await axios.get(
        "https://on-xperience.vercel.app/api/sql-table"
      );
      setRows(response.data);

      setEditedRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error(
        "Failed to save data:",
        error.response?.data || error.message
      );
    }
  };

  const isRowEdited = (id) => editedRows.hasOwnProperty(id);

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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const editedRow = editedRows[row.SubscriptionID] || {};
              return (
                <tr key={row.SubscriptionID}>
                  {Object.keys(row).map((col) => {
                    if (col === "LicensesPurchased" || col === "LicensesUsed") {
                      return (
                        <td key={col}>
                          <input
                            type="number"
                            value={
                              editedRow[col] !== undefined
                                ? editedRow[col]
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
                        </td>
                      );
                    }
                    return <td key={col}>{row[col]}</td>;
                  })}
                  <td>
                    {isRowEdited(row.SubscriptionID) && (
                      <button onClick={() => handleSave(row.SubscriptionID)}>
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AzureTablePage;
