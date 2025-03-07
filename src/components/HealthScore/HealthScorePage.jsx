import React from "react";
import Header from "../../components/Header/Header";
import "./HealthScore.css";

const HealthScorePage = () => {
  return (
    <div className="settings-container">
      <Header /> {/* Use the Header component here */}
      <div className="settings-content">
        <h1>HealthScore Page</h1>
        {/* Add your settings content here */}
      </div>
    </div>
  );
};

export default HealthScorePage; // Ensure this line exists
