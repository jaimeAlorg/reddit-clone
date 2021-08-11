const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
const port = 8080;

app.use(cors());

const api = require("./routes/index");
app.use("/api", api);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
