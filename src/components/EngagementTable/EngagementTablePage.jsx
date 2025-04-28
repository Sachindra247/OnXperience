import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EngagementTable.css";

const EngagementTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [engagementType, setEngagementType] = useState("");
  const [points, setPoints] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Fetch existing customers from the server
    axios
      .get("/api/get-customers") // Replace with your API endpoint for fetching customers
      .then((response) => setCustomers(response.data))
      .catch((error) => console.error("Error fetching customers:", error));
  }, []);

  const handleSubmit = async () => {
    if (!selectedCustomer || !engagementType || !points) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    const data = {
      subscriptionId: selectedCustomer,
      engagementType: engagementType,
      points: parseInt(points),
    };

    try {
      console.log("Data to send:", data); // Log the data to verify it before sending

      // Send the request to the server
      const response = await axios.post("/api/engagement-table", data);

      if (response.status === 200) {
        setSuccessMessage("Data saved successfully!");
        setErrorMessage("");
        setEngagementType("");
        setPoints("");
      }
    } catch (error) {
      console.error("Error occurred while sending data to the server:", error);
      setErrorMessage("Error saving data. Please try again later.");
    }
  };

  return (
    <div className="engagement-table-page-container">
      <h1>Engagement Table</h1>
      {errorMessage && (
        <div className="global-error-message">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="engagement-table-form">
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          required
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option
              key={customer.SubscriptionID}
              value={customer.SubscriptionID}
            >
              {customer.CustomerName}
            </option>
          ))}
        </select>

        <select
          value={engagementType}
          onChange={(e) => setEngagementType(e.target.value)}
          required
        >
          <option value="">Select Engagement Type</option>
          <option value="Engagement Type 1">Engagement Type 1</option>
          <option value="Engagement Type 2">Engagement Type 2</option>
          <option value="Engagement Type 3">Engagement Type 3</option>
        </select>

        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Enter points"
          required
        />

        <button onClick={handleSubmit}>Save</button>
      </div>

      <table className="engagement-table">
        <thead>
          <tr>
            <th>Subscription ID</th>
            <th>Customer Name</th>
            <th>Engagement Type</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.SubscriptionID}>
              <td>{customer.SubscriptionID}</td>
              <td>{customer.CustomerName}</td>
              <td>{customer.EngagementType}</td>
              <td>{customer.Points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EngagementTablePage;
