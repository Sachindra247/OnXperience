import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FeedbackTable.css";
import { FaStar } from "react-icons/fa";

const FeedbackTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [npsScoreInputs, setNpsScoreInputs] = useState({});
  const [surveyScores, setSurveyScores] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

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

      if (!res.data || !Array.isArray(res.data)) {
        throw new Error("Invalid data format received from server");
      }

      const data = res.data.map((item) => ({
        ...item,
        NPSScore: item.NPSScore ?? 0,
        SurveyScore: item.SurveyScore ?? 0,
      }));

      setCustomers(data);

      const npsInputs = {},
        surveyInputs = {};
      data.forEach((cust) => {
        npsInputs[cust.SubscriptionID] = Math.round((cust.NPSScore || 0) * 10);
        surveyInputs[cust.SubscriptionID] = Math.round(
          (cust.SurveyScore || 0) / 2
        );
      });

      setNpsScoreInputs(npsInputs);
      setSurveyScores(surveyInputs);
    } catch (err) {
      setError(err.message);
      if (retryCount < 3) {
        setTimeout(() => setRetryCount(retryCount + 1), 3000);
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
    setNpsScoreInputs((prev) => ({ ...prev, [subscriptionId]: clamped }));
  };

  const handleSurveyScoreChange = (subscriptionId, rating) => {
    setSurveyScores((prev) => ({ ...prev, [subscriptionId]: rating }));
  };

  const handleSubmitFeedback = async (subscriptionId) => {
    try {
      setIsLoading(true);
      setError(null);

      const npsPercentage = npsScoreInputs[subscriptionId] || 0;
      const surveyRating = surveyScores[subscriptionId] || 0;

      const npsScore = Math.round(npsPercentage / 10);
      const surveyScore = Math.round(surveyRating * 2);

      await axios.put(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: subscriptionId,
          NPSScore: npsScore,
          SurveyScore: surveyScore,
        },
        { timeout: 10000 }
      );

      await fetchCustomers();
      setExpanded(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && customers.length === 0) {
    return <div className="loading">Loading... (Retry {retryCount}/3)</div>;
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
            <th>Survey Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <React.Fragment key={cust.SubscriptionID}>
              <tr>
                <td>{cust.CustomerName}</td>
                <td>{cust.SubscriptionID}</td>
                <td>{cust.NPSScore * 10}%</td>
                <td>{cust.SurveyScore}/10</td>
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
                  <td colSpan="5">
                    <div className="feedback-form">
                      <h3>Edit Feedback for {cust.CustomerName}</h3>

                      <div className="nps-section">
                        <label>NPS Score (0-100%)</label>
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

                      <div className="survey-section">
                        <label>Survey Question Rating (0-5)</label>
                        <div className="star-rating">
                          {[...Array(5)].map((_, idx) => {
                            const ratingValue = idx + 1;
                            return (
                              <FaStar
                                key={ratingValue}
                                size={24}
                                style={{ cursor: "pointer", marginRight: 5 }}
                                color={
                                  ratingValue <=
                                  (surveyScores[cust.SubscriptionID] || 0)
                                    ? "#ffc107"
                                    : "#e4e5e9"
                                }
                                onClick={() =>
                                  handleSurveyScoreChange(
                                    cust.SubscriptionID,
                                    ratingValue
                                  )
                                }
                              />
                            );
                          })}
                        </div>
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
