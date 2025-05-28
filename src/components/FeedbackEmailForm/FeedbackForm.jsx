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
      } catch (err) {
        setStatus("Failed to load data.");
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

  if (!subscriptionId) return <p>Missing subscription ID.</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
      <h2>Feedback</h2>
      {customer && <p>Hi {customer.CustomerName}, we’d love your feedback!</p>}

      <label>NPS (0–100%)</label>
      <input
        type="number"
        min="0"
        max="100"
        value={nps}
        onChange={(e) => setNps(Number(e.target.value))}
        style={{ width: "100%", marginBottom: "20px" }}
      />

      {["Ease of use?", "Support satisfaction?", "Recommend us?"].map(
        (q, i) => {
          const key = `q${i + 1}`;
          const selected = survey[key];
          return (
            <div key={key} style={{ marginBottom: "16px" }}>
              <p>{q}</p>
              {[...Array(5)].map((_, j) => {
                const val = j + 1;
                return (
                  <FaStar
                    key={val}
                    size={24}
                    color={val <= selected ? "#ffc107" : "#ccc"}
                    style={{ cursor: "pointer", marginRight: 5 }}
                    onClick={() =>
                      setSurvey((prev) => ({ ...prev, [key]: val }))
                    }
                  />
                );
              })}
            </div>
          );
        }
      )}

      <button onClick={handleSubmit} style={{ marginTop: 20 }}>
        Submit Feedback
      </button>

      {status && <p style={{ marginTop: 20 }}>{status}</p>}
    </div>
  );
};

export default FeedbackForm;
