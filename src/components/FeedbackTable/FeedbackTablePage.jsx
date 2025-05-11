import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FeedbackTable.css"; // reuse styling for consistent UI

const feedbackTypes = [
  { type: "Excellent", score: 5 },
  { type: "Good", score: 4 },
  { type: "Average", score: 3 },
  { type: "Poor", score: 2 },
  { type: "Very Poor", score: 1 },
];

const FeedbackTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [updatedFeedbacks, setUpdatedFeedbacks] = useState({});
  const [expandedSubscription, setExpandedSubscription] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [scoreValue, setScoreValue] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        "https://on-xperience.vercel.app/api/subscription-feedbacks"
      );
      const rawData = Array.isArray(res.data) ? res.data : [];

      const enriched = rawData.map((c) => {
        const feedbackList = Array.isArray(c.feedback) ? c.feedback : [];
        return {
          ...c,
          feedback: feedbackList,
          avgScore:
            feedbackList.length > 0
              ? Math.round(
                  feedbackList.reduce((sum, fb) => sum + fb.score, 0) /
                    feedbackList.length
                )
              : 0,
        };
      });

      setCustomers(enriched);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Error loading feedback data.");
      setCustomers([]); // fallback to empty array on failure
    }
  };

  const handleFeedbackChange = (e, subscriptionId) => {
    const { value } = e.target;
    setUpdatedFeedbacks((prev) => ({
      ...prev,
      [subscriptionId]: value,
    }));
  };

  const handleAddFeedback = async (subscriptionId) => {
    const selected = updatedFeedbacks[subscriptionId];
    if (!selected) {
      alert("Please select a feedback type.");
      return;
    }

    const feedback = feedbackTypes.find((f) => f.type === selected);
    if (!feedback) return alert("Invalid feedback type.");

    setIsLoading(true);
    try {
      await axios.post(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: subscriptionId,
          FeedbackType: selected,
          FeedbackScore: feedback.score,
        }
      );
      setUpdatedFeedbacks((prev) => ({ ...prev, [subscriptionId]: "" }));
      fetchCustomers();
    } catch (err) {
      console.error("Add error:", err);
      alert("Failed to add feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHistory = (subscriptionId) => {
    setExpandedSubscription(
      expandedSubscription === subscriptionId ? null : subscriptionId
    );
    setEditingType(null);
  };

  const startEditingScore = (type, currentScore) => {
    setEditingType(type);
    setScoreValue(currentScore);
  };

  const handleScoreChange = (e) => {
    setScoreValue(Number(e.target.value));
  };

  const saveScore = async (subscriptionId, feedbackType) => {
    if (scoreValue < 1 || scoreValue > 5) {
      alert("Score must be between 1 and 5");
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: subscriptionId,
          FeedbackType: feedbackType,
          FeedbackScore: scoreValue,
          UpdateType: "exact",
        }
      );
      fetchCustomers();
      setEditingType(null);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupedFeedbacks = (feedbacks) => {
    const grouped = {};
    feedbacks.forEach((fb) => {
      if (!grouped[fb.feedback]) {
        grouped[fb.feedback] = {
          totalScore: 0,
          lastUpdated: null,
          instances: [],
        };
      }
      grouped[fb.feedback].totalScore += fb.score;
      grouped[fb.feedback].instances.push(fb);
      if (
        !grouped[fb.feedback].lastUpdated ||
        new Date(fb.lastUpdated) > new Date(grouped[fb.feedback].lastUpdated)
      ) {
        grouped[fb.feedback].lastUpdated = fb.lastUpdated;
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
              <th>Feedback Type</th>
              <th>Avg. Score</th>
              <th>Last Feedback</th>
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
                      value={updatedFeedbacks[customer.SubscriptionID] || ""}
                      onChange={(e) =>
                        handleFeedbackChange(e, customer.SubscriptionID)
                      }
                      disabled={isLoading}
                    >
                      <option value="">Select Feedback</option>
                      {feedbackTypes.map((type) => (
                        <option key={type.type} value={type.type}>
                          {type.type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{customer.avgScore}</td>
                  <td>
                    {customer.feedback.length > 0
                      ? new Date(
                          [...customer.feedback].sort(
                            (a, b) =>
                              new Date(b.lastUpdated) - new Date(a.lastUpdated)
                          )[0].lastUpdated
                        ).toLocaleString()
                      : "-"}
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleAddFeedback(customer.SubscriptionID)}
                      disabled={
                        !updatedFeedbacks[customer.SubscriptionID] || isLoading
                      }
                      className="add-engagement-btn"
                    >
                      Add Feedback
                    </button>
                    <button
                      onClick={() => toggleHistory(customer.SubscriptionID)}
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
                        <h4>Feedback History for {customer.CustomerName}</h4>
                        {customer.feedback.length > 0 ? (
                          <table className="history-table">
                            <thead>
                              <tr>
                                <th>Type</th>
                                <th>Count</th>
                                <th>Total Score</th>
                                <th>Last Updated</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(
                                getGroupedFeedbacks(customer.feedback)
                              ).map(([type, data]) => (
                                <tr key={type}>
                                  <td>{type}</td>
                                  <td>{data.instances.length}</td>
                                  <td>
                                    {editingType === type ? (
                                      <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={scoreValue}
                                        onChange={handleScoreChange}
                                        className="count-input"
                                      />
                                    ) : (
                                      data.totalScore
                                    )}
                                  </td>
                                  <td>
                                    {new Date(
                                      data.lastUpdated
                                    ).toLocaleString()}
                                  </td>
                                  <td>
                                    {editingType === type ? (
                                      <>
                                        <button
                                          onClick={() =>
                                            saveScore(
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
                                          onClick={() => setEditingType(null)}
                                          className="cancel-btn"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          startEditingScore(
                                            type,
                                            data.totalScore
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
                          <p>No feedback history found</p>
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
    </div>
  );
};

export default FeedbackTablePage;
