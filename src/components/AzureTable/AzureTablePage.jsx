import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AzureTable.css";

const AzureTablePage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedRows, setEditedRows] = useState({});
  const [errors, setErrors] = useState({});

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

  const validateLicenses = (id, updatedRow) => {
    const originalRow = rows.find((r) => r.SubscriptionID === id) || {};
    const row = {
      ...originalRow,
      ...editedRows[id],
      ...updatedRow,
    };

    const purchasedNum = parseInt(row.LicensesPurchased) || 0;
    const usedNum = parseInt(row.LicensesUsed) || 0;

    const isInvalid = usedNum > purchasedNum;

    setErrors((prev) => ({
      ...prev,
      [id]: isInvalid,
    }));
  };

  const handleEditChange = (id, field, value) => {
    const newValue = value === "" ? "" : Number(value);

    setEditedRows((prev) => {
      const updatedRow = {
        ...prev[id],
        [field]: newValue,
      };

      // Validate live as user types
      validateLicenses(id, updatedRow);

      return {
        ...prev,
        [id]: updatedRow,
      };
    });
  };

  const handleSave = async (id) => {
    const row = rows.find((r) => r.SubscriptionID === id);
    const updatedRow = editedRows[id];

    if (!updatedRow) return;

    // Final validation before saving
    const isValid = !errors[id];
    if (!isValid) return;

    try {
      await axios.post("https://on-xperience.vercel.app/api/sql-table", {
        SubscriptionID: row.SubscriptionID,
        LicensesPurchased:
          parseInt(updatedRow.LicensesPurchased ?? row.LicensesPurchased) || 0,
        LicensesUsed:
          parseInt(updatedRow.LicensesUsed ?? row.LicensesUsed) || 0,
      });

      const response = await axios.get(
        "https://on-xperience.vercel.app/api/sql-table"
      );
      setRows(response.data);

      // Clear edited state and error
      setEditedRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      setErrors((prev) => {
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
        <>
          <table className="azure-table">
            <thead>
              <tr>
                <th className="wide-column">Subscription ID</th>
                <th>Customer Name</th>
                <th>Licenses Purchased</th>
                <th>Licenses Used</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const editedRow = editedRows[row.SubscriptionID] || {};
                const hasError = errors[row.SubscriptionID];
                const purchasedValue =
                  editedRow.LicensesPurchased !== undefined
                    ? editedRow.LicensesPurchased
                    : row.LicensesPurchased;
                const usedValue =
                  editedRow.LicensesUsed !== undefined
                    ? editedRow.LicensesUsed
                    : row.LicensesUsed;

                return (
                  <tr key={row.SubscriptionID}>
                    {Object.keys(row).map((col) => {
                      if (
                        col === "LicensesPurchased" ||
                        col === "LicensesUsed"
                      ) {
                        return (
                          <td key={col}>
                            <input
                              type="number"
                              min={0}
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
                              className={
                                hasError && col === "LicensesUsed"
                                  ? "error"
                                  : ""
                              }
                            />
                            {hasError && col === "LicensesUsed" && (
                              <div className="error-message">
                                Cannot exceed {purchasedValue} licenses
                                purchased
                              </div>
                            )}
                          </td>
                        );
                      }
                      return (
                        <td
                          key={col}
                          className={
                            col === "SubscriptionID" ? "wide-column" : ""
                          }
                        >
                          {row[col]}
                        </td>
                      );
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
        </>
      )}
    </div>
  );
};

export default AzureTablePage;
