// src/components/Header/Header.jsx
import React from "react";
import Logo from "../Assets/logo.png";
import SearchBar from "../SearchBar/SearchBar"; // Import the SearchBar component

const Header = ({ onSearch }) => {
  return (
    <header className="header">
      <img src={Logo} alt="Logo" className="logo" />
      <SearchBar onSearch={onSearch} /> {/* Use the SearchBar component */}
    </header>
  );
};

export default Header;
