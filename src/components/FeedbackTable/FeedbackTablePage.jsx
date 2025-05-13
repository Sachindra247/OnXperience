import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FeedbackTable.css";

const surveyQuestions = [
  "Ease of Use",
  "Product Reliability",
  "Customer Support",
  "Feature Satisfaction",
  "Value for Money",
];

const StarRating = ({ score, onChange, max = 5 }) => (
  <div className="star-rating">
    {[...Array(max)].map((_, i) => (
      <span
        key={i}
        className={`star ${i < score ? "filled" : ""}`}
        onClick={() => onChange(i + 1)}
      >
        ★
      </span>
    ))}
  </div>
);

const getNpsLabelAndColor = (score) => {
  if (score >= 90) return { label: "Promoter", color: "#34d399" };
  if (score >= 70) return { label: "Passive", color: "#fbbf24" };
  return { label: "Detractor", color: "#f87171" };
};

const FeedbackTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [surveyInputs, setSurveyInputs] = useState({});
  const [npsInputs, setNpsInputs] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        "https://on-xperience.vercel.app/api/subscription-feedbacks"
      );
      const data = Array.isArray(res.data) ? res.data : [];
      setCustomers(data);

      // Initialize survey inputs with existing data
      const initialSurveyInputs = {};
      const initialNpsInputs = {};
      data.forEach((cust) => {
        if (cust.SurveyScores) {
          initialSurveyInputs[cust.SubscriptionID] = {};
          cust.SurveyScores.forEach((q) => {
            initialSurveyInputs[cust.SubscriptionID][q.Question] = q.Score;
          });
        }
        if (cust.NPSPercentage != null) {
          initialNpsInputs[cust.SubscriptionID] = cust.NPSPercentage;
        }
      });
      setSurveyInputs(initialSurveyInputs);
      setNpsInputs(initialNpsInputs);
    } catch (err) {
      console.error("Error fetching feedback data:", err);
    }
  };

  const handleStarChange = (subscriptionId, question, value) => {
    setSurveyInputs((prev) => ({
      ...prev,
      [subscriptionId]: {
        ...prev[subscriptionId],
        [question]: value,
      },
    }));
  };

  const handleNpsChange = (subscriptionId, value) => {
    const clamped = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
    setNpsInputs((prev) => ({
      ...prev,
      [subscriptionId]: clamped,
    }));
  };

  const calculateSurveyScore = (answers) => {
    const scores = Object.values(answers || {});
    if (scores.length === 0) return 0;
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round((average / 5) * 10 * 10) / 10;
  };

  const calculateNpsScore = (percent) => {
    return Math.round((percent / 100) * 10 * 10) / 10;
  };

  const handleSubmitFeedback = async (subscriptionId) => {
    const survey = surveyInputs[subscriptionId] || {};
    const npsPercent = npsInputs[subscriptionId] || 0;
    const surveyScore = calculateSurveyScore(survey);
    const npsScore = calculateNpsScore(npsPercent);
    const rating = ratingInputs[subscriptionId] || 0;
    const comment = commentInputs[subscriptionId] || "";

    const formattedSurvey = Object.entries(survey).map(([question, score]) => ({
      question,
      score,
    }));

    try {
      setIsLoading(true);
      await axios.put(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: subscriptionId,
          SurveyScores: formattedSurvey,
          SurveyScore: surveyScore,
          NPSPercentage: npsPercent,
          NPSScore: npsScore,
          Rating: rating,
          Comment: comment,
        }
      );
      await fetchCustomers();
      alert("Feedback submitted successfully.");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit feedback.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="feedback-table-container">
      <h2>Customer Feedback</h2>
      <table className="feedback-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Subscription ID</th>
            <th>Survey Score</th>
            <th>NPS %</th>
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
                <td>
                  {cust.SurveyScore != null ? (
                    <div className="score-badge">{cust.SurveyScore}/10</div>
                  ) : (
                    <span className="not-rated">Not Rated</span>
                  )}
                </td>
                <td>
                  {cust.NPSPercentage != null ? (
                    <div className="score-badge">{cust.NPSPercentage}%</div>
                  ) : (
                    <span className="not-rated">Not Rated</span>
                  )}
                </td>
                <td>
                  {cust.NPSScore != null ? (
                    <div className="score-badge">{cust.NPSScore}/10</div>
                  ) : (
                    <span className="not-rated">-</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() =>
                      setExpanded(
                        expanded === cust.SubscriptionID
                          ? null
                          : cust.SubscriptionID
                      )
                    }
                    className="toggle-btn"
                  >
                    {expanded === cust.SubscriptionID
                      ? "Cancel"
                      : "Edit Feedback"}
                  </button>
                </td>
              </tr>
              {expanded === cust.SubscriptionID && (
                <tr className="expanded-row">
                  <td colSpan="6">
                    <div className="survey-form">
                      <h4>Edit Feedback for {cust.CustomerName}</h4>
                      <div className="survey-questions">
                        {surveyQuestions.map((q) => (
                          <div key={q} className="question-row">
                            <label>{q}</label>
                            <StarRating
                              score={
                                surveyInputs[cust.SubscriptionID]?.[q] || 0
                              }
                              onChange={(val) =>
                                handleStarChange(cust.SubscriptionID, q, val)
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <div className="nps-section">
                        <div className="question-row">
                          <label>Net Promoter Score (NPS) %</label>
                          <input
                            type="number"
                            value={npsInputs[cust.SubscriptionID] || ""}
                            onChange={(e) =>
                              handleNpsChange(
                                cust.SubscriptionID,
                                e.target.value
                              )
                            }
                            placeholder="0-100"
                            min="0"
                            max="100"
                            className="nps-input"
                          />
                          <div className="nps-bar-wrapper">
                            <div
                              className="nps-bar-fill"
                              style={{
                                width: `${
                                  npsInputs[cust.SubscriptionID] || 0
                                }%`,
                                backgroundColor: getNpsLabelAndColor(
                                  npsInputs[cust.SubscriptionID] || 0
                                ).color,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          onClick={() =>
                            handleSubmitFeedback(cust.SubscriptionID)
                          }
                          disabled={isLoading}
                          className="submit-btn"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setExpanded(null)}
                          className="cancel-btn"
                        >
                          Cancel
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
