// import "./App.css";
// import HomePage from "./components/HomePage/HomePage";
// //import Login from "./components/LoginPage/Login";
// //import { useMsal } from "@azure/msal-react";
// //import { useEffect, useState, useCallback } from "react";
// //import { useNavigate } from "react-router-dom";
// import React from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import HealthScore from "./components/HealthScore/HealthScorePage";
// import Growth from "./components/Growth/GrowthPage";
// import Adoption from "./components/Adoption/AdoptionPage";
// import Engagement from "./components/Engagement/EngagementPage";
// import Feedback from "./components/Feedback/FeedbackPage";
// import "./global.css"; // Import global styles

// function App() {
//   // const { accounts, instance } = useMsal();
//   // const [isAuthorized, setIsAuthorized] = useState(() => {
//   //   return localStorage.getItem("isAuthorized") === "true"; // Get from localStorage
//   // });
//   // const navigate = useNavigate();
//   // const checkPowerBILicense = useCallback(async () => {
//   //   const activeAccount = instance.getActiveAccount();
//   //   if (!activeAccount) {
//   //     console.log("No active account found. User is not authenticated.");
//   //     return;
//   //   }
//   //   try {
//   //     console.log("Checking Power BI license for:", activeAccount.username);
//   //     const accessToken = await instance.acquireTokenSilent({
//   //       scopes: ["https://graph.microsoft.com/.default"],
//   //       account: activeAccount,
//   //     });
//   //     console.log("Access Token acquired:", accessToken.accessToken);
//   //     // Call Microsoft Graph API to check the user's licenses
//   //     const response = await fetch(
//   //       `https://graph.microsoft.com/v1.0/me/licenseDetails`,
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${accessToken.accessToken}`,
//   //         },
//   //       }
//   //     );
//   //     const data = await response.json();
//   //     console.log("License Details:", data); // Log license details for debugging
//   //     // Check for Power BI Premium Per User license (using the SKU ID and SKU Part Number)
//   //     const powerBILicense = data.value.some(
//   //       (license) =>
//   //         license.skuId === "c1d032e0-5619-4761-9b5c-75b6831e1711" || // SKU ID for Power BI Premium Per User
//   //         license.skuPartNumber === "PBI_PREMIUM_PER_USER" // SKU Part Number for Power BI Premium Per User
//   //     );
//   //     if (powerBILicense) {
//   //       console.log("User has Power BI Premium Per User license.");
//   //       setIsAuthorized(true);
//   //       navigate("/home");
//   //     } else {
//   //       console.log("User does not have Power BI Premium Per User license.");
//   //       setIsAuthorized(false);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error verifying Power BI license:", error);
//   //     setIsAuthorized(false);
//   //   }
//   // }, [instance, navigate]);
//   // useEffect(() => {
//   //   console.log("useEffect triggered with accounts:", accounts); // ✅ Log accounts array
//   //   if (accounts.length > 0) {
//   //     checkPowerBILicense();
//   //   }
//   // }, [accounts, checkPowerBILicense]);
//   // return <div>{isAuthorized ? <h1>Welcome to Home Page</h1> : <Login />}</div>;
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/healthscore" element={<HealthScore />} />
//         <Route path="/growth" element={<Growth />} />
//         <Route path="/adoption" element={<Adoption />} />
//         <Route path="/engagement" element={<Engagement />} />
//         <Route path="/feedback" element={<Feedback />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

//my new App.js

import "./App.css";
import HomePage from "./components/HomePage/HomePage";
import HealthScore from "./components/HealthScore/HealthScorePage";
import Growth from "./components/Growth/GrowthPage";
import Adoption from "./components/Adoption/AdoptionPage";
import Engagement from "./components/Engagement/EngagementPage";
import Feedback from "./components/Feedback/FeedbackPage";
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./global.css"; // Import global styles

// Helper component to detect current route
const RouteWrapper = ({ children }) => {
  const location = useLocation();
  return children(location.pathname);
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage route="home" />} />
        <Route
          path="/healthscore"
          element={
            <RouteWrapper>
              {(path) => <HomePage route="healthscore" path={path} />}
            </RouteWrapper>
          }
        />
        <Route
          path="/growth"
          element={
            <RouteWrapper>
              {(path) => <HomePage route="growth" path={path} />}
            </RouteWrapper>
          }
        />
        <Route
          path="/adoption"
          element={
            <RouteWrapper>
              {(path) => <HomePage route="adoption" path={path} />}
            </RouteWrapper>
          }
        />
        <Route
          path="/engagement"
          element={
            <RouteWrapper>
              {(path) => <HomePage route="engagement" path={path} />}
            </RouteWrapper>
          }
        />
        <Route
          path="/feedback"
          element={
            <RouteWrapper>
              {(path) => <HomePage route="feedback" path={path} />}
            </RouteWrapper>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
