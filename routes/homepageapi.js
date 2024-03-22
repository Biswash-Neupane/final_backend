// routes/homepageapi.js
const express = require("express");
const router = express.Router();
const { getHomeScreenData } = require("../controller/homepageapib");

router.get("/homeScreen", getHomeScreenData);

module.exports = router;
