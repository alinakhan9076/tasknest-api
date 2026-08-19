const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Task = require("./models/Task");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

dotenv.config();
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to MongoDB");
})

.catch((error) => {
    console.error("MongDB connection failed:", error);
});

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req,res) => {
    res.json({status: "ok"});
});

app.get("/api/tasks", async (req,res) => {
    try {
        const tasks = await Task.find();

        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch tasks",
        });
    }
   
});

app.get("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: "Task not found",
            });
        }

        res.json(task);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                error: "Invalid task id",
            });
        }
    
        res.status(500).json({
            error: "Failed to fetch task",
        });
    }
})

app.post("/api/tasks", async (req, res) => {
    try {
        const task = await Task.create(req.body);

        res.status(201).json(task);
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                error: error.message,
            });
        }
        res.status(500).json({
            error: "Failed to create task",
        });
    }
});

app.put("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!task) {
            return res.status(404).json({
                error: "Task not found",
            });
        }

        res.json(task);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                error: "Invalid task id",
            });
        }
        
        if (error.name === "ValidationError") {
            return res.status(400).json({
                error: error.message,
            })
        }
        res.status(500).json({
            error: "Failed to update task",
        });
    }
});

app.delete("/api/tasks/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: "Task not found",
            });
        }

        res.json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                error: "Invalid task id",
            });
        }
        res.status(500).json({
            error: "Failed to delete task",
        });
    }
});

app.post("/api/auth/register", async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                error: "Email already registered",
            });
        }

        const user = await User.create({
            email, password,
        });

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("REGISTER ERROR", error);
        res.status(500).json({
            error: "Failed to register user",
        });
    }
});


app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d"}
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to login",
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});