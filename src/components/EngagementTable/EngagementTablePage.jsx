import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EngagementTable.css";

const engagementTypes = [
  { type: "C-Level Meeting", points: 50 },
  { type: "Scheduled CS Review", points: 25 },
  { type: "In-person meeting", points: 20 },
  { type: "Conference Call", points: 15 },
  { type: "Phone Follow up", points: 2 },
  { type: "Email Follow up", points: 1 },
];

const EngagementTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedEngagement, setSelectedEngagement] = useState("");
  const [engagementList, setEngagementList] = useState([]);

  useEffect(() => {
    // Fetch all customers from the backend
    axios
      .get("https://on-xperience.vercel.app/api/engagement-table")
      .then((response) => {
        setCustomers(response.data);
        // Assuming the response data has all customers
        setEngagementList(
          response.data.map((customer) => ({
            SubscriptionID: customer.SubscriptionID,
            CustomerName: customer.CustomerName,
            engagementPoints: 0, // Initialize with zero points
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);

  const handleSelectChange = (e) => {
    setSelectedCustomer(e.target.value);
  };

  const handleEngagementChange = (e) => {
    setSelectedEngagement(e.target.value);
  };

  const handleAddEngagement = () => {
    if (selectedCustomer && selectedEngagement) {
      const engagement = engagementTypes.find(
        (eng) => eng.type === selectedEngagement
      );
      const engagementPoints = engagement ? engagement.points : 0;

      // Find the customer and update engagement points
      const updatedCustomers = customers.map((customer) => {
        if (customer.SubscriptionID === selectedCustomer) {
          customer.engagementPoints += engagementPoints; // Add points to existing ones
        }
        return customer;
      });

      // Send updated data to backend
      axios
        .post("https://on-xperience.vercel.app/api/engagement-table", {
          SubscriptionID: selectedCustomer,
          EngagementType: selectedEngagement,
          EngagementPoints: engagementPoints,
        })
        .then((response) => {
          console.log("Server response:", response.data);
          setCustomers(updatedCustomers); // Update local state with new points
        })
        .catch((err) => {
          console.error(
            "Error occurred while sending data to the server:",
            err
          );
          console.error(
            "Detailed error response:",
            err.response?.data || err.message
          );
        });
    }
  };

  return (
    <div className="engagement-table-page-container">
      <h2>Log Engagement</h2>
      <div className="engagement-form">
        {/* Customer selection dropdown */}
        <select
          value={selectedCustomer}
          onChange={handleSelectChange}
          disabled={!customers.length}
        >
          <option value="">Select Customer</option>
          {customers && customers.length > 0 ? (
            customers.map((customer) => (
              <option
                key={customer.SubscriptionID}
                value={customer.SubscriptionID}
              >
                {customer.CustomerName} (ID: {customer.SubscriptionID})
              </option>
            ))
          ) : (
            <option disabled>No customers available</option>
          )}
        </select>

        {/* Engagement type selection dropdown */}
        <select value={selectedEngagement} onChange={handleEngagementChange}>
          <option value="">Select Engagement Type</option>
          {engagementTypes.map((engagement) => (
            <option key={engagement.type} value={engagement.type}>
              {engagement.type}
            </option>
          ))}
        </select>

        {/* Add Engagement button */}
        <button
          onClick={handleAddEngagement}
          disabled={!selectedCustomer || !selectedEngagement}
        >
          Add Engagement
        </button>
      </div>

      <div className="engagement-table">
        <h3>Logged Engagements</h3>
        <table>
          <thead>
            <tr>
              <th>Subscription ID</th>
              <th>Customer</th>
              <th>Total Points</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.SubscriptionID}>
                <td>{customer.SubscriptionID}</td>
                <td>{customer.CustomerName}</td>
                <td>{customer.engagementPoints}</td>
                <td>{new Date().toLocaleString()}</td>{" "}
                {/* Assuming the last updated date */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EngagementTablePage;
