import React, { useState } from "react";

const FeedbackTablePage = () => {
  const [surveyQ1, setSurveyQ1] = useState(0);
  const [surveyQ2, setSurveyQ2] = useState(0);
  const [surveyQ3, setSurveyQ3] = useState(0);
  const [npsScore, setNpsScore] = useState(0);

  const [finalSurveyScore, setFinalSurveyScore] = useState(0);

  const handleSubmit = () => {
    // Calculate Survey Score (weighted average)
    const weightedSurveyScore =
      surveyQ1 * 0.4 + surveyQ2 * 0.3 + surveyQ3 * 0.3;
    setFinalSurveyScore(weightedSurveyScore);

    // You can add code here to store the data in the 'Subscription_Feedbacks' table
    const feedbackData = {
      surveyQ1,
      surveyQ2,
      surveyQ3,
      npsScore,
      finalSurveyScore: weightedSurveyScore,
    };

    // Assuming you have an API or function to save the feedback
    // saveFeedback(feedbackData);
  };

  return (
    <div>
      <h2>Customer Feedback</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <label>Survey Question 1 (1-10):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={surveyQ1}
            onChange={(e) => setSurveyQ1(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Survey Question 2 (1-10):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={surveyQ2}
            onChange={(e) => setSurveyQ2(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Survey Question 3 (1-10):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={surveyQ3}
            onChange={(e) => setSurveyQ3(Number(e.target.value))}
          />
        </div>
        <div>
          <label>NPS Score (1-10):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={npsScore}
            onChange={(e) => setNpsScore(Number(e.target.value))}
          />
        </div>
        <div>
          <button type="submit">Submit Feedback</button>
        </div>
      </form>
      <div>
        <h3>Calculated Survey Score: {finalSurveyScore}</h3>
      </div>
    </div>
  );
};

export default FeedbackTablePage;
