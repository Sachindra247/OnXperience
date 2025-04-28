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
  const [updatedEngagements, setUpdatedEngagements] = useState({});

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

  const handleEngagementChange = (e) => {
    setSelectedEngagement(e.target.value);
  };

  const handleAddEngagement = (subscriptionId) => {
    const selectedEngagement = updatedEngagements[subscriptionId];
    if (selectedEngagement) {
      const engagement = engagementTypes.find(
        (eng) => eng.type === selectedEngagement
      );
      const engagementPoints = engagement ? engagement.points : 0;

      // Find the customer and check if the engagement type already exists
      const customer = customers.find(
        (customer) => customer.SubscriptionID === subscriptionId
      );

      // Ensure engagements array is defined
      const customerEngagements = customer.engagements || [];

      const existingEngagement = customerEngagements.find(
        (eng) => eng.engagement === selectedEngagement
      );

      if (existingEngagement) {
        // If the engagement type already exists, update the points
        const updatedEngagements = customerEngagements.map((eng) =>
          eng.engagement === selectedEngagement
            ? {
                ...eng,
                points: eng.points + engagementPoints, // Sum the points
                lastUpdated: new Date().toLocaleString(),
              }
            : eng
        );

        // Update the customer with the modified engagements
        axios
          .post("https://on-xperience.vercel.app/api/engagement-table", {
            SubscriptionID: subscriptionId,
            EngagementType: selectedEngagement,
            EngagementPoints: engagementPoints,
          })
          .then((response) => {
            console.log("Server response:", response.data); // Log response from the server
            setCustomers((prevList) =>
              prevList.map((customer) =>
                customer.SubscriptionID === subscriptionId
                  ? { ...customer, engagements: updatedEngagements }
                  : customer
              )
            );
          })
          .catch((err) => {
            console.error(
              "Error occurred while sending data to the server:",
              err
            );
            console.error("Server error response:", err.response?.data); // Log detailed error response
          });
      } else {
        // If the engagement type doesn't exist, add it as a new entry
        axios
          .post("https://on-xperience.vercel.app/api/engagement-table", {
            SubscriptionID: subscriptionId,
            EngagementType: selectedEngagement,
            EngagementPoints: engagementPoints,
          })
          .then((response) => {
            console.log("Server response:", response.data); // Log response from the server
            setCustomers((prevList) =>
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
          .catch((err) => {
            console.error(
              "Error occurred while sending data to the server:",
              err
            );
            console.error("Server error response:", err.response?.data); // Log detailed error response
          });
      }
    }
  };

  const handleEngagementChangeForCustomer = (
    subscriptionId,
    engagementType
  ) => {
    setUpdatedEngagements({
      ...updatedEngagements,
      [subscriptionId]: engagementType,
    });
  };

  return (
    <div className="engagement-table-page-container">
      <h2>Log Engagement</h2>
      <div className="engagement-form">
        {/* Display a table of customers and their engagement types */}
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Engagement Type</th>
              <th>Engagement Points</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.SubscriptionID}>
                <td>{customer.CustomerName}</td>
                <td>
                  <select
                    value={updatedEngagements[customer.SubscriptionID] || ""}
                    onChange={(e) =>
                      handleEngagementChangeForCustomer(
                        customer.SubscriptionID,
                        e.target.value
                      )
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
                    ? customer.engagements
                        .map((engagement) => engagement.points)
                        .reduce((total, points) => total + points, 0)
                    : 0}
                </td>
                <td>
                  {customer.engagements && customer.engagements.length > 0
                    ? customer.engagements[0].lastUpdated
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
    </div>
  );
};

export default EngagementTablePage;
