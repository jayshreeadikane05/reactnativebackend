var express = require("express");
var router = express.Router();
const vechicalDetailsController = require("../controllers/vechicalDetailsController");


router.post('/vechical', vechicalDetailsController.addVehicle);



router.get("/test", (req, res) => {
    console.log("Test route hit");
    res.send("Test route works!");
});

module.exports = router;