const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    desc: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },

  //add an options object to the schema,
  //timestamp options is off by default
  {
    timestamps: true,
  }
);

const Task = new mongoose.model("Task", taskSchema);

module.exports = Task;
