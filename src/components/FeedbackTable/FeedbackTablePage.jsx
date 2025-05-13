import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FeedbackTable.css";

const FeedbackTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [npsScoreInputs, setNpsScoreInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching customer feedback data...");

      const res = await axios.get(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          timeout: 10000,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      console.log("API response:", res.data);

      if (!res.data || !Array.isArray(res.data)) {
        throw new Error("Invalid data format received from server");
      }

      const data = res.data.map((item) => ({
        ...item,
        NPSScore: item.NPSScore ?? 0,
      }));

      setCustomers(data);

      const initialNpsScoreInputs = {};
      data.forEach((cust) => {
        initialNpsScoreInputs[cust.SubscriptionID] = cust.NPSScore || 0;
      });

      setNpsScoreInputs(initialNpsScoreInputs);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to load data"
      );

      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [retryCount]);

  const handleNpsScoreChange = (subscriptionId, value) => {
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    setNpsScoreInputs((prev) => ({
      ...prev,
      [subscriptionId]: clamped,
    }));
  };

  const handleSubmitFeedback = async (subscriptionId) => {
    try {
      setIsLoading(true);
      setError(null);

      const npsScore = npsScoreInputs[subscriptionId] || 0;

      console.log("Submitting feedback:", {
        SubscriptionID: subscriptionId,
        NPSScore: npsScore,
      });

      await axios.put(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: subscriptionId,
          NPSScore: npsScore,
        },
        {
          timeout: 10000,
        }
      );

      await fetchCustomers();
      setExpanded(null);
    } catch (err) {
      console.error("Submit error:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to submit feedback"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && customers.length === 0) {
    return (
      <div className="loading">
        Loading customer feedback data...
        {retryCount > 0 && <span> (Retry {retryCount}/3)</span>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        {retryCount < 3 ? (
          <p>Retrying in 3 seconds...</p>
        ) : (
          <button
            onClick={() => {
              setRetryCount(0);
              fetchCustomers();
            }}
          >
            Retry Now
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="feedback-table-container">
      <h2>Customer Feedback</h2>

      <table className="feedback-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Subscription ID</th>
            <th>NPS Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <React.Fragment key={cust.SubscriptionID}>
              <tr>
                <td>{cust.CustomerName}</td>
                <td>{cust.SubscriptionID}</td>
                <td>{cust.NPSScore}/100</td>
                <td>
                  <button
                    onClick={() =>
                      setExpanded(
                        expanded === cust.SubscriptionID
                          ? null
                          : cust.SubscriptionID
                      )
                    }
                    disabled={isLoading}
                  >
                    {expanded === cust.SubscriptionID ? "Cancel" : "Edit"}
                  </button>
                </td>
              </tr>

              {expanded === cust.SubscriptionID && (
                <tr className="expanded-row">
                  <td colSpan="4">
                    <div className="feedback-form">
                      <h3>Edit NPS Score for {cust.CustomerName}</h3>

                      <div className="nps-section">
                        <label>NPS Score (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={npsScoreInputs[cust.SubscriptionID] || ""}
                          onChange={(e) =>
                            handleNpsScoreChange(
                              cust.SubscriptionID,
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-actions">
                        <button
                          onClick={() =>
                            handleSubmitFeedback(cust.SubscriptionID)
                          }
                          disabled={isLoading}
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackTablePage;
