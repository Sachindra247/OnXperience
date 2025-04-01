import React from "react";
import { Link } from "react-router-dom"; // Import Link
import Logo from "../Assets/logo.png";
//import SearchBar from "../SearchBar/SearchBar";

const Header = ({ onSearch }) => {
  return (
    <header className="header">
      <Link to="/">
        <img src={Logo} alt="Logo" className="logo" />
      </Link>
      {/* <SearchBar onSearch={onSearch} /> */}
    </header>
  );
};

export default Header;
