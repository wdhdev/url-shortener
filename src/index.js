const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

const port = process.env.port || 3000;
const router = require("./util/router");

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Host public files
app.use(express.static(__dirname + "/public", {
    extensions: ["html"]
}))

// Connect to Database
const database = require("./util/database");
database();

// Router
app.use("/", router);

app.listen(port, () => {
    console.log(`Listening on Port: ${port}`);
})