import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";

const FeedbackForm = () => {
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");

  const [customer, setCustomer] = useState(null);
  const [nps, setNps] = useState(0);
  const [survey, setSurvey] = useState({ q1: 0, q2: 0, q3: 0 });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subscriptionId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://on-xperience.vercel.app/api/subscription-feedbacks/${subscriptionId}`
        );
        const data = res.data;
        setCustomer(data);
        setNps((data.NPSScore ?? 0) * 10);
        setSurvey({
          q1: data.SurveyQ1 ?? 0,
          q2: data.SurveyQ2 ?? 0,
          q3: data.SurveyQ3 ?? 0,
        });
        setStatus("");
      } catch {
        setStatus("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subscriptionId]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const avg = ((survey.q1 + survey.q2 + survey.q3) / 3) * 2;
      const payload = {
        SubscriptionID: subscriptionId,
        NPSScore: Math.round(nps / 10),
        SurveyScore: Math.round(avg),
        SurveyQ1: survey.q1,
        SurveyQ2: survey.q2,
        SurveyQ3: survey.q3,
      };

      await axios.put(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        payload
      );

      setStatus("Thank you! Your feedback was saved.");
    } catch {
      setStatus("Error saving feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!subscriptionId) return <p>Missing subscription ID.</p>;

  return (
    <div className="feedback-form-container">
      <div className="feedback-form-header">
        <h2>Feedback</h2>
        {customer && (
          <p>Hi {customer.CustomerName}, we’d love your feedback!</p>
        )}
      </div>

      <div className="form-section">
        <h3>NPS (0–100%)</h3>
        <input
          type="number"
          min="0"
          max="100"
          value={nps}
          onChange={(e) => setNps(Number(e.target.value))}
          className="nps-slider"
          disabled={loading}
        />
        <div className="nps-scale-labels">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        <div className="nps-selected-value">{nps}%</div>
      </div>

      <div className="form-section">
        <h3>Survey Questions</h3>
        {[
          "How easy is it to use our platform?",
          "How satisfied are you with the support?",
          "How likely are you to recommend us?",
        ].map((question, i) => {
          const key = `q${i + 1}`;
          const selected = survey[key];

          return (
            <div key={key} className="question-text">
              <p>{question}</p>
              <div className="star-rating">
                {[...Array(5)].map((_, j) => {
                  const val = j + 1;
                  return (
                    <FaStar
                      key={val}
                      size={28}
                      className="star-icon"
                      color={val <= selected ? "#ffc107" : "#e4e5e9"}
                      onClick={() =>
                        !loading &&
                        setSurvey((prev) => ({ ...prev, [key]: val }))
                      }
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      style={{ cursor: loading ? "not-allowed" : "pointer" }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Saving...
            </>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </div>

      {status && (
        <p
          className={
            status.includes("Thank") ? "success-message" : "error-message"
          }
          style={{ marginTop: "1.5rem" }}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default FeedbackForm;
