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
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    }
  };

  const handleInputChange = (index, field, value) => {
    const safeValue =
      value === "" ? "" : Math.max(0, Math.min(10, Number(value)));

    setFeedbacks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: safeValue };
      return updated;
    });
  };

  const handleSave = async (feedback) => {
    const { SubscriptionID, SurveyScore, NPSScore } = feedback;

    const safeSurveyScore = Math.max(
      0,
      Math.min(10, Math.round(SurveyScore || 0))
    );
    const safeNpsScore = Math.max(0, Math.min(10, Math.round(NPSScore || 0)));

    setSavingId(SubscriptionID);
    try {
      await axios.post("/api/subscription-feedbacks", {
        SubscriptionID,
        SurveyScore: safeSurveyScore,
        NPSScore: safeNpsScore,
      });
      await fetchFeedbacks(); // refresh data
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
            <th className="border px-3 py-2">Survey Score (0-10)</th>
            <th className="border px-3 py-2">NPS Score (0-10)</th>
            <th className="border px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((feedback, index) => (
            <tr key={feedback.SubscriptionID}>
              <td className="border px-3 py-2">{feedback.SubscriptionID}</td>
              <td className="border px-3 py-2">{feedback.CustomerName}</td>
              <td className="border px-3 py-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={feedback.SurveyScore ?? ""}
                  onChange={(e) =>
                    handleInputChange(index, "SurveyScore", e.target.value)
                  }
                  className="w-16 border rounded px-1 py-0.5"
                />
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
              <td colSpan="5" className="text-center py-4">
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
