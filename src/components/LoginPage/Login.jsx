import React from "react";
import "./Login.css";
import LoginImage from "../Assets/cs-img.webp";
import LoginLogo from "../Assets/logo.png";
//import { useMsal } from "@azure/msal-react";
//import { useNavigate } from "react-router-dom";

const Login = () => {
  // const { instance } = useMsal();
  // const navigate = useNavigate();

  // const login = async () => {
  //   try {
  //     console.log("Checking for an active session...");

  //     // Ensure no active session before login
  //     const activeAccount = instance.getActiveAccount();
  //     if (activeAccount) {
  //       console.log("Logging out current user:", activeAccount.username);
  //       await instance.logoutPopup(); // Log the user out first
  //     }

  //     console.log("Starting new login process...");
  //     const loginResponse = await instance.loginPopup({
  //       scopes: [
  //         "User.Read",
  //         "openid",
  //         "profile",
  //         "offline_access",
  //         "https://graph.microsoft.com/User.Read",
  //       ],
  //     });

  //     instance.setActiveAccount(loginResponse.account);
  //     console.log("User logged in successfully:", loginResponse.account);

  //     // Get Microsoft Graph access token
  //     const graphToken = await instance.acquireTokenSilent({
  //       scopes: ["https://graph.microsoft.com/.default"],
  //       account: loginResponse.account,
  //     });

  //     console.log("Graph API access token acquired:", graphToken.accessToken);

  //     // Fetch user's license details from Microsoft Graph
  //     const licenseResponse = await fetch(
  //       "https://graph.microsoft.com/v1.0/me/licenseDetails",
  //       {
  //         headers: { Authorization: `Bearer ${graphToken.accessToken}` },
  //       }
  //     );

  //     if (!licenseResponse.ok) {
  //       throw new Error("Failed to fetch license details");
  //     }

  //     const licenseData = await licenseResponse.json();
  //     console.log("License Details:", licenseData);

  //     if (!licenseData.value || !Array.isArray(licenseData.value)) {
  //       throw new Error("Invalid license data received.");
  //     }

  //     // Check if user has Power BI Premium Per User (PPU) or Pro license
  //     const hasPowerBILicense = licenseData.value.some(
  //       (license) =>
  //         license.skuId === "c1d032e0-5619-4761-9b5c-75b6831e1711" || // PPU License SKU ID
  //         license.skuPartNumber === "PBI_PREMIUM_PER_USER" || // PPU License Part Number
  //         license.skuPartNumber === "POWER_BI_PRO" // Pro License Part Number
  //     );

  //     if (hasPowerBILicense) {
  //       console.log(
  //         "✅ User has a valid Power BI license. Redirecting to home..."
  //       );
  //       navigate("/home"); // Allow user to proceed to the home page
  //     } else {
  //       console.log("❌ User does not have a Power BI license.");

  //       // Show alert for users without the Power BI license
  //       alert(
  //         "You do not have a Power BI Pro or Premium Per User (PPU) license."
  //       );

  //       // Log the user out immediately after the alert
  //       instance.logoutRedirect({
  //         postLogoutRedirectUri: window.location.origin + "?prompt=none", // Attempting to bypass the account chooser
  //       });

  //       console.log("User session cleared. Ready for new login.");

  //       // Manually clear session data and localStorage
  //       instance.setActiveAccount(null); // Explicitly clear active account
  //       sessionStorage.clear(); // Clear sessionStorage if needed
  //       localStorage.clear(); // Clear localStorage if needed

  //       // Redirect to the login page for a fresh login attempt
  //       window.location.href = "/"; // Force full page reload and reset session
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     // Prevent the error alert from showing for users without Power BI license
  //     if (error.errorCode === "interaction_required") {
  //       await instance.loginPopup({
  //         scopes: ["User.Read", "openid", "profile", "offline_access"],
  //       });
  //     } else {
  //       alert("An error occurred during login. Please try again.");
  //     }
  //   }
  // };

  //   return (
  //     <div className="wrapper">
  //       <div className="form">
  //         <div className="logo-container">
  //           <img
  //             src={LoginLogo}
  //             alt="Login Illustration"
  //             className="login-logo"
  //           />
  //         </div>
  //         <button onClick={login} className="login-btn">
  //           Sign in with Microsoft
  //         </button>
  //       </div>
  //       <div className="image-container">
  //         <img
  //           src={LoginImage}
  //           alt="Login Illustration"
  //           className="login-image"
  //         />
  //       </div>
  //     </div>
  //   );
  // };
  return (
    <div className="wrapper">
      <div className="form">
        <div className="logo-container">
          <img
            src={LoginLogo}
            alt="Login Illustration"
            className="login-logo"
          />
        </div>
        {/* <button onClick={login} className="login-btn">Sign in with Microsoft</button> */}
        <p>Login functionality is temporarily disabled.</p>
      </div>
      <div className="image-container">
        <img
          src={LoginImage}
          alt="Login Illustration"
          className="login-image"
        />
      </div>
    </div>
  );
};

export default Login;
