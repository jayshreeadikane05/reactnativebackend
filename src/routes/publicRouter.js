var express = require("express");
const multer = require('multer');
var router = express.Router();

const vechicalDetailsController = require("../controllers/vechicalDetailsController");
const customerDetailsController = require("../controllers/customerDetailsController");
const vehicleTransactionController = require('../controllers/vehicleTransactionController');

const upload = multer({ dest: 'uploads/' });

//Vechical details Route
router.post('/vechical', vechicalDetailsController.addVehicle);
router.get('/vechical/:id', vechicalDetailsController.getByIdvechical);
router.get('/vechical', vechicalDetailsController.getAllVehicles);
router.put('/vechical/:id', upload.any(), vechicalDetailsController.updateVehicles);

//Customer details route
router.post('/customer', customerDetailsController.addCustomer);
router.get('/customer/:id', customerDetailsController.getCustomerById);
router.get('/customer', customerDetailsController.getAllCustomers);
router.put('/customer/:id', customerDetailsController.updateCustomer);

//vehical Transcation router
router.post('/transaction', vehicleTransactionController.createTransaction);


router.get("/test", (req, res) => {
    console.log("Test route hit");
    res.send("Test route works!");
});

module.exports = router;