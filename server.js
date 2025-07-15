const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "dist")));

// Handle all routes by serving the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`KNOUX FINDR server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});
