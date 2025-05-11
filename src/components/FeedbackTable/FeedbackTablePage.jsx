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
      }));
      setFeedbacks(dataWithRatings);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    }
  };

  const calculateSurveyScore = (q1, q2, q3) => {
    const values = [q1, q2, q3].map((v) => (v === "" ? null : Number(v)));
    if (values.some((v) => v === null)) return "";
    const avg = values.reduce((sum, v) => sum + v, 0) / 3;
    return Math.round(avg * 10) / 10; // One decimal
  };

  const handleInputChange = (index, field, value) => {
    const safeValue =
      value === "" ? "" : Math.max(0, Math.min(10, Number(value)));

    setFeedbacks((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: safeValue };

      // Update SurveyScore if any question rating changes
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

    const safeNpsScore = Math.max(0, Math.min(10, Math.round(NPSScore || 0)));

    setSavingId(SubscriptionID);
    try {
      await axios.post("/api/subscription-feedbacks", {
        SubscriptionID,
        Q1Rating,
        Q2Rating,
        Q3Rating,
        SurveyScore,
        NPSScore: safeNpsScore,
      });
      await fetchFeedbacks(); // Refresh data
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
            <th className="border px-3 py-2">Q1 Rating</th>
            <th className="border px-3 py-2">Q2 Rating</th>
            <th className="border px-3 py-2">Q3 Rating</th>
            <th className="border px-3 py-2">Survey Score</th>
            <th className="border px-3 py-2">NPS Score (0-10)</th>
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
                    max="10"
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
                  max="10"
                  value={feedback.NPSScore ?? ""}
                  onChange={(e) =>
                    handleInputChange(index, "NPSScore", e.target.value)
                  }
                  className="w-16 border rounded px-1 py-0.5"
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
