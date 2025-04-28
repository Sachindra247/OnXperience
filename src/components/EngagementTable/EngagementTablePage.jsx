import React, { useState } from "react";
import "./EngagementTable.css";

const engagementTypes = [
  { type: "C-Level Meeting", points: 50 },
  { type: "Scheduled CS Review", points: 25 },
  { type: "In-person meeting", points: 20 },
  { type: "Conference Call", points: 15 },
  { type: "Phone Follow up", points: 2 },
  { type: "Email Follow up", points: 1 },
];

const EngagementTablePage = () => {
  const [selectedEngagement, setSelectedEngagement] = useState("");
  const [engagementList, setEngagementList] = useState([]);

  const handleSelectChange = (e) => {
    setSelectedEngagement(e.target.value);
  };

  const handleAddEngagement = () => {
    if (selectedEngagement) {
      const selected = engagementTypes.find(
        (engagement) => engagement.type === selectedEngagement
      );
      if (selected) {
        setEngagementList((prevList) => [
          ...prevList,
          { type: selected.type, points: selected.points },
        ]);
        setSelectedEngagement("");
      }
    }
  };

  const totalPoints = engagementList.reduce(
    (sum, item) => sum + item.points,
    0
  );

  return (
    <div className="engagement-table-page-container">
      <h2>Log Engagement</h2>
      <div className="engagement-form">
        <select value={selectedEngagement} onChange={handleSelectChange}>
          <option value="">Select Engagement Type</option>
          {engagementTypes.map((engagement) => (
            <option key={engagement.type} value={engagement.type}>
              {engagement.type}
            </option>
          ))}
        </select>

        <button onClick={handleAddEngagement} disabled={!selectedEngagement}>
          Add Engagement
        </button>
      </div>

      <div className="engagement-table">
        <h3>Logged Engagements</h3>
        {engagementList.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Engagement Type</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {engagementList.map((engagement, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{engagement.type}</td>
                  <td>{engagement.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No engagements logged yet.</p>
        )}
      </div>

      <div className="total-points">
        <h3>Total Points: {totalPoints}</h3>
      </div>
    </div>
  );
};

export default EngagementTablePage;
