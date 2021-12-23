const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!')
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

//const Task = require("../src/models/task");
//const User = require("../src/models/user");

//const main = async () => {
//const task = await Task.findById("619cdd50adbcb4988aa30de2");
//async populate method allows us to populate the onwer field with more data with the help of the ref property in the task model
//no need to add exec.populate
//await task.populate("owner");
//console.log(task.owner);
//
//const user = await User.findById("619b2c9ae087b9aeaa3e90bc");
//await user.populate("tasks");
//console.log(user.tasks);
//};

//main();

//MESSNG AROUND WITH MULTER -- FILE UPLOADS///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*

//import the lib
const multer = require("multer");

//specified an instance of the multer lib. and specified a destination option in the options object
const upload = multer({
  dest: "images",
});

//use the instance and available methods as middleware in the request router
app.post("/uploads", upload.single("upload"), (req, res) => {
  res.send();
});

*/
