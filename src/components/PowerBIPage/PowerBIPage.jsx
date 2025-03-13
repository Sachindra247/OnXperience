import React, { useState, useEffect } from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import axios from "axios";
import Header from "../../components/Header/Header";
import "./PowerBIPage.css";

const PowerBIPage = ({ reportId, embedUrl, pageName }) => {
  const [embedToken, setEmbedToken] = useState(null);

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

  return (
    <div className="powerbi-page-container">
      <Header />
      <main className="powerbi-report-container">
        {embedToken ? (
          <PowerBIEmbed
            embedConfig={{
              type: "report",
              id: reportId,
              embedUrl: embedUrl,
              accessToken: embedToken,
              tokenType: models.TokenType.Embed,
              settings: {
                panes: {
                  filters: { expanded: false, visible: false },
                },
                background: models.BackgroundType.Default,
                navContentPaneEnabled: false, // Hides the page navigation tabs
              },
              pageName: pageName,
            }}
            eventHandlers={
              new Map([
                ["loaded", () => console.log("Report loaded")],
                ["rendered", () => console.log("Report rendered")],
                ["error", (event) => console.log(event.detail)],
              ])
            }
            cssClassName="powerbi-embed"
          />
        ) : (
          <p>Loading Power BI report...</p>
        )}
      </main>
    </div>
  );
};

export default PowerBIPage;
