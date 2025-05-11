import React, { useEffect, useState } from "react";
import axios from "axios";

const FeedbackTablePage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("/api/subscription-feedbacks");
      const dataWithRatings = res.data.map((item) => ({
        ...item,
        Q1Rating: item.Q1Rating ?? "",
        Q2Rating: item.Q2Rating ?? "",
        Q3Rating: item.Q3Rating ?? "",
        SurveyScore: item.SurveyScore ?? "",
        NPSScore: item.NPSScore ? item.NPSScore * 10 : "", // display as %
      }));
      setFeedbacks(dataWithRatings);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    }
  };

  // Ratings are 0-5; internally multiplied by 2 for scoring
  const calculateSurveyScore = (q1, q2, q3) => {
    const rawValues = [q1, q2, q3].map((v) => (v === "" ? null : Number(v)));
    if (rawValues.some((v) => v === null)) return "";

    const scaledValues = rawValues.map((v) => v * 2); // scale to 0–10
    const avg = scaledValues.reduce((sum, v) => sum + v, 0) / 3;
    return Math.round(avg * 10) / 10; // round to 1 decimal
  };

  const handleInputChange = (index, field, value) => {
    let safeValue = value === "" ? "" : Number(value);

    // Clamp ranges
    if (["Q1Rating", "Q2Rating", "Q3Rating"].includes(field)) {
      safeValue = Math.max(0, Math.min(5, safeValue)); // 0-5 input
    } else if (field === "NPSScore") {
      safeValue = Math.max(0, Math.min(100, safeValue)); // 0–100 percent input
    }

    setFeedbacks((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: safeValue };

      // Recalculate Survey Score
      if (["Q1Rating", "Q2Rating", "Q3Rating"].includes(field)) {
        item.SurveyScore = calculateSurveyScore(
          item.Q1Rating,
          item.Q2Rating,
          item.Q3Rating
        );
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleSave = async (feedback) => {
    const {
      SubscriptionID,
      Q1Rating,
      Q2Rating,
      Q3Rating,
      SurveyScore,
      NPSScore,
    } = feedback;

    const finalNPSScore =
      NPSScore === "" ? "" : Math.round((NPSScore / 10) * 10) / 10; // convert % to 0-10

    setSavingId(SubscriptionID);
    try {
      await axios.post("/api/subscription-feedbacks", {
        SubscriptionID,
        Q1Rating,
        Q2Rating,
        Q3Rating,
        SurveyScore,
        NPSScore: finalNPSScore,
      });
      await fetchFeedbacks(); // refresh
    } catch (err) {
      console.error("Failed to save", err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Customer Feedback Table</h2>
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Subscription ID</th>
            <th className="border px-3 py-2">Customer Name</th>
            <th className="border px-3 py-2">Q1 Rating (0–5)</th>
            <th className="border px-3 py-2">Q2 Rating (0–5)</th>
            <th className="border px-3 py-2">Q3 Rating (0–5)</th>
            <th className="border px-3 py-2">Survey Score (0–10)</th>
            <th className="border px-3 py-2">NPS Score (%)</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((feedback, index) => (
            <tr key={feedback.SubscriptionID}>
              <td className="border px-3 py-2">{feedback.SubscriptionID}</td>
              <td className="border px-3 py-2">{feedback.CustomerName}</td>
              {["Q1Rating", "Q2Rating", "Q3Rating"].map((field) => (
                <td key={field} className="border px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="1"
                    value={feedback[field] ?? ""}
                    onChange={(e) =>
                      handleInputChange(index, field, e.target.value)
                    }
                    className="w-16 border rounded px-1 py-0.5"
                  />
                </td>
              ))}
              <td className="border px-3 py-2 text-center">
                {feedback.SurveyScore !== "" ? feedback.SurveyScore : "--"}
              </td>
              <td className="border px-3 py-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={feedback.NPSScore ?? ""}
                  onChange={(e) =>
                    handleInputChange(index, "NPSScore", e.target.value)
                  }
                  className="w-20 border rounded px-1 py-0.5"
                />
              </td>
              <td className="border px-3 py-2">
                <button
                  onClick={() => handleSave(feedback)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  disabled={savingId === feedback.SubscriptionID}
                >
                  {savingId === feedback.SubscriptionID ? "Saving..." : "Save"}
                </button>
              </td>
            </tr>
          ))}
          {feedbacks.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center py-4">
                No subscriptions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackTablePage;
