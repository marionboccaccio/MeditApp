const express = require("express"); // import express in this module
const router = new express.Router(); // create an app sub-module (router)

router.get("/studios", (req, res) => {
  res.render("studios");
});

module.exports = router;
