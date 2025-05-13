import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FeedbackTable.css";
import { FaStar } from "react-icons/fa";

const FeedbackTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [npsInputs, setNpsInputs] = useState({});
  const [surveyInputs, setSurveyInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
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

      const data = Array.isArray(res.data)
        ? res.data.map((item) => ({
            ...item,
            NPSScore: item.NPSScore ?? 0,
            SurveyScore: item.SurveyScore ?? 0,
          }))
        : [];

      setCustomers(data);

      const nps = {};
      const survey = {};

      data.forEach((cust) => {
        nps[cust.SubscriptionID] = Math.round(cust.NPSScore * 10);
        survey[cust.SubscriptionID] = Math.round(cust.SurveyScore / 2);
      });

      setNpsInputs(nps);
      setSurveyInputs(survey);
    } catch (err) {
      setError(err.message);
      if (retry < 3) {
        setTimeout(() => setRetry((r) => r + 1), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [retry]);

  const updateNpsInput = (id, value) => {
    const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
    setNpsInputs((prev) => ({ ...prev, [id]: safeValue }));
  };

  const updateSurveyInput = (id, rating) => {
    setSurveyInputs((prev) => ({ ...prev, [id]: rating }));
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        SubscriptionID: id,
        NPSScore: Math.round((npsInputs[id] || 0) / 10),
        SurveyScore: Math.round((surveyInputs[id] || 0) * 2),
      };

      await axios.put(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        payload,
        { timeout: 10000 }
      );

      await fetchFeedbacks();
      setExpanded(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && customers.length === 0) {
    return <div className="loading">Loading... (Retry {retry}/3)</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        {retry < 3 ? (
          <p>Retrying in 3 seconds...</p>
        ) : (
          <button onClick={() => setRetry(0)}>Retry Now</button>
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
          {customers.map((cust) => {
            const isExpanded = expanded === cust.SubscriptionID;
            return (
              <React.Fragment key={cust.SubscriptionID}>
                <tr>
                  <td>{cust.CustomerName}</td>
                  <td>{cust.SubscriptionID}</td>
                  <td>{cust.NPSScore * 10}%</td>
                  <td>{cust.SurveyScore}/10</td>
                  <td>
                    <button
                      onClick={() =>
                        setExpanded(isExpanded ? null : cust.SubscriptionID)
                      }
                      disabled={loading}
                    >
                      {isExpanded ? "Cancel" : "Edit"}
                    </button>
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="expanded-row">
                    <td colSpan="5">
                      <div className="feedback-form">
                        <h3>Edit Feedback for {cust.CustomerName}</h3>

                        <div className="nps-section">
                          <label>NPS Score (0–100%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={npsInputs[cust.SubscriptionID] || ""}
                            onChange={(e) =>
                              updateNpsInput(
                                cust.SubscriptionID,
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="survey-section">
                          <label>Survey Rating (0–5)</label>
                          <div className="star-rating">
                            {[...Array(5)].map((_, i) => {
                              const starVal = i + 1;
                              return (
                                <FaStar
                                  key={starVal}
                                  size={24}
                                  style={{
                                    cursor: "pointer",
                                    marginRight: 5,
                                  }}
                                  color={
                                    starVal <=
                                    (surveyInputs[cust.SubscriptionID] || 0)
                                      ? "#ffc107"
                                      : "#e4e5e9"
                                  }
                                  onClick={() =>
                                    updateSurveyInput(
                                      cust.SubscriptionID,
                                      starVal
                                    )
                                  }
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div className="form-actions">
                          <button
                            onClick={() => handleSave(cust.SubscriptionID)}
                            disabled={loading}
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackTablePage;
