var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();
router.post('/login', AuthController.login);
router.post('/forgotpassword', AuthController.forgotPassword);
router.post('/verifyOTP', AuthController.verifyOTP);
router.post('/resetPassword', AuthController.resetPassword);

router.get("/test", (req, res) => {
    console.log("Test route hit");
    res.send("Test route works!");
});

module.exports = router;