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
  const [editingCount, setEditingCount] = useState(null);
  const [countValue, setCountValue] = useState(0);

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
    setEditingCount(null); // Reset editing when toggling history
  };

  const startEditingCount = (engagementType, currentPoints, engagement) => {
    const basePoints =
      engagementTypes.find((e) => e.type === engagementType)?.points || 1;
    setEditingCount(engagementType);
    setCountValue(Math.round(currentPoints / basePoints));
  };

  const handleCountChange = (e) => {
    setCountValue(Number(e.target.value));
  };

  const saveCount = async (subscriptionId, engagementType) => {
    if (countValue < 1) {
      alert("Count must be at least 1");
      return;
    }

    const basePoints =
      engagementTypes.find((e) => e.type === engagementType)?.points || 1;
    const newPoints = basePoints * countValue;

    setIsLoading(true);
    try {
      await axios.put("https://on-xperience.vercel.app/api/engagement-table", {
        SubscriptionID: subscriptionId,
        EngagementType: engagementType,
        EngagementPoints: newPoints,
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
      setEditingCount(null);
    } catch (err) {
      console.error("Error updating engagement count:", err);
      alert(
        `Error: ${
          err.response?.data?.error || err.message || "Failed to update count"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Group engagements by type to show counts
  const getGroupedEngagements = (engagements) => {
    const grouped = {};
    engagements.forEach((engagement) => {
      if (!grouped[engagement.engagement]) {
        grouped[engagement.engagement] = {
          points: 0,
          lastUpdated: null,
          basePoints:
            engagementTypes.find((e) => e.type === engagement.engagement)
              ?.points || 1,
          instances: [],
        };
      }
      grouped[engagement.engagement].points += engagement.points;
      grouped[engagement.engagement].instances.push(engagement);
      if (
        !grouped[engagement.engagement].lastUpdated ||
        new Date(engagement.lastUpdated) >
          new Date(grouped[engagement.engagement].lastUpdated)
      ) {
        grouped[engagement.engagement].lastUpdated = engagement.lastUpdated;
      }
    });
    return grouped;
  };

  return (
    <div className="engagement-table-page-container">
      {isLoading && <div className="loading-indicator">Processing...</div>}

      <div className="engagement-table">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Subscription ID</th>
              <th>Engagement Type</th>
              <th>Points</th>
              <th>Last Updated</th>
              <th></th>
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
                                <th>Count</th>
                                <th>Total Points</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(
                                getGroupedEngagements(customer.engagements)
                              ).map(([type, data]) => (
                                <tr key={type}>
                                  <td>{type}</td>
                                  <td>
                                    {editingCount === type ? (
                                      <input
                                        type="number"
                                        min="1"
                                        value={countValue}
                                        onChange={handleCountChange}
                                        className="count-input"
                                      />
                                    ) : (
                                      Math.round(data.points / data.basePoints)
                                    )}
                                  </td>
                                  <td>{data.points}</td>
                                  <td>
                                    {new Date(
                                      data.lastUpdated
                                    ).toLocaleString()}
                                  </td>
                                  <td>
                                    {editingCount === type ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            saveCount(
                                              customer.SubscriptionID,
                                              type
                                            )
                                          }
                                          className="save-btn"
                                          disabled={isLoading}
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingCount(null)}
                                          className="cancel-btn"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          startEditingCount(
                                            type,
                                            data.points,
                                            data.instances[0]
                                          )
                                        }
                                        className="edit-btn"
                                      >
                                        Edit
                                      </button>
                                    )}
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
