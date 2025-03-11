const fs = require("fs");
const path = require("path");

// Set the homepage value manually here
const homepage = "https://on-xperience.vercel.app";
//const homepage = "http://localhost:3000";

// Path to the build index.html
const buildIndexPath = path.join(__dirname, "build", "index.html");

// Read the index.html content
fs.readFile(buildIndexPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading index.html:", err);
    return;
  }

  // Only replace href paths in link and script tags, not meta tags
  const updatedData = data
    .replace(/href="\/([^"]+)"/g, `href="${homepage}/$1"`)
    .replace(/src="\/static/g, `src="${homepage}/static`);

  // Write the updated data back to index.html
  fs.writeFile(buildIndexPath, updatedData, "utf8", (err) => {
    if (err) {
      console.error("Error writing to index.html:", err);
    } else {
      console.log("Successfully updated index.html");
    }
  });
});
