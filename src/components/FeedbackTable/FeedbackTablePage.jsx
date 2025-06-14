// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./FeedbackTable.css";
// import { FaStar } from "react-icons/fa";

// const FeedbackTablePage = () => {
//   const [customers, setCustomers] = useState([]);
//   const [expanded, setExpanded] = useState(null);
//   const [npsInputs, setNpsInputs] = useState({});
//   const [surveyInputs, setSurveyInputs] = useState({});
//   const [initialSurveyValues, setInitialSurveyValues] = useState(() => {
//     const saved = localStorage.getItem("surveyRatings");
//     return saved ? JSON.parse(saved) : {};
//   });
//   const [loading, setLoading] = useState(false);
//   const [savingId, setSavingId] = useState(null);
//   const [error, setError] = useState(null);
//   const [retry, setRetry] = useState(0);

//   const fetchFeedbacks = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await axios.get(
//         "https://on-xperience.vercel.app/api/subscription-feedbacks",
//         {
//           timeout: 10000,
//           headers: {
//             "Cache-Control": "no-cache",
//             Pragma: "no-cache",
//           },
//         }
//       );

//       const data = Array.isArray(res.data)
//         ? res.data.map((item) => ({
//             ...item,
//             NPSScore: item.NPSScore ?? 0,
//             SurveyScore: item.SurveyScore ?? 0,
//             SurveyQ1: item.SurveyQ1 ?? 0,
//             SurveyQ2: item.SurveyQ2 ?? 0,
//             SurveyQ3: item.SurveyQ3 ?? 0,
//           }))
//         : [];

//       const nps = {};
//       const survey = {};
//       const initialSurvey = {};

//       data.forEach((cust) => {
//         nps[cust.SubscriptionID] = Math.round(cust.NPSScore * 10);
//         survey[cust.SubscriptionID] = {
//           q1: cust.SurveyQ1,
//           q2: cust.SurveyQ2,
//           q3: cust.SurveyQ3,
//         };
//         initialSurvey[cust.SubscriptionID] = {
//           q1: initialSurveyValues[cust.SubscriptionID]?.q1 ?? cust.SurveyQ1,
//           q2: initialSurveyValues[cust.SubscriptionID]?.q2 ?? cust.SurveyQ2,
//           q3: initialSurveyValues[cust.SubscriptionID]?.q3 ?? cust.SurveyQ3,
//         };
//       });

//       setCustomers(data);
//       setNpsInputs(nps);
//       setSurveyInputs(survey);
//       setInitialSurveyValues(initialSurvey);

//       localStorage.setItem("surveyRatings", JSON.stringify(initialSurvey));
//     } catch (err) {
//       setError(err.message);
//       if (retry < 3) {
//         setTimeout(() => setRetry((r) => r + 1), 3000);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFeedbacks();
//   }, [retry]);

//   const updateNpsInput = (id, value) => {
//     const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
//     setNpsInputs((prev) => ({ ...prev, [id]: safeValue }));
//   };

//   const updateSurveyInput = (id, question, value) => {
//     const updatedInputs = {
//       ...surveyInputs,
//       [id]: {
//         ...surveyInputs[id],
//         [question]: value,
//       },
//     };
//     setSurveyInputs(updatedInputs);

//     setCustomers((prev) =>
//       prev.map((cust) =>
//         cust.SubscriptionID === id
//           ? { ...cust, [`SurveyQ${question.slice(1)}`]: value }
//           : cust
//       )
//     );
//   };

//   const getNpsCategory = (score) => {
//     if (score <= 6) return { label: "Detractor", color: "#dc3545" };
//     if (score <= 8) return { label: "Passive", color: "#ffc107" };
//     if (score <= 10) return { label: "Promoter", color: "#28a745" };
//     return { label: "", color: "transparent" };
//   };

//   const handleSave = async (id) => {
//     try {
//       setSavingId(id);
//       setError(null);

//       const survey = surveyInputs[id] || { q1: 0, q2: 0, q3: 0 };
//       const avg = ((survey.q1 + survey.q2 + survey.q3) / 3) * 2;
//       const roundedSurveyScore = Math.round(avg);

//       const payload = {
//         SubscriptionID: id,
//         NPSScore: Math.round((npsInputs[id] || 0) / 10),
//         SurveyScore: roundedSurveyScore,
//         SurveyQ1: survey.q1,
//         SurveyQ2: survey.q2,
//         SurveyQ3: survey.q3,
//       };

//       await axios.put(
//         "https://on-xperience.vercel.app/api/subscription-feedbacks",
//         payload,
//         { timeout: 10000 }
//       );

//       const updatedCustomers = customers.map((cust) =>
//         cust.SubscriptionID === id
//           ? {
//               ...cust,
//               NPSScore: payload.NPSScore,
//               SurveyScore: payload.SurveyScore,
//               SurveyQ1: payload.SurveyQ1,
//               SurveyQ2: payload.SurveyQ2,
//               SurveyQ3: payload.SurveyQ3,
//             }
//           : cust
//       );

//       setCustomers(updatedCustomers);

//       const updatedInitialValues = {
//         ...initialSurveyValues,
//         [id]: {
//           q1: payload.SurveyQ1,
//           q2: payload.SurveyQ2,
//           q3: payload.SurveyQ3,
//         },
//       };
//       setInitialSurveyValues(updatedInitialValues);
//       localStorage.setItem(
//         "surveyRatings",
//         JSON.stringify(updatedInitialValues)
//       );

//       setExpanded(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSavingId(null);
//     }
//   };

//   const handleExpand = (id) => {
//     setSurveyInputs((prev) => ({
//       ...prev,
//       [id]: {
//         q1: initialSurveyValues[id]?.q1 || 0,
//         q2: initialSurveyValues[id]?.q2 || 0,
//         q3: initialSurveyValues[id]?.q3 || 0,
//       },
//     }));
//     setExpanded(expanded === id ? null : id);
//   };

//   if (loading && customers.length === 0) {
//     return <div className="loading">Loading... (Retry {retry}/3)</div>;
//   }

//   if (error && customers.length === 0) {
//     return (
//       <div className="error">
//         <h3>Error Loading Data</h3>
//         <p>{error}</p>
//         {retry < 3 ? (
//           <p>Retrying in 3 seconds...</p>
//         ) : (
//           <button onClick={() => setRetry(0)}>Retry Now</button>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="feedback-table-container">
//       <table className="feedback-table">
//         <thead>
//           <tr>
//             <th>Customer</th>
//             <th>Subscription ID</th>
//             <th>NPS Score</th>
//             <th>Survey Score</th>
//             <th></th>
//           </tr>
//         </thead>
//         <tbody>
//           {customers.map((cust) => {
//             const id = cust.SubscriptionID;
//             const isExpanded = expanded === id;
//             const npsValue = npsInputs[id] ?? 0;
//             const npsScore = Math.round(npsValue / 10);
//             const npsInfo = getNpsCategory(npsScore);

//             const survey = isExpanded
//               ? surveyInputs[id] || { q1: 0, q2: 0, q3: 0 }
//               : {
//                   q1: initialSurveyValues[id]?.q1 || 0,
//                   q2: initialSurveyValues[id]?.q2 || 0,
//                   q3: initialSurveyValues[id]?.q3 || 0,
//                 };

//             const avgSurvey = Math.round(
//               ((survey.q1 + survey.q2 + survey.q3) / 3) * 2
//             );

//             return (
//               <React.Fragment key={id}>
//                 <tr>
//                   <td>{cust.CustomerName}</td>
//                   <td>{id}</td>
//                   <td>{npsValue}%</td>
//                   <td>{cust.SurveyScore}/10</td>
//                   <td>
//                     <button
//                       onClick={() => handleExpand(id)}
//                       disabled={savingId === id}
//                     >
//                       {isExpanded ? "Cancel" : "Edit"}
//                     </button>
//                   </td>
//                 </tr>

//                 {isExpanded && (
//                   <tr className="expanded-row">
//                     <td colSpan="5">
//                       <div className="feedback-form">
//                         <h3>Feedback for {cust.CustomerName}</h3>

//                         <div className="nps-section">
//                           <label>
//                             How likely are you to recommend our product/service
//                             to a friend or colleague? (0–100%)
//                           </label>
//                           <input
//                             type="number"
//                             min="0"
//                             max="100"
//                             value={npsValue}
//                             onChange={(e) => updateNpsInput(id, e.target.value)}
//                           />
//                           <div
//                             style={{
//                               marginTop: "6px",
//                               marginBottom: "12px",
//                               fontWeight: "bold",
//                               color: npsInfo.color,
//                             }}
//                           >
//                             {npsInfo.label}
//                           </div>
//                         </div>

//                         <div className="survey-section">
//                           {[
//                             "How easy is it to use our platform?",
//                             "How satisfied are you with the support?",
//                             "How likely are you to recommend us?",
//                           ].map((label, idx) => {
//                             const q = `q${idx + 1}`;
//                             const selected = survey[q] || 0;

//                             return (
//                               <div key={q} style={{ marginBottom: "8px" }}>
//                                 <p style={{ margin: 0 }}>{label}</p>
//                                 <div className="star-rating">
//                                   {[...Array(5)].map((_, i) => {
//                                     const starVal = i + 1;
//                                     return (
//                                       <FaStar
//                                         key={starVal}
//                                         size={22}
//                                         style={{
//                                           cursor: "pointer",
//                                           marginRight: 4,
//                                         }}
//                                         color={
//                                           starVal <= selected
//                                             ? "#ffc107"
//                                             : "#e4e5e9"
//                                         }
//                                         onClick={() =>
//                                           updateSurveyInput(id, q, starVal)
//                                         }
//                                       />
//                                     );
//                                   })}
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>

//                         <div className="form-actions">
//                           <button
//                             onClick={() => handleSave(id)}
//                             disabled={savingId === id}
//                           >
//                             {savingId === id ? "Saving..." : "Save Changes"}
//                           </button>
//                         </div>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default FeedbackTablePage;

//Email survey modification

// Modified JSX for FeedbackTablePage

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FeedbackTable.css";
import { FaStar } from "react-icons/fa";

const FeedbackTablePage = () => {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        "https://on-xperience.vercel.app/api/subscription-feedbacks",
        {
          timeout: 10000,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      const data = Array.isArray(res.data)
        ? res.data.map((item) => ({
            ...item,
            NPSScore: item.NPSScore ?? 0,
            SurveyScore: item.SurveyScore ?? 0,
            SurveyQ1: item.SurveyQ1 ?? 0,
            SurveyQ2: item.SurveyQ2 ?? 0,
            SurveyQ3: item.SurveyQ3 ?? 0,
          }))
        : [];

      setCustomers(data);
    } catch (err) {
      setError(err.message);
      if (retry < 3) {
        setTimeout(() => setRetry((r) => r + 1), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [retry]);

  const getNpsCategory = (score) => {
    if (score <= 6) return { label: "Detractor", color: "#dc3545" };
    if (score <= 8) return { label: "Passive", color: "#ffc107" };
    if (score <= 10) return { label: "Promoter", color: "#28a745" };
    return { label: "", color: "transparent" };
  };

  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleSendEmail = async (customer) => {
    try {
      const confirmSend = window.confirm(
        `Send feedback request to ${customer.CustomerName}?`
      );
      if (!confirmSend) return;

      const payload = {
        name: customer.CustomerName,
        email: "srimalsachindra@gmail.com", // TEMP: All to test email
        subscriptionId: customer.SubscriptionID,
        feedbackLink: `https://on-xperience.vercel.app/feedback-email?subscriptionId=${customer.SubscriptionID}`,
      };

      await axios.post(
        "https://on-xperience.vercel.app/api/send-feedback-email",
        payload
      );

      alert(`Email sent to ${customer.CustomerName}`);
    } catch (err) {
      console.error("Failed to send email:", err);
      setError(`Failed to send email to ${customer.CustomerName}`);
    }
  };

  if (loading && customers.length === 0) {
    return <div className="loading">Loading... (Retry {retry}/3)</div>;
  }

  if (error && customers.length === 0) {
    return (
      <div className="error">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        {retry < 3 ? (
          <p>Retrying in 3 seconds...</p>
        ) : (
          <button onClick={() => setRetry(0)}>Retry Now</button>
        )}
      </div>
    );
  }

  return (
    <div className="feedback-table-container">
      {error && <div className="error-message">{error}</div>}
      <table className="feedback-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Subscription ID</th>
            <th>NPS Score</th>
            <th>Survey Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => {
            const id = cust.SubscriptionID;
            const isExpanded = expanded === id;

            // NPS as percentage and category
            const npsValue = Math.round(cust.NPSScore * 10);
            const npsScore = Math.round(cust.NPSScore);
            const npsInfo = getNpsCategory(npsScore);

            // Survey Q1-Q3 ratings
            const survey = {
              q1: cust.SurveyQ1,
              q2: cust.SurveyQ2,
              q3: cust.SurveyQ3,
            };

            return (
              <React.Fragment key={id}>
                <tr>
                  <td>{cust.CustomerName}</td>
                  <td>{id}</td>
                  <td>{npsValue}%</td>
                  <td>{cust.SurveyScore}/10</td>
                  <td>
                    <button onClick={() => handleExpand(id)}>
                      {isExpanded ? "Collapse" : "View"}
                    </button>
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="expanded-row">
                    <td colSpan="5">
                      <div className="feedback-form">
                        <h3>Feedback for {cust.CustomerName}</h3>

                        <div className="nps-section">
                          <label>
                            How likely are you to recommend our product/service
                            to a friend or colleague? (0–100%)
                          </label>
                          <div style={{ fontWeight: "bold", marginTop: 6 }}>
                            {npsValue}%
                          </div>
                          <div
                            style={{
                              marginTop: "6px",
                              marginBottom: "12px",
                              fontWeight: "bold",
                              color: npsInfo.color,
                            }}
                          >
                            {npsInfo.label}
                          </div>
                        </div>

                        <div className="survey-section">
                          {[
                            {
                              label: "How easy is it to use our platform?",
                              key: "q1",
                            },
                            {
                              label: "How satisfied are you with the support?",
                              key: "q2",
                            },
                            {
                              label: "How likely are you to recommend us?",
                              key: "q3",
                            },
                          ].map(({ label, key }) => {
                            const selected = survey[key] || 0;

                            return (
                              <div key={key} style={{ marginBottom: "8px" }}>
                                <p style={{ margin: 0 }}>{label}</p>
                                <div className="star-rating">
                                  {[...Array(5)].map((_, i) => {
                                    const starVal = i + 1;
                                    return (
                                      <FaStar
                                        key={starVal}
                                        size={22}
                                        style={{ marginRight: 4 }}
                                        color={
                                          starVal <= selected
                                            ? "#ffc107"
                                            : "#e4e5e9"
                                        }
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
                            onClick={() => handleSendEmail(cust)}
                            style={{ marginTop: "10px" }}
                          >
                            Send Email
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FeedbackTablePage;
