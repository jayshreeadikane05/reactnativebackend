var express = require("express");
const multer = require('multer');
var router = express.Router();

const vechicalDetailsController = require("../controllers/vechicalDetailsController");
const upload = multer({ dest: 'uploads/' });

router.post('/vechical', vechicalDetailsController.addVehicle);
router.get('/vechical/:id', vechicalDetailsController.getByIdvechical);
router.get('/vechical', vechicalDetailsController.getAllVehicles);
router.put('/vechical/:id', upload.any(), vechicalDetailsController.updateVehicles);


router.get("/test", (req, res) => {
    console.log("Test route hit");
    res.send("Test route works!");
});

module.exports = router;