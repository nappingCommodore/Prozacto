const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user.model");
const express = require("express");
const router = express.Router();

router.get("/current", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  let user;
  if(req.body.email)
    user = await User.findOne({ email: req.body.email});
  else if(req.body.name)
    user = await User.findOne({ name: req.body.name});
  console.log("USER IS => ", user);
  if(!user) {
    res.status(401).send({"error": "username or Email is incorrect."})
  } else if (user) {
    let isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword) {
      res.status(401).send({"error": "password is incorrect."});
    } else {
      const token = user.generateAuthToken();
      res.header("x-auth-token", token).send({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }
  // user = new User({
  //   name: req.body.name,
  //   password: req.body.password,
  //   email: req.body.email,
  //   role: req.body.role,
  // });
  
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    role: req.body.role,
  });
  user.password = await bcrypt.hash(user.password, 10);
  await user.save();

  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

module.exports = router;