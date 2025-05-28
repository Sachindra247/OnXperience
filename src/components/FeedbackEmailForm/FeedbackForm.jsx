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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!subscriptionId) return;
    const fetchData = async () => {
      try {
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
        setLoadError(false);
      } catch (err) {
        setLoadError(true);
      }
    };
    fetchData();
  }, [subscriptionId]);

  const handleSubmit = async () => {
    try {
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
    } catch (err) {
      setStatus("Error saving feedback. Please try again.");
    }
  };

  if (!subscriptionId)
    return <p style={{ color: "white" }}>Missing subscription ID.</p>;

  const surveyQuestions = [
    {
      key: "q1",
      question: "How easy was it to use our product?",
      caption:
        "Please rate the ease of use from 1 (very difficult) to 5 (very easy).",
    },
    {
      key: "q2",
      question: "How satisfied are you with our support?",
      caption:
        "Rate your satisfaction with our customer support from 1 (very unsatisfied) to 5 (very satisfied).",
    },
    {
      key: "q3",
      question: "How likely are you to recommend us to others?",
      caption:
        "Rate how likely you are to recommend our product/service from 1 (not likely) to 5 (very likely).",
    },
  ];

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "auto",
        padding: "20px",
        color: "white",
      }}
    >
      <h2 style={{ marginTop: "24px", marginBottom: "24px" }}>
        Feedback{customer ? ` for ${customer.CustomerName}` : ""}
      </h2>

      {customer && (
        <p style={{ color: "white", marginBottom: "24px" }}>
          Hi {customer.CustomerName}, we’d love your feedback!
        </p>
      )}

      <div style={{ marginBottom: "24px" }}>
        <label
          htmlFor="nps-input"
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "6px",
            color: "white",
          }}
        >
          Net Promoter Score (NPS)
        </label>
        <p
          style={{
            marginTop: 0,
            marginBottom: "6px",
            color: "#ccc",
            fontSize: "0.9em",
          }}
        >
          On a scale from 0 to 100, how likely are you to recommend us to a
          friend or colleague?
        </p>
        <input
          id="nps-input"
          type="number"
          min="0"
          max="100"
          value={nps}
          onChange={(e) => setNps(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "1em",
            backgroundColor: "#222",
            border: "1px solid #444",
            color: "white",
            borderRadius: "4px",
          }}
        />
      </div>

      {surveyQuestions.map(({ key, question, caption }) => {
        const selected = survey[key];
        return (
          <div key={key} style={{ marginBottom: "28px" }}>
            <p
              style={{
                fontWeight: "bold",
                marginBottom: "6px",
                fontSize: "1.05em",
                color: "white",
              }}
            >
              {question}
            </p>
            <p
              style={{
                marginTop: 0,
                marginBottom: "8px",
                color: "#ccc",
                fontSize: "0.9em",
                fontStyle: "italic",
              }}
            >
              {caption}
            </p>
            {[...Array(5)].map((_, j) => {
              const val = j + 1;
              return (
                <FaStar
                  key={val}
                  size={28}
                  color={val <= selected ? "#ffc107" : "#444"}
                  style={{ cursor: "pointer", marginRight: 8 }}
                  onClick={() => setSurvey((prev) => ({ ...prev, [key]: val }))}
                />
              );
            })}
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          fontSize: "1em",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Submit Feedback
      </button>

      {status && (
        <p
          style={{
            marginTop: 20,
            color: status.includes("Thank") ? "#90ee90" : "#ff6b6b",
            fontWeight: "bold",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default FeedbackForm;
