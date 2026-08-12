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

app.get("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const task = tasks.find((t) => t.id === id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json(task);
})

app.post("/api/tasks", (req, res) => {
    const {text, category } = req.body;

    if (!text) {
        return res.status(400).json({
            error: "Text is required"
        });
    }

    const task = {
        id: nextId++,
        text: text,
        done: false,
        category: category || "personal"
    };

    tasks.push(task);

    res.status(201).json(task);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});