const express = require("express");
const cors = require("cors");
const app = express();

const data = require("./data.json");

app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world all...");
});

app.get("/entriesData", (req, res) => {
  res.send({ entriesData: JSON.stringify(data) });
});

app.listen(3001, () => {
  console.log("running on port 3001");
});
