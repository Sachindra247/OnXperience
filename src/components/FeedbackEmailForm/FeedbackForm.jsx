import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "./FeedbackForm.css"; // You'll need to create this CSS file

const FeedbackForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [npsScore, setNpsScore] = useState(0);
  const [surveyResponses, setSurveyResponses] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [token] = useState(searchParams.get("token"));
  const [subscriptionId] = useState(searchParams.get("sub"));

  const handleStarClick = (question, value) => {
    setSurveyResponses((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const handleNpsChange = (e) => {
    setNpsScore(parseInt(e.target.value) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !subscriptionId) {
      setError("Invalid feedback link. Please request a new one.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Calculate survey score (average of Q1-Q3 converted to 0-10 scale)
      const surveyScore = Math.round(
        ((surveyResponses.q1 + surveyResponses.q2 + surveyResponses.q3) / 3) * 2
      );

      await axios.put(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          SubscriptionID: subscriptionId,
          NPSScore: npsScore,
          SurveyScore: surveyScore,
          SurveyQ1: surveyResponses.q1,
          SurveyQ2: surveyResponses.q2,
          SurveyQ3: surveyResponses.q3,
          token: token,
        }
      );

      setSuccess(true);
      setTimeout(() => navigate("/thank-you"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || !subscriptionId) {
    return (
      <div className="feedback-form-container invalid-link">
        <h2>Feedback Form</h2>
        <div className="error-message">
          This feedback link is invalid or has expired. Please request a new
          feedback link.
        </div>
        <button onClick={() => navigate("/")} className="home-button">
          Return to Home
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="feedback-form-container success-message">
        <div className="success-content">
          <svg viewBox="0 0 24 24" className="success-icon">
            <path
              fill="currentColor"
              d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"
            />
          </svg>
          <h2>Thank You!</h2>
          <p>Your feedback has been successfully submitted.</p>
          <p>We appreciate your time and valuable input.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-form-container">
      <div className="feedback-form-header">
        <h2>Customer Feedback Survey</h2>
        <p>We appreciate your time in helping us improve our service</p>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-section nps-section">
          <h3>Net Promoter Score</h3>
          <p className="question-text">
            On a scale of 0-10, how likely are you to recommend our
            product/service to a friend or colleague?
          </p>
          <div className="nps-scale-container">
            <input
              type="range"
              min="0"
              max="10"
              value={npsScore}
              onChange={handleNpsChange}
              className="nps-slider"
            />
            <div className="nps-scale-labels">
              <span>0 (Not at all likely)</span>
              <span>10 (Extremely likely)</span>
            </div>
            <div className="nps-selected-value">
              Your rating: <strong>{npsScore}</strong>
            </div>
          </div>
        </div>

        <div className="form-section survey-section">
          <h3>Service Evaluation</h3>
          <p>Please rate the following aspects of our service:</p>

          <div className="survey-question">
            <p className="question-text">
              1. How easy is it to use our platform?
            </p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={`q1-${star}`}
                  size={28}
                  color={star <= surveyResponses.q1 ? "#ffc107" : "#e4e5e9"}
                  onClick={() => handleStarClick("q1", star)}
                  className="star-icon"
                />
              ))}
              <span className="rating-value">{surveyResponses.q1}/5</span>
            </div>
          </div>

          <div className="survey-question">
            <p className="question-text">
              2. How satisfied are you with the support?
            </p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={`q2-${star}`}
                  size={28}
                  color={star <= surveyResponses.q2 ? "#ffc107" : "#e4e5e9"}
                  onClick={() => handleStarClick("q2", star)}
                  className="star-icon"
                />
              ))}
              <span className="rating-value">{surveyResponses.q2}/5</span>
            </div>
          </div>

          <div className="survey-question">
            <p className="question-text">
              3. How likely are you to recommend us?
            </p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={`q3-${star}`}
                  size={28}
                  color={star <= surveyResponses.q3 ? "#ffc107" : "#e4e5e9"}
                  onClick={() => handleStarClick("q3", star)}
                  className="star-icon"
                />
              ))}
              <span className="rating-value">{surveyResponses.q3}/5</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={
              submitting ||
              npsScore === 0 ||
              surveyResponses.q1 === 0 ||
              surveyResponses.q2 === 0 ||
              surveyResponses.q3 === 0
            }
            className="submit-button"
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
