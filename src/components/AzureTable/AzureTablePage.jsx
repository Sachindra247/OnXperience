// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./AzureTable.css";

// const AzureTablePage = () => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editedRows, setEditedRows] = useState({});

//   useEffect(() => {
//     const fetchTableData = async () => {
//       try {
//         const response = await axios.get(
//           "https://on-xperience.vercel.app/api/sql-table"
//         );
//         setRows(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Failed to fetch SQL table:", error);
//         setLoading(false);
//       }
//     };

//     fetchTableData();
//   }, []);

//   const handleEditChange = (id, field, value) => {
//     setEditedRows((prev) => ({
//       ...prev,
//       [id]: {
//         ...prev[id],
//         [field]: value,
//       },
//     }));
//   };

//   const handleSave = async (id) => {
//     const row = rows.find((r) => r.SubscriptionID === id);
//     const updatedRow = editedRows[id];

//     if (!updatedRow) return;

//     console.log("Saving row:", {
//       SubscriptionID: row.SubscriptionID,
//       LicensesPurchased: updatedRow.LicensesPurchased,
//       LicensesUsed: updatedRow.LicensesUsed,
//     });

//     try {
//       await axios.post("https://on-xperience.vercel.app/api/sql-table", {
//         SubscriptionID: row.SubscriptionID,
//         LicensesPurchased:
//           parseInt(updatedRow.LicensesPurchased ?? row.LicensesPurchased) || 0,
//         LicensesUsed:
//           parseInt(updatedRow.LicensesUsed ?? row.LicensesUsed) || 0,
//       });

//       const response = await axios.get(
//         "https://on-xperience.vercel.app/api/sql-table"
//       );
//       setRows(response.data);

//       setEditedRows((prev) => {
//         const newState = { ...prev };
//         delete newState[id];
//         return newState;
//       });
//     } catch (error) {
//       console.error(
//         "Failed to save data:",
//         error.response?.data || error.message
//       );
//     }
//   };

//   const isRowEdited = (id) => editedRows.hasOwnProperty(id);

//   return (
//     <div className="azure-table-wrapper">
//       {loading ? (
//         <p>Loading table data...</p>
//       ) : (
//         <table className="azure-table">
//           <thead>
//             <tr>
//               {rows.length > 0 &&
//                 Object.keys(rows[0]).map((col) => <th key={col}>{col}</th>)}
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row) => {
//               const editedRow = editedRows[row.SubscriptionID] || {};
//               return (
//                 <tr key={row.SubscriptionID}>
//                   {Object.keys(row).map((col) => {
//                     if (col === "LicensesPurchased" || col === "LicensesUsed") {
//                       return (
//                         <td key={col}>
//                           <input
//                             type="number"
//                             value={
//                               editedRow[col] !== undefined
//                                 ? editedRow[col]
//                                 : row[col]
//                             }
//                             onChange={(e) =>
//                               handleEditChange(
//                                 row.SubscriptionID,
//                                 col,
//                                 e.target.value
//                               )
//                             }
//                           />
//                         </td>
//                       );
//                     }
//                     return <td key={col}>{row[col]}</td>;
//                   })}
//                   <td>
//                     {isRowEdited(row.SubscriptionID) && (
//                       <button onClick={() => handleSave(row.SubscriptionID)}>
//                         Save
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default AzureTablePage;

// code with validations
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

  const validateLicenses = (id) => {
    const editedRow = editedRows[id] || {};
    const currentRow = rows.find((r) => r.SubscriptionID === id) || {};

    const purchased =
      editedRow.LicensesPurchased !== undefined
        ? editedRow.LicensesPurchased
        : currentRow.LicensesPurchased;
    const used =
      editedRow.LicensesUsed !== undefined
        ? editedRow.LicensesUsed
        : currentRow.LicensesUsed;

    // Skip validation if either field is empty
    if (purchased === undefined || used === undefined) {
      setErrors((prev) => ({ ...prev, [id]: false }));
      return true;
    }

    const purchasedNum = parseInt(purchased) || 0;
    const usedNum = parseInt(used) || 0;
    const isValid = usedNum <= purchasedNum;

    setErrors((prev) => ({
      ...prev,
      [id]: !isValid,
    }));

    return isValid;
  };

  const handleEditChange = (id, field, value) => {
    setEditedRows((prev) => {
      const newEditedRows = {
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      };

      // Validate after change but don't block input
      validateLicenses(id);
      return newEditedRows;
    });
  };

  const handleSave = async (id) => {
    const row = rows.find((r) => r.SubscriptionID === id);
    const updatedRow = editedRows[id];

    if (!updatedRow) return;

    // Final validation before saving
    if (!validateLicenses(id)) {
      return; // Now we show the error message in the UI instead of alert
    }

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

      // Clear edit state and errors
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
          {Object.keys(errors).some((id) => errors[id]) && (
            <div className="global-error-message">
              Please correct the highlighted fields before saving
            </div>
          )}
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
                              min={0}
                              max={
                                col === "LicensesUsed"
                                  ? purchasedValue
                                  : undefined
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
                      return <td key={col}>{row[col]}</td>;
                    })}
                    <td>
                      {isRowEdited(row.SubscriptionID) && (
                        <button
                          onClick={() => handleSave(row.SubscriptionID)}
                          disabled={errors[row.SubscriptionID]}
                          className={
                            errors[row.SubscriptionID]
                              ? "save-button-disabled"
                              : ""
                          }
                        >
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
