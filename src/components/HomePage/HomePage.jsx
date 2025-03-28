// import React from "react";
// import { useMsal } from "@azure/msal-react";
// import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
// import Logo from "../Assets/logo.png"; // Adjust path as needed
// import "./HomePage.css"; // Add CSS for styling
// import { PowerBIEmbed } from "powerbi-client-react"; // Add PowerBi report to home page
// import { models } from "powerbi-client";

// const HomePage = () => {
//   const { instance } = useMsal();
//   const navigate = useNavigate(); // Initialize navigate
//   const activeAccount = instance.getActiveAccount();

//   const handleLogout = () => {
//     instance.logoutRedirect({
//       postLogoutRedirectUri: window.location.origin, // Redirect to home page after logout
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
//             type: "report", // Supported types: report, dashboard, tile, visual, qna, paginated report and create
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

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./HomePage.css";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import { FaPlus, FaMinus } from "react-icons/fa";
import Header from "../../components/Header/Header";
import axios from "axios";

// Reports configuration
const reports = {
  homepage: {
    id: "b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431",
    embedUrl:
      "https://app.powerbi.com/reportEmbed?reportId=b31ca3d5-b9e5-4aee-bf94-e94ed5fa2431&groupId=599772eb-f174-4a90-8ff5-5023a4b7f72a",
    pageId: "3e32d72242a124759baf", // Home page ID
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
    pageId: "8e9801e82496355a41ee", // Adoption page ID
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
  const location = useLocation();

  // Fetch Power BI embed token
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

  const toggleSection = (section, event) => {
    event.stopPropagation();
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // Get the correct report based on the route
  const currentRoute = location.pathname.split("/")[1]; // Extract first segment
  const currentReport = reports[currentRoute] || reports.homepage; // Default to homepage if not found

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
                <Link to="/healthscore"> Health Score</Link>
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
                pageName: currentReport.pageId, // Set page when embedding
              }}
              cssClassName="home-report"
              key={location.pathname} // Forces re-render on navigation
            />
          ) : (
            <p>Loading Power BI report...</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;

//changing the page for search functionality....

// import React, { useState, useEffect, useRef } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { PowerBIEmbed } from "powerbi-client-react";
// import { models } from "powerbi-client";
// import { FaPlus, FaMinus } from "react-icons/fa";
// import Header from "../../components/Header/Header";
// import axios from "axios";

// // Reports configuration
// const reports = {
//   homepage: {
//     /* ... your homepage config ... */
//   },
//   growth: {
//     /* ... your growth config ... */
//   },
//   adoption: {
//     /* ... your adoption config ... */
//   },
// };

// const HomePage = () => {
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [embedToken, setEmbedToken] = useState(null);
//   const location = useLocation();
//   const powerBIRef = useRef(null);

//   const [searchColumn, setSearchColumn] = useState("");
//   const [searchText, setSearchText] = useState("");
//   const [availableColumns, setAvailableColumns] = useState([]);

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

//   // Fetch column names dynamically
//   useEffect(() => {
//     const fetchColumns = async () => {
//       try {
//         const report = powerBIRef.current;
//         if (!report) return;

//         const pages = await report.getPages();
//         if (!pages.length) return;

//         const datasetInfo = await report.getDataset();
//         const tables = datasetInfo.tables;
//         const subscriptionsTable = tables.find(
//           (table) => table.name === "subscriptions"
//         );

//         if (subscriptionsTable) {
//           const columns = subscriptionsTable.columns.map((col) => col.name);
//           setAvailableColumns(columns);
//         } else {
//           console.warn("Table 'subscriptions' not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching columns:", error);
//       }
//     };

//     fetchColumns();
//   }, [embedToken]);

//   const toggleSection = (section, event) => {
//     event.stopPropagation();
//     setExpandedSection((prev) => (prev === section ? null : section));
//   };

//   const currentRoute = location.pathname.split("/")[1];
//   const currentReport = reports[currentRoute] || reports.homepage;

//   const handleSearch = async () => {
//     if (!searchColumn || !searchText) {
//       alert("Please select a column and enter a search term.");
//       return;
//     }

//     try {
//       const report = powerBIRef.current;
//       if (!report) {
//         console.error("Power BI report is not loaded yet.");
//         return;
//       }

//       const filter = {
//         $schema: "http://powerbi.com/product/schema#basic",
//         target: {
//           table: "subscriptions",
//           column: searchColumn,
//         },
//         operator: "Contains",
//         values: [searchText],
//       };

//       await report.setFilters([filter]);
//       console.log(`Applied filter: ${searchColumn} contains "${searchText}"`);
//     } catch (error) {
//       console.error("Error applying filter:", error);
//     }
//   };

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
//                   </ul>
//                 )}
//               </li>
//             </ul>
//           </nav>
//         </aside>

//         <main className="report-container">
//           {(currentRoute === "growth" || currentRoute === "adoption") && (
//             <div className="search-container">
//               <select
//                 value={searchColumn}
//                 onChange={(e) => setSearchColumn(e.target.value)}
//               >
//                 <option value="">Select Column</option>
//                 {availableColumns.map((col) => (
//                   <option key={col} value={col}>
//                     {col}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="text"
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 placeholder="Enter search term"
//               />
//               <button onClick={handleSearch}>Search</button>
//             </div>
//           )}

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
//               eventHandlers={
//                 new Map([
//                   [
//                     "loaded",
//                     (event) => {
//                       console.log("Report Loaded");
//                       powerBIRef.current = event.detail;
//                     },
//                   ],
//                   ["rendered", () => console.log("Report Rendered")],
//                   [
//                     "error",
//                     (event) => console.error("Power BI Error:", event.detail),
//                   ],
//                 ])
//               }
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
