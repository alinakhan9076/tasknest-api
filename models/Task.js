const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    done: {
        type: Boolean,
        default: false
    },

    category: {
        type: String,
        enum: ["work", "personal", "study"],
        default: "personal"
    }
}, {
        timestamps: true
    });

    module.exports = mongoose.model("Task", taskSchema);