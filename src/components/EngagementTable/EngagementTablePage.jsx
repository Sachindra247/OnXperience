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

      axios
        .post("https://on-xperience.vercel.app/api/engagement-table", {
          SubscriptionID: selectedCustomer,
          EngagementType: selectedEngagement,
          EngagementPoints: engagementPoints,
        })
        .then(() => {
          setEngagementList((prevList) => [
            ...prevList,
            {
              customer: selectedCustomer,
              engagement: selectedEngagement,
              points: engagementPoints,
            },
          ]);
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="engagement-table-page-container">
      <h2>Log Engagement</h2>
      <div className="engagement-form">
        {/* If customers is undefined or empty, disable the select */}
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
                {customer.CustomerName}
              </option>
            ))
          ) : (
            <option disabled>No customers available</option>
          )}
        </select>

        <select value={selectedEngagement} onChange={handleEngagementChange}>
          <option value="">Select Engagement Type</option>
          {engagementTypes.map((engagement) => (
            <option key={engagement.type} value={engagement.type}>
              {engagement.type}
            </option>
          ))}
        </select>

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
              <th>Customer</th>
              <th>Engagement Type</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {engagementList.map((engagement, index) => (
              <tr key={index}>
                <td>{engagement.customer}</td>
                <td>{engagement.engagement}</td>
                <td>{engagement.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EngagementTablePage;
