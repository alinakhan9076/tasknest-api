const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

let tasks = [];
let nextId = 1;

app.get("/api/health", (req,res) => {
    res.json({status: "ok"});
});

app.get("/api/tasks", (req,res) => {
    res.json(tasks);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});