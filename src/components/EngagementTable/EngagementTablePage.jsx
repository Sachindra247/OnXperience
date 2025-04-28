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
  const [selectedEngagement, setSelectedEngagement] = useState("");
  const [engagementList, setEngagementList] = useState([]);

  useEffect(() => {
    // Fetch all customers with SubscriptionIDs and engagement data
    axios
      .get("https://on-xperience.vercel.app/api/engagement-table")
      .then((response) => {
        setCustomers(response.data);
      });
  }, []);

  const handleEngagementChange = (e, customerID) => {
    setSelectedEngagement({ type: e.target.value, customerID });
  };

  const handleAddEngagement = (customerID) => {
    if (selectedEngagement.type) {
      const engagement = engagementTypes.find(
        (eng) => eng.type === selectedEngagement.type
      );
      const engagementPoints = engagement ? engagement.points : 0;

      // Update the engagement for the specific customer
      axios
        .post("https://on-xperience.vercel.app/api/engagement-table", {
          SubscriptionID: customerID,
          EngagementType: selectedEngagement.type,
          EngagementPoints: engagementPoints,
        })
        .then((response) => {
          // Update the engagement list with the newly added data
          setEngagementList((prevList) => [
            ...prevList,
            {
              customer: customerID,
              engagement: selectedEngagement.type,
              points: engagementPoints,
              lastUpdated: new Date().toLocaleString(),
            },
          ]);
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="engagement-table-page-container">
      <h2>Log Engagement</h2>

      <div className="engagement-table">
        <h3>Customer Engagement Table</h3>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Subscription IDs</th>
              <th>Engagement Type</th>
              <th>Points</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.SubscriptionID}>
                <td>{customer.CustomerName}</td>
                <td>
                  <ul>
                    {customer.SubscriptionIDs.map((subID) => (
                      <li key={subID}>{subID}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <select
                    value={
                      selectedEngagement.customerID === customer.SubscriptionID
                        ? selectedEngagement.type
                        : ""
                    }
                    onChange={(e) =>
                      handleEngagementChange(e, customer.SubscriptionID)
                    }
                  >
                    <option value="">Select Engagement Type</option>
                    {engagementTypes.map((engagement) => (
                      <option key={engagement.type} value={engagement.type}>
                        {engagement.type}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {selectedEngagement.customerID === customer.SubscriptionID &&
                  selectedEngagement.type
                    ? engagementTypes.find(
                        (eng) => eng.type === selectedEngagement.type
                      )?.points
                    : ""}
                </td>
                <td>
                  {engagementList
                    .filter((eng) => eng.customer === customer.SubscriptionID)
                    .map((engagement, idx) => (
                      <div key={idx}>
                        <p>{engagement.lastUpdated}</p>
                        <p>Points: {engagement.points}</p>
                      </div>
                    ))}
                </td>
                <td>
                  <button
                    onClick={() => handleAddEngagement(customer.SubscriptionID)}
                    disabled={!selectedEngagement.type}
                  >
                    Add Engagement
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EngagementTablePage;
