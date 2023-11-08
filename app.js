// configuring environvenment variables
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// Parsing request body JSON data
app.use(bodyParser.json());

// if request does not matches any route 404 response sent
app.use("/", (req, res) => res.status(404).send({ message: "Path not found" }));

app.listen(3000);
