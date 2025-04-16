// import React from "react";
// import { useMsal } from "@azure/msal-react";
// import { useNavigate } from "react-router-dom";
// import Logo from "../Assets/logo.png";
// import "./HomePage.css";
// import { PowerBIEmbed } from "powerbi-client-react";
// import { models } from "powerbi-client";

// const HomePage = () => {
//   const { instance } = useMsal();
//   const navigate = useNavigate();
//   const activeAccount = instance.getActiveAccount();

//   const handleLogout = () => {
//     instance.logoutRedirect({
//       postLogoutRedirectUri: window.location.origin,
//     });
//   };

//   // Navigate to Contract View page
//   const navigateToContractView = () => {
//     navigate("/contractview");
//   };

//   return (
//     <div>
//       <header className="header">
//         <a href="/home">
//           <img src={Logo} alt="Logo" className="logo" />
//         </a>
//         <button className="logout-btn" onClick={handleLogout}>
//           Logout
//         </button>
//       </header>
//       <main className="main-content">
//         <h1>Hi, {activeAccount ? `${activeAccount.name}` : "User"}</h1>
//         <PowerBIEmbed
//           embedConfig={{
//             type: "report",
//             id: "173ee8b0-a668-4339-bfc5-ef7f26a9be73",
//             embedUrl:
//               "https://app.powerbi.com/reportEmbed?reportId=173ee8b0-a668-4339-bfc5-ef7f26a9be73&groupId=ca4d153f-d017-4ce7-b69a-68e32890ecb9&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUNBTkFEQS1DRU5UUkFMLUItUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImVtYmVkRmVhdHVyZXMiOnsidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d",
//             accessToken:
//               "H4sIAAAAAAAEACWUt660ZgBE3-W2WCInS3_BwpLDR1hSR1hyzmD53X0l13Oqo5n55wckdzcm-c_fPxyN8-gjEWcOv8fvIjBTwDqFqyHYK-b1R_zMdFnjBaFcujGtIUShFzyoJMLH2OxboRd1mbyW4Tcr2N7XnqvuQFiqZKjsBdO3PSVfHyw85TN2h3O4aUMc2wK9y6uPPYcuy-2WF2vX3RLMdr0Z775YYqBVfhIQvIMOforc3MKK1CwXoJCGYB83q3GLS90n0_SB02kCgA8qXsGtd1Lc79BrumdfCo9e3FUAuPQRTB5fHBhT0YGeam4BqPGy-skhRAxqUBQaFJv2g9KHliS66oGP7aB2Xt1xbL5x-i-Gva2Q8qiPNw1BZlm5eXzKg8DswYUlrH2oqqWf6g0RZNCAb3Rtxaao8h0EH1Fz0rbDusjasTMwOkPkLW991lZtnTKgMV7Sf3NEvU1Pzw3qhpS9HcD-kFe-YlC-RX4ynW9FLCGahlyy8cMxy-79WR-Yfz8tlZjSCfX1PkQNlKSa0nco2q-DQbWz8zgEJhA5aYhglHOFMDNWzyCZdiQ1OxM7bjrChpDn0n1ftrV5ipriIvboJEsELdsLjwtrQPgBu-pXfeQio7Ih3dUDpQJP7_kljXXcJnjv5cDTfQ2TukLyUFTHEGs2Dmh9TE3n0N6zXqKGYudK1xrsrXZdK1rjU2_o64RZxHHhghLtgXQQ7MpVR-HosIJcu-nxZDJgt2xvhXNS1CZIidO1u_2gMRg_iRJkkyeiNjj36SovZolKoSEFs0VgP4nPliAPQ3r5YgInVtXQar-qDGgoc45Vvi19M-d2zdqBjVpmcbiGau5CbL9Nk-UjBvMZS-35cqb2WnbNzGgEdxE7spgWe6VfVHWGgti-oXhy8O2kw7DCCGQlz02eZ-RVIIc34aZg__nz89cPv9zTNmrf-3dmicJ8mkljw4zh3aX0PYDy2deQ-HwwCiMGRzd_nA7erkIFOwlGasqqZe0U8ouhckRCw1IHe9UY4iUwjtI3hWeZ2zYsBzaCGwVCG-gBQL4MK_uYHwox744WPKJywM2xGb8eqiEKj8xFeLBUx8oi6VIUA6Y-M6j10pYihl7R1H4FT84wIUZpl5Pw5pomAAiHolUCzElVEPCaFx955lzJ7AZoliLuO26Fcj3ur-sZhp-as3ZyAgqyCrQaJbzGWo6bFhzl6i3qk7K6pUbdO57MBfn4trYSXywtkNJYaAsH13l-miS2_ACKeLnPz0p8vZ81NdKOwN9vwa5wz4279feW-vcNyST3v-Z7qr6L4v9aJvQgQ9Miyy-tZk_-8Cxmtf6n3Lockm1fvr-Y-1lrOo725wlDD9u8x01vgg6xYsHAUIXDTikfP1o4uMqPfqqwrkvtpaUZ6vT2Xd48TxBtnIFb8wTIjfMXhrqynYWQvYutQRladdr5xshh83TxyG7v2sRi-zDzFxZ9mCP9rfP5PO-3hlN1MnOJjNFwpapyc7sxF7w6QSZwwOZRIBO6owmhhjIYATdeTO3EgP--oXmjtIPaCq2IAR3xjPCtww6BY04ye-g5tK5MWFfXXF-iGnj7Qqrp9Y7gFrMejZyj6s4eZRDb4o8-5BB3E114Sh_F4r_9iGI3ITKQLmkaC3DcJQ3_xnx7kGGSzCPytGTQBfDgwwF-Hm2OZAJ1zjlBfO3zV_O__wFK6qi2WgYAAA==.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLUNBTkFEQS1DRU5UUkFMLUItUFJJTUFSWS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImV4cCI6MTczOTk4Mjk0NCwiYWxsb3dBY2Nlc3NPdmVyUHVibGljSW50ZXJuZXQiOnRydWV9",
//             tokenType: models.TokenType.Embed, // Use models.TokenType.Aad for SaaS embed
//             settings: {
//               panes: {
//                 filters: {
//                   expanded: false,
//                   visible: false,
//                 },
//               },
//               background: models.BackgroundType.Default,
//             },
//           }}
//           eventHandlers={
//             new Map([
//               [
//                 "loaded",
//                 function () {
//                   console.log("Report loaded");
//                 },
//               ],
//               [
//                 "rendered",
//                 function () {
//                   console.log("Report rendered");
//                 },
//               ],
//               [
//                 "error",
//                 function (event) {
//                   console.log(event.detail);
//                 },
//               ],
//               ["visualClicked", () => console.log("visual clicked")],
//               ["pageChanged", (event) => console.log(event)],
//             ])
//           }
//           cssClassName={"home-report"}
//           getEmbeddedComponent={(embeddedReport) => {
//             window.report = embeddedReport;
//           }}
//         />
//       </main>
//     </div>
//   );
// };

// export default HomePage;

//my current homepage

// import React, { useState, useEffect, useRef } from "react";
// import { Link, useLocation } from "react-router-dom";
// import "./HomePage.css";
// import { PowerBIEmbed } from "powerbi-client-react";
// import { models } from "powerbi-client";
// import { FaPlus, FaMinus } from "react-icons/fa";
// import Header from "../../components/Header/Header";
// import axios from "axios";

// const reports = {
//   homepage: {
//     id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
//     embedUrl:
//       "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
//     pageId: "42339bb3bbdb295ed7c8",
//   },
//   growth: {
//     id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
//     embedUrl:
//       "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
//     pageId: "34c6fffab0536014a095",
//   },
//   adoption: {
//     id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
//     embedUrl:
//       "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
//     pageId: "8e9801e82496355a41ee",
//   },
//   engagement: {
//     id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
//     embedUrl:
//       "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
//     pageId: "1a80fca4b9d06e022019",
//   },
//   feedback: {
//     id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
//     embedUrl:
//       "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
//     pageId: "2bc6242386de992b4428",
//   },
//   healthscore: {
//     id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
//     embedUrl:
//       "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
//     pageId: "42339bb3bbdb295ed7c8",
//   },
// };

// const HomePage = () => {
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [embedToken, setEmbedToken] = useState(null);
//   const location = useLocation();

//   // Fetching Power BI embed token
//   useEffect(() => {
//     const fetchEmbedToken = async () => {
//       try {
//         const response = await axios.get("https://on-xperience.vercel.app/api");
//         setEmbedToken(response.data.embedToken);
//       } catch (error) {
//         console.error("Error fetching embed token:", error);
//       }
//     };
//     fetchEmbedToken();
//   }, []);

//   const toggleSection = (section, event) => {
//     event.stopPropagation();
//     setExpandedSection((prev) => (prev === section ? null : section));
//   };

//   const currentRoute = location.pathname.split("/")[1];
//   const currentReport = reports[currentRoute] || reports.homepage;

//   return (
//     <div className="homepage-container">
//       <Header />
//       <div className="content">
//         <aside className="sidebar">
//           <nav className="nav-menu">
//             <ul className="tree-menu">
//               <li>
//                 <span
//                   className="expand-icon"
//                   onClick={(e) => toggleSection("healthScore", e)}
//                   style={{ float: "right" }}
//                 >
//                   {expandedSection === "healthScore" ? <FaMinus /> : <FaPlus />}
//                 </span>
//                 <Link to="/healthscore"> Health Score</Link>
//                 {expandedSection === "healthScore" && (
//                   <ul
//                     className="submenu expanded"
//                     style={{ display: "block", border: "none" }}
//                   >
//                     <li>
//                       <Link to="/growth">Growth</Link>
//                     </li>
//                     <li>
//                       <Link to="/adoption">Adoption</Link>
//                     </li>
//                     <li>
//                       <Link to="/engagement">Engagement</Link>
//                     </li>
//                     <li>
//                       <Link to="/feedback">Feedback</Link>
//                     </li>
//                   </ul>
//                 )}
//               </li>
//               <li>
//                 <span
//                   className="expand-icon"
//                   onClick={(e) => toggleSection("renewals", e)}
//                   style={{ float: "right" }}
//                 >
//                   {expandedSection === "renewals" ? <FaMinus /> : <FaPlus />}
//                 </span>
//                 <Link to="/renewals">Renewals</Link>
//                 {expandedSection === "renewals" && (
//                   <ul className="submenu expanded">
//                     <li>Dummy Page</li>
//                   </ul>
//                 )}
//               </li>
//               <li>
//                 <span
//                   className="expand-icon"
//                   onClick={(e) => toggleSection("financials", e)}
//                   style={{ float: "right" }}
//                 >
//                   {expandedSection === "financials" ? <FaMinus /> : <FaPlus />}
//                 </span>
//                 <Link to="/financials">Financials</Link>
//                 {expandedSection === "financials" && (
//                   <ul className="submenu expanded">
//                     <li>Dummy Page</li>
//                   </ul>
//                 )}
//               </li>
//               <li>
//                 <Link to="/statistics">Statistics</Link>
//               </li>
//             </ul>
//             <ul className="tree-menu bottom-links">
//               <li>
//                 <Link to="/settings">Settings</Link>
//               </li>
//               <li>
//                 <Link to="/help">Help</Link>
//               </li>
//             </ul>
//           </nav>
//         </aside>

//         <main className="report-container">
//           {embedToken ? (
//             <PowerBIEmbed
//               embedConfig={{
//                 type: "report",
//                 id: currentReport.id,
//                 embedUrl: currentReport.embedUrl,
//                 accessToken: embedToken,
//                 tokenType: models.TokenType.Embed,
//                 settings: {
//                   panes: { filters: { expanded: false, visible: false } },
//                   background: models.BackgroundType.Default,
//                   navContentPaneEnabled: false,
//                 },
//                 pageName: currentReport.pageId,
//               }}
//               cssClassName="home-report"
//               key={location.pathname}
//             />
//           ) : (
//             <p>Loading Power BI report...</p>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default HomePage;

//code with modal

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./HomePage.css";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import { FaPlus, FaMinus } from "react-icons/fa";
import Header from "../../components/Header/Header";
import axios from "axios";

// Popup component for editing licenses
const LicensePopup = ({ onClose, onSubmit, columnName, currentValue }) => {
  const [value, setValue] = useState(currentValue || "");

  const handleSubmit = () => {
    onSubmit(parseInt(value, 10) || 0);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Edit {columnName}</h3>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="0"
          step="1"
        />
        <div className="popup-buttons">
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Define reports and their embed configuration
const reports = {
  homepage: {
    id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
    pageId: "42339bb3bbdb295ed7c8",
  },
  growth: {
    id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
    pageId: "34c6fffab0536014a095",
  },
  adoption: {
    id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
    pageId: "8e9801e82496355a41ee",
  },
  engagement: {
    id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
    pageId: "1a80fca4b9d06e022019",
  },
  feedback: {
    id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
    pageId: "2bc6242386de992b4428",
  },
  healthscore: {
    id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
    pageId: "42339bb3bbdb295ed7c8",
  },
};

const HomePage = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [embedToken, setEmbedToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({
    columnName: "",
    currentValue: null,
    dataPoint: null,
  });
  const reportRef = useRef(null);
  const location = useLocation();

  // Fetch embed token
  useEffect(() => {
    const fetchEmbedToken = async () => {
      try {
        const response = await axios.get("https://on-xperience.vercel.app/api");
        setEmbedToken(response.data.embedToken);
      } catch (error) {
        console.error("Error fetching embed token:", error);
      }
    };
    fetchEmbedToken();
  }, []);

  const handleVisualClick = (event) => {
    console.log("visualClicked event:", event);

    // Check if 'detail' exists and has the required properties
    if (event.detail && event.detail.visual) {
      const dataPoints = event.detail.visual.dataPoints;
      console.log("dataPoints:", dataPoints);

      if (dataPoints && dataPoints.length > 0) {
        const dataPoint = dataPoints[0];
        const identities = dataPoint.identity;

        if (identities && identities.length > 0) {
          const column = identities[0].equals?.toString() || "";

          if (
            column.includes("Licenses Used") ||
            column.includes("Licenses Purchased")
          ) {
            setPopupData({
              columnName: column.includes("Licenses used")
                ? "Licenses Used"
                : "Licenses Purchased",
              currentValue: dataPoint.value,
              dataPoint: dataPoint,
            });
            setShowPopup(true);
          }
        }
      }
    }
  };

  // On report loaded, setup event listener for visual clicks
  const handleReportLoaded = async () => {
    console.log("Report loaded!");
    try {
      const report = reportRef.current;
      if (report && typeof report.on === "function") {
        report.off("visualClicked"); // Remove any existing listeners
        report.on("visualClicked", handleVisualClick); // Add the new listener
        console.log("visualClicked event wired!");
      }
    } catch (error) {
      console.error("Error setting up visualClicked handler:", error);
    }
  };

  const toggleSection = (section, event) => {
    event.stopPropagation();
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const handlePopupSubmit = (newValue) => {
    console.log(`Updating ${popupData.columnName} to ${newValue}`);
    setShowPopup(false);
    // Add backend update logic here
  };

  const currentRoute = location.pathname.split("/")[1];
  const currentReport = reports[currentRoute] || reports.homepage;

  return (
    <div className="homepage-container">
      <Header />
      <div className="content">
        <aside className="sidebar">
          <nav className="nav-menu">
            <ul className="tree-menu">
              <li>
                <span
                  className="expand-icon"
                  onClick={(e) => toggleSection("healthScore", e)}
                  style={{ float: "right" }}
                >
                  {expandedSection === "healthScore" ? <FaMinus /> : <FaPlus />}
                </span>
                <Link to="/healthscore">Health Score</Link>
                {expandedSection === "healthScore" && (
                  <ul
                    className="submenu expanded"
                    style={{ display: "block", border: "none" }}
                  >
                    <li>
                      <Link to="/growth">Growth</Link>
                    </li>
                    <li>
                      <Link to="/adoption">Adoption</Link>
                    </li>
                    <li>
                      <Link to="/engagement">Engagement</Link>
                    </li>
                    <li>
                      <Link to="/feedback">Feedback</Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <span
                  className="expand-icon"
                  onClick={(e) => toggleSection("renewals", e)}
                  style={{ float: "right" }}
                >
                  {expandedSection === "renewals" ? <FaMinus /> : <FaPlus />}
                </span>
                <Link to="/renewals">Renewals</Link>
                {expandedSection === "renewals" && (
                  <ul className="submenu expanded">
                    <li>Dummy Page</li>
                  </ul>
                )}
              </li>
              <li>
                <span
                  className="expand-icon"
                  onClick={(e) => toggleSection("financials", e)}
                  style={{ float: "right" }}
                >
                  {expandedSection === "financials" ? <FaMinus /> : <FaPlus />}
                </span>
                <Link to="/financials">Financials</Link>
                {expandedSection === "financials" && (
                  <ul className="submenu expanded">
                    <li>Dummy Page</li>
                  </ul>
                )}
              </li>
              <li>
                <Link to="/statistics">Statistics</Link>
              </li>
            </ul>
            <ul className="tree-menu bottom-links">
              <li>
                <Link to="/settings">Settings</Link>
              </li>
              <li>
                <Link to="/help">Help</Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="report-container">
          {embedToken ? (
            <>
              <PowerBIEmbed
                embedConfig={{
                  type: "report",
                  id: currentReport.id,
                  embedUrl: currentReport.embedUrl,
                  accessToken: embedToken,
                  tokenType: models.TokenType.Embed,
                  settings: {
                    panes: { filters: { expanded: false, visible: false } },
                    background: models.BackgroundType.Default,
                    navContentPaneEnabled: false,
                  },
                  pageName: currentReport.pageId,
                }}
                cssClassName="home-report"
                key={location.pathname}
                ref={reportRef}
                onLoad={handleReportLoaded}
                getEmbeddedComponent={(embeddedReport) => {
                  reportRef.current = embeddedReport;
                  console.log("Power BI embedded!");
                  embeddedReport.off("visualClicked");
                  embeddedReport.on("visualClicked", handleVisualClick);
                  console.log("visualClicked event wired!");
                }}
              />
              {showPopup && (
                <LicensePopup
                  onClose={() => setShowPopup(false)}
                  onSubmit={handlePopupSubmit}
                  columnName={popupData.columnName}
                  currentValue={popupData.currentValue}
                />
              )}
            </>
          ) : (
            <p>Loading Power BI report...</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
