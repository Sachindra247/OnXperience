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

const StarRating = ({ score, onChange, max = 5 }) => {
  return (
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
};

const FeedbackTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [surveyInputs, setSurveyInputs] = useState({});
  const [npsInputs, setNpsInputs] = useState({});
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
    return Math.round((average / 5) * 10 * 10) / 10; // scale to 10 and round to 1 decimal
  };

  const calculateNpsScore = (percent) => {
    return Math.round((percent / 100) * 10 * 10) / 10;
  };

  const handleSubmitFeedback = async (subscriptionId) => {
    const survey = surveyInputs[subscriptionId] || {};
    const npsPercent = npsInputs[subscriptionId] || 0;
    const surveyScore = calculateSurveyScore(survey);
    const npsScore = calculateNpsScore(npsPercent);

    const formattedSurvey = Object.entries(survey).map(([question, score]) => ({
      question,
      score,
    }));

    try {
      setIsLoading(true);
      await axios.post(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: subscriptionId,
          SurveyScores: formattedSurvey,
          NPSPercentage: npsPercent,
          SurveyScore: surveyScore,
          NPSScore: npsScore,
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
            <th>Survey</th>
            <th>NPS %</th>
            <th>Submit</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <React.Fragment key={cust.SubscriptionID}>
              <tr>
                <td>{cust.CustomerName}</td>
                <td>{cust.SubscriptionID}</td>
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
                      ? "Hide Questions"
                      : "Rate Survey"}
                  </button>
                </td>
                <td>
                  <input
                    type="number"
                    value={npsInputs[cust.SubscriptionID] || ""}
                    onChange={(e) =>
                      handleNpsChange(cust.SubscriptionID, e.target.value)
                    }
                    placeholder="0-100"
                    min="0"
                    max="100"
                    className="nps-input"
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleSubmitFeedback(cust.SubscriptionID)}
                    disabled={isLoading}
                    className="submit-btn"
                  >
                    Submit
                  </button>
                </td>
              </tr>
              {expanded === cust.SubscriptionID && (
                <tr>
                  <td colSpan="5">
                    <div className="survey-section">
                      {surveyQuestions.map((q) => (
                        <div key={q} className="question-row">
                          <label>{q}</label>
                          <StarRating
                            score={
                              surveyInputs[cust.SubscriptionID]?.[q]
                                ? surveyInputs[cust.SubscriptionID][q]
                                : 0
                            }
                            onChange={(val) =>
                              handleStarChange(cust.SubscriptionID, q, val)
                            }
                          />
                        </div>
                      ))}
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
