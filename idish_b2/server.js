const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConfig = require("./config/dbConfig");
const routes = require("./routes/routes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// CORS konfiguratsiyasi

app.use(cors()); // CORS middleware qo'shish

app.use(express.json());
app.use("/api", routes);

dbConfig();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
