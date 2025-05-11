import React, { useEffect, useState } from "react";
import axios from "axios";

const FeedbackTablePage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q1, setQ1] = useState(1);
  const [q2, setQ2] = useState(1);
  const [q3, setQ3] = useState(1);
  const [nps, setNps] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("https://on-xperience.vercel.app/api/subscription-feedbacks")
      .then((res) => {
        setSubscriptions(res.data);
      });
  }, []);

  const handleSubmit = async () => {
    if (!selected) {
      alert("Select a subscription.");
      return;
    }

    try {
      await axios.post(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: selected.SubscriptionID,
          SurveyQ1: q1,
          SurveyQ2: q2,
          SurveyQ3: q3,
          NPSPercentage: nps,
        }
      );
      setMessage("Feedback submitted successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Error submitting feedback.");
    }
  };

  return (
    <div>
      <h2>Customer Feedback</h2>
      <label>Select Subscription:</label>
      <select
        onChange={(e) => {
          const sub = subscriptions.find(
            (s) => s.SubscriptionID === e.target.value
          );
          setSelected(sub);
          setMessage("");
        }}
        value={selected?.SubscriptionID || ""}
      >
        <option value="">-- Select --</option>
        {subscriptions.map((s) => (
          <option key={s.SubscriptionID} value={s.SubscriptionID}>
            {s.SubscriptionID} - {s.CustomerName}
          </option>
        ))}
      </select>

      {selected && (
        <>
          <div>
            <label>Survey Q1 (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={q1}
              onChange={(e) => setQ1(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Survey Q2 (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={q2}
              onChange={(e) => setQ2(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Survey Q3 (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={q3}
              onChange={(e) => setQ3(Number(e.target.value))}
            />
          </div>
          <div>
            <label>NPS Score (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={nps}
              onChange={(e) => setNps(Number(e.target.value))}
            />
          </div>
          <button onClick={handleSubmit}>Submit Feedback</button>
          {message && <p>{message}</p>}
        </>
      )}
    </div>
  );
};

export default FeedbackTablePage;
