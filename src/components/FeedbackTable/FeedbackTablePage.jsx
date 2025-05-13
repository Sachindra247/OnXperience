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

const FeedbackTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [surveyInputs, setSurveyInputs] = useState({});
  const [npsInputs, setNpsInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await axios.get(
          "https://on-xperience.vercel.app/api/subscription-feedbacks"
        );

        if (!res.data || !Array.isArray(res.data)) {
          throw new Error("Invalid data format received from server");
        }

        const data = res.data.map((item) => ({
          ...item,
          SurveyScores: item.SurveyScores || [],
        }));

        setCustomers(data);

        // Initialize form inputs
        const initialSurveyInputs = {};
        const initialNpsInputs = {};

        data.forEach((cust) => {
          initialSurveyInputs[cust.SubscriptionID] = {};
          cust.SurveyScores.forEach((q) => {
            initialSurveyInputs[cust.SubscriptionID][q.question] = q.score;
          });
          initialNpsInputs[cust.SubscriptionID] = cust.NPSPercentage || 0;
        });

        setSurveyInputs(initialSurveyInputs);
        setNpsInputs(initialNpsInputs);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err.response?.data?.error || err.message || "Failed to load data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

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
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    setNpsInputs((prev) => ({
      ...prev,
      [subscriptionId]: clamped,
    }));
  };

  const handleSubmitFeedback = async (subscriptionId) => {
    try {
      setIsLoading(true);
      setError(null);

      const survey = surveyInputs[subscriptionId] || {};
      const npsPercent = npsInputs[subscriptionId] || 0;

      // Calculate scores
      const surveyScore =
        Object.values(survey).length > 0
          ? Math.round(
              (Object.values(survey).reduce((a, b) => a + b, 0) /
                Object.values(survey).length /
                5) *
                100
            )
          : 0;

      const npsScore = Math.round((npsPercent / 100) * 100);

      const formattedSurvey = Object.entries(survey).map(
        ([question, score]) => ({
          question,
          score,
        })
      );

      await axios.put(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: subscriptionId,
          SurveyScores: formattedSurvey,
          SurveyScore: surveyScore,
          NPSPercentage: npsPercent,
          NPSScore: npsScore,
        }
      );

      // Refresh data
      const res = await axios.get(
        "https://on-xperience.vercel.app/api/subscription-feedbacks"
      );
      setCustomers(res.data || []);
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
    return <div className="loading">Loading customer feedback data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="feedback-table-container">
      <h2>Customer Feedback</h2>

      <table className="feedback-table">
        <thead>
          <tr>
            <th>Customer</th>
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
                <td>{cust.SurveyScore ?? "-"}/100</td>
                <td>{cust.NPSPercentage ?? "-"}%</td>
                <td>{cust.NPSScore ?? "-"}/100</td>
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
                  <td colSpan="6">
                    <div className="feedback-form">
                      <h3>Edit Feedback for {cust.CustomerName}</h3>

                      <div className="survey-section">
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
                        <label>NPS Percentage (0-100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={npsInputs[cust.SubscriptionID] || ""}
                          onChange={(e) =>
                            handleNpsChange(cust.SubscriptionID, e.target.value)
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
