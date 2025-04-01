// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";
// import App from "./App";
// import reportWebVitals from "./reportWebVitals";
// import { MsalProvider } from "@azure/msal-react";
// import { PublicClientApplication } from "@azure/msal-browser";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import HomePage from "./components/HomePage/HomePage";
// import ContractView from "./components/ContractView/ContractView";

// const msalConfig = {
//   auth: {
//     clientId: "04ae1923-9fc9-4944-afa6-4c679be5c0e0",
//     authority:
//       "https://login.microsoftonline.com/d2637727-dad5-4caa-8aa6-d4cff6580e02",
//     redirectUri: "http://localhost:3000",
//   },
// };

// const pca = new PublicClientApplication(msalConfig);

// // Ensuring MSAL is initialized before rendering...
// pca.initialize().then(() => {
//   const root = ReactDOM.createRoot(document.getElementById("root"));

//   root.render(
//     <React.StrictMode>
//       <MsalProvider instance={pca}>
//         <Router>
//           <Routes>
//             <Route path="/" element={<App />} />
//             <Route path="/home" element={<HomePage />} />{" "}
//             <Route path="/contractview" element={<ContractView />} />
//             {/* Home page route */}
//           </Routes>
//         </Router>
//       </MsalProvider>
//     </React.StrictMode>
//   );
// });

// reportWebVitals();

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "04ae1923-9fc9-4944-afa6-4c679be5c0e0",
    authority:
      "https://login.microsoftonline.com/d2637727-dad5-4caa-8aa6-d4cff6580e02",
    redirectUri: "http://localhost:3000",
  },
};

const pca = new PublicClientApplication(msalConfig);

pca.initialize().then(() => {
  const root = ReactDOM.createRoot(document.getElementById("root"));

  root.render(
    <React.StrictMode>
      <MsalProvider instance={pca}>
        <App /> {/* ✅ No Router here, handled in App.js */}
      </MsalProvider>
    </React.StrictMode>
  );
});

reportWebVitals();
