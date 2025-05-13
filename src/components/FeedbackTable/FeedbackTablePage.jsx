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
        const avg = Math.round(cust.SurveyScore / 2);
        survey[cust.SubscriptionID] = {
          q1: avg,
          q2: avg,
          q3: avg,
        };
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

  const updateSurveyInput = (id, question, value) => {
    setSurveyInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [question]: value,
      },
    }));
  };

  const getNpsCategory = (score) => {
    if (score >= 0 && score <= 6)
      return { label: "Detractor", color: "#dc3545" };
    if (score >= 7 && score <= 8) return { label: "Passive", color: "#ffc107" };
    if (score >= 9 && score <= 10)
      return { label: "Promoter", color: "#28a745" };
    return { label: "", color: "transparent" };
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const survey = surveyInputs[id] || { q1: 0, q2: 0, q3: 0 };
      const avg = Math.round(((survey.q1 + survey.q2 + survey.q3) / 3) * 2);

      const payload = {
        SubscriptionID: id,
        NPSScore: Math.round((npsInputs[id] || 0) / 10),
        SurveyScore: avg,
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
            const npsScore = Math.round(npsInputs[cust.SubscriptionID] / 10);
            const npsInfo = getNpsCategory(npsScore);
            const survey = surveyInputs[cust.SubscriptionID] || {
              q1: 0,
              q2: 0,
              q3: 0,
            };
            const avgSurvey = Math.round(
              ((survey.q1 + survey.q2 + survey.q3) / 3) * 2
            );

            return (
              <React.Fragment key={cust.SubscriptionID}>
                <tr>
                  <td>{cust.CustomerName}</td>
                  <td>{cust.SubscriptionID}</td>
                  <td>{npsInputs[cust.SubscriptionID]}%</td>
                  <td>{avgSurvey}/10</td>
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
                          <div
                            style={{
                              marginTop: "6px",
                              fontWeight: "bold",
                              color: npsInfo.color,
                            }}
                          >
                            {npsInfo.label}
                          </div>
                        </div>

                        <div className="survey-section">
                          <label>Survey Questions (Star Ratings)</label>
                          {[
                            "How easy is it to use our platform?",
                            "How satisfied are you with the support?",
                            "How likely are you to recommend us?",
                          ].map((label, idx) => {
                            const q = `q${idx + 1}`;
                            return (
                              <div key={q} style={{ marginBottom: "8px" }}>
                                <p style={{ margin: 0 }}>{label}</p>
                                <div className="star-rating">
                                  {[...Array(5)].map((_, i) => {
                                    const starVal = i + 1;
                                    return (
                                      <FaStar
                                        key={starVal}
                                        size={22}
                                        style={{
                                          cursor: "pointer",
                                          marginRight: 4,
                                        }}
                                        color={
                                          starVal <= (survey[q] || 0)
                                            ? "#ffc107"
                                            : "#e4e5e9"
                                        }
                                        onClick={() =>
                                          updateSurveyInput(
                                            cust.SubscriptionID,
                                            q,
                                            starVal
                                          )
                                        }
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                          <div
                            style={{ fontStyle: "italic", marginTop: "4px" }}
                          >
                            Average Score: {avgSurvey}/10
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
