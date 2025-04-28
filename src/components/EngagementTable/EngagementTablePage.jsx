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
  const [engagementList, setEngagementList] = useState([]);
  const [updatedEngagements, setUpdatedEngagements] = useState({});

  useEffect(() => {
    // Fetch all customers from the backend
    axios
      .get("https://on-xperience.vercel.app/api/engagement-table")
      .then((response) => {
        setCustomers(response.data);
        // Initialize the engagement data from the response
        const initialEngagementList = response.data.map((customer) => ({
          ...customer,
          engagements: customer.engagements || [], // Ensure engagements is an empty array if not provided
        }));
        setEngagementList(initialEngagementList);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);

  const handleEngagementChange = (e, subscriptionId) => {
    const { value } = e.target;
    setUpdatedEngagements({
      ...updatedEngagements,
      [subscriptionId]: value,
    });
  };

  const handleAddEngagement = (subscriptionId) => {
    const selectedEngagement = updatedEngagements[subscriptionId];
    if (selectedEngagement) {
      const engagement = engagementTypes.find(
        (eng) => eng.type === selectedEngagement
      );
      const engagementPoints = engagement ? engagement.points : 0;

      axios
        .post("https://on-xperience.vercel.app/api/engagement-table", {
          SubscriptionID: subscriptionId,
          EngagementType: selectedEngagement,
          EngagementPoints: engagementPoints,
        })
        .then(() => {
          setEngagementList((prevList) =>
            prevList.map((customer) =>
              customer.SubscriptionID === subscriptionId
                ? {
                    ...customer,
                    engagements: [
                      ...customer.engagements,
                      {
                        engagement: selectedEngagement,
                        points: engagementPoints,
                        lastUpdated: new Date().toLocaleString(),
                      },
                    ],
                  }
                : customer
            )
          );
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
              <th>Subscription ID</th>
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
                <td>{customer.SubscriptionID}</td>
                <td>
                  <select
                    value={updatedEngagements[customer.SubscriptionID] || ""}
                    onChange={(e) =>
                      handleEngagementChange(e, customer.SubscriptionID)
                    }
                  >
                    <option value="">Select Engagement</option>
                    {engagementTypes.map((engagement) => (
                      <option key={engagement.type} value={engagement.type}>
                        {engagement.type}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {customer.engagements && customer.engagements.length > 0
                    ? customer.engagements[customer.engagements.length - 1]
                        .points
                    : "-"}
                </td>
                <td>
                  {customer.engagements && customer.engagements.length > 0
                    ? customer.engagements[customer.engagements.length - 1]
                        .lastUpdated
                    : "-"}
                </td>
                <td>
                  <button
                    onClick={() => handleAddEngagement(customer.SubscriptionID)}
                    disabled={!updatedEngagements[customer.SubscriptionID]}
                  >
                    Add Engagement
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="total-points">
        <h3>Total Points (all customers):</h3>
        {customers.reduce((acc, customer) => {
          const totalPoints = customer.engagements.reduce(
            (sum, engagement) => sum + engagement.points,
            0
          );
          return acc + totalPoints;
        }, 0)}
      </div>
    </div>
  );
};

export default EngagementTablePage;
