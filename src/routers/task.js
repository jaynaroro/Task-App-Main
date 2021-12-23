const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");

const router = new express.Router();

//CREATE TASK
//add authentication to the route with the auth file
router.post("/tasks", auth, async (req, res) => {
  //when taking the task body given in the request, collect the id of the person logged in as well, to setup the relationship with User
  const task = new Task({
    //the ES6 spread operator copies all the fields and properties from the req.body object into this new object
    ...req.body,
    //also specify what data the owner field should hold
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//FIND ALL TASKS// TWO WAYS TO DO THIS
//the first one is by using find, and filtering wit the property owner: req.user._id
/*
router.get("/tasks",auth, async (req, res) => {
  try {
    const tasks = await Task.find({owner: req.user._id});
    res.send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});
*/
//the other way, slightly longer, is to use the populate method, remember the virtual field we created in User
//
// the query statement thats going to be used is
// GET /tasks?completed=true/false
// method req.query allows this route to filter results using the query string provided
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  //first check if there is anything specified inside the req.query statement
  //meaning if nothing is specified, the output will be all the tasks
  if (req.query.completed) {
    //if that qeury statement is specified to true, then the match property is set as so
    match.completed = req.query.completed === "true";
  }
  //the only else statement is when the statement is stated as false.....
  //

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      //options allows us to setup support for pagination
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

//FIND TASKS BY ID

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    //for findiing by Id, use findOne to add an extra filtering methos, that is looking at the req.user._id
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//UPDATING TASKS

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["desc", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//DELETING TASK ROUTE/ ENDPOINT
//
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
