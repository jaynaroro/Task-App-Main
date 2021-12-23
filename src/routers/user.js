const User = require("../models/user");
const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const router = new express.Router();
const sharp = require("sharp");
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require("../emails/account");
//const Task = require('../models/task')

//USER CREATION ENDPOINT//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//UPLOAD AVATAR ROUTER////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//the path for the avatar/ profile pic is different since it is data of a different kind and not json like the rest
//

const upload = multer({
  limits: {
    fileSize: 1000000,
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload an image"));
    }
    //accept the given upload
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//DELETING USER AVATAR/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//VIEWING THE USER AVATAR by id
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send(e);
  }
});

//hypothetical Viewing your own user avatar
router.get("/users", auth, async (req, res) => {
  try {
    if (!req.user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(req.user.avatar);
  } catch (e) {
    res.status(404).send(e);
  }
});

//LOGIN ROUTER /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//USER LOGOUT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/users/logout", auth, async (req, res) => {
  try {
    //access the token that was used from the auth function.....remember the variable req.token = token
    req.user.tokens = req.user.tokens.filter((token) => {
      //remove the token that matches the req.token from the array //effectively loggin that token and user session out...
      return token.token !== req.token;
    });
    //save changes
    await req.user.save();
    //send 200 if okay okay
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

//LOGOUT USER FROM ALL SESSIONS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    //basically empty the entire array
    req.user.tokens = [];
    //save changes
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});
//VIEWING YOUR USER PROFILE FROM THE DATABASE ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//

router.get("/users/me", auth, async (req, res) => {
  //remember the user property created from the auth function.....yay!!
  res.send(req.user);
});

//UPDATING ENDPOINT//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
router.patch("/users/me", auth, async (req, res) => {
  //the updates variable contains the Object fields that the user wants to update, from the request body
  const updates = Object.keys(req.body);
  //set limitations to which fields can be updated
  const allowedUpdates = ["name", "email", "password", "age"];
  // clause to check if the two match
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    //change the user properties to what is specified in the request body
    updates.forEach((update) => (req.user[update] = req.body[update]));
    //save changes
    await req.user.save();
    //send back the updated user
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//dELETING ENDPOINT//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//

router.delete("/users/me", auth, async (req, res) => {
  try {
    sendCancellationEmail(req.user.email, req.user.name);
    await req.user.remove();
    //await Task.deleteMany({owner: req.user._id})
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
