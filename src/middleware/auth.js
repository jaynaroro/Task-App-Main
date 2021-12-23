const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      //trigger the catch error below
      throw new Error();
    }

    //create a variable for the user and token defined above, these variables can then be accessed by the route handler from this auth function , instead of having to define the process again in the route handler
    //
    //using the statement req.user..... adds the property 'user' to the request argument.....
    req.token = token;
    req.user = user;

    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

//expost the function to be used outside
module.exports = auth;
