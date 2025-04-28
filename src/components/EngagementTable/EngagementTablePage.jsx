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
  const [updatedEngagements, setUpdatedEngagements] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSubscription, setExpandedSubscription] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(
          "https://on-xperience.vercel.app/api/engagement-table"
        );
        const customersWithEngagements = response.data.map((customer) => ({
          ...customer,
          engagements: customer.engagements || [],
          totalPoints: (customer.engagements || []).reduce(
            (sum, engagement) => sum + (engagement.points || 0),
            0
          ),
        }));
        setCustomers(customersWithEngagements);
      } catch (error) {
        console.error("Error fetching customers:", error);
        alert(
          "There was an issue fetching the customer data. Please try again later."
        );
      }
    };
    fetchCustomers();
  }, []);

  const handleEngagementChange = (e, subscriptionId) => {
    const { value } = e.target;
    setUpdatedEngagements((prev) => ({
      ...prev,
      [subscriptionId]: value,
    }));
  };

  const handleAddEngagement = async (subscriptionId) => {
    const selectedEngagement = updatedEngagements[subscriptionId];
    if (!selectedEngagement) {
      alert("Please select an engagement type first.");
      return;
    }

    const engagement = engagementTypes.find(
      (eng) => eng.type === selectedEngagement
    );
    if (!engagement) {
      alert("Invalid engagement type selected.");
      return;
    }

    const engagementPoints = Number(engagement.points);
    const customer = customers.find((c) => c.SubscriptionID === subscriptionId);
    if (!customer) {
      alert("Customer not found.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("https://on-xperience.vercel.app/api/engagement-table", {
        SubscriptionID: subscriptionId,
        EngagementType: selectedEngagement,
        EngagementPoints: engagementPoints,
      });

      const response = await axios.get(
        "https://on-xperience.vercel.app/api/engagement-table"
      );
      const updatedCustomers = response.data.map((customer) => ({
        ...customer,
        engagements: customer.engagements || [],
        totalPoints: (customer.engagements || []).reduce(
          (sum, engagement) => sum + (engagement.points || 0),
          0
        ),
      }));
      setCustomers(updatedCustomers);
      setUpdatedEngagements((prev) => ({
        ...prev,
        [subscriptionId]: "",
      }));
    } catch (err) {
      console.error("Error adding engagement:", err);
      alert(
        `Error: ${
          err.response?.data?.error || err.message || "Failed to add engagement"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEngagementHistory = (subscriptionId) => {
    setExpandedSubscription(
      expandedSubscription === subscriptionId ? null : subscriptionId
    );
  };

  return (
    <div className="engagement-table-page-container">
      <h2>Log Engagement</h2>
      {isLoading && <div className="loading-indicator">Processing...</div>}

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <React.Fragment key={customer.SubscriptionID}>
                <tr>
                  <td>{customer.CustomerName}</td>
                  <td>{customer.SubscriptionID}</td>
                  <td>
                    <select
                      value={updatedEngagements[customer.SubscriptionID] || ""}
                      onChange={(e) =>
                        handleEngagementChange(e, customer.SubscriptionID)
                      }
                      disabled={isLoading}
                    >
                      <option value="">Select Engagement</option>
                      {engagementTypes.map((engagement) => (
                        <option key={engagement.type} value={engagement.type}>
                          {engagement.type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{customer.totalPoints}</td>
                  <td>
                    {customer.engagements.length > 0
                      ? new Date(
                          // Sort engagements by date and get the most recent one
                          [...customer.engagements].sort(
                            (a, b) =>
                              new Date(b.lastUpdated) - new Date(a.lastUpdated)
                          )[0].lastUpdated
                        ).toLocaleString()
                      : "-"}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() =>
                        handleAddEngagement(customer.SubscriptionID)
                      }
                      disabled={
                        !updatedEngagements[customer.SubscriptionID] ||
                        isLoading
                      }
                    >
                      {isLoading ? "Processing..." : "Add Engagement"}
                    </button>
                    <button
                      onClick={() =>
                        toggleEngagementHistory(customer.SubscriptionID)
                      }
                      className="view-history-btn"
                    >
                      {expandedSubscription === customer.SubscriptionID
                        ? "Hide History"
                        : "View History"}
                    </button>
                  </td>
                </tr>
                {expandedSubscription === customer.SubscriptionID && (
                  <tr className="engagement-history-row">
                    <td colSpan="6">
                      <div className="engagement-history">
                        <h4>Engagement History for {customer.CustomerName}</h4>
                        {customer.engagements.length > 0 ? (
                          <table className="history-table">
                            <thead>
                              <tr>
                                <th>Type</th>
                                <th>Points</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customer.engagements.map((engagement, index) => (
                                <tr key={index}>
                                  <td>{engagement.engagement}</td>
                                  <td>{engagement.points}</td>
                                  <td>
                                    {new Date(
                                      engagement.lastUpdated
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p>No engagement history found</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="total-points">
        <h3>Total Points (all customers):</h3>
        {customers.reduce(
          (acc, customer) => acc + (customer.totalPoints || 0),
          0
        )}
      </div>
    </div>
  );
};

export default EngagementTablePage;
