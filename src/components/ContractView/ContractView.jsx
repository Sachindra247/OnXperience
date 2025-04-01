import React from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import Logo from "../Assets/logo.png";
import "./ContractView.css";

const ContractView = () => {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const activeAccount = instance.getActiveAccount();

  const handleLogout = () => {
    instance.logoutPopup().then(() => {
      navigate("/");
    });
  };

  return (
    <div>
      <header className="header">
        <a href="/home">
          <img src={Logo} alt="Logo" className="logo" />
        </a>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="main-content">
        <h1>Contract View</h1>

        <h2>
          Logged in user: {activeAccount ? `${activeAccount.name}` : "User"}
        </h2>
      </main>
    </div>
  );
};

export default ContractView;
