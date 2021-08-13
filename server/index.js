const express = require("express");
const cors = require("cors");
const { json, urlencoded } = require("express");
const auth = require("./routes/auth");

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());

const port = 8080;

app.use("/auth", auth);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
