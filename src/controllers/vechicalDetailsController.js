const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Vehicle = require('../models/VechicalModel');
const apiResponse = require('../helpers/apiResponse');


// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });



exports.addVehicle = [
    upload.fields([
        { name: 'vehiclePhoto', maxCount: 1 },
        { name: 'rcBook', maxCount: 1 },
        { name: 'noc', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { model, price, travelingPrice, repairingPrice, totalPrice, buyingOption, sellerDetails } = req.body;
            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            console.log('Files:', req.files);

            const vehiclePhoto = req.files['vehiclePhoto']?.[0]?.path || null;
            const rcBook = req.files['rcBook']?.[0]?.path || null;
            const noc = req.files['noc']?.[0]?.path || null;

            const newVehicle = new Vehicle({
                model,
                price,
                travelingPrice,
                repairingPrice,
                totalPrice,
                buyingOption,
                sellerDetails,
                documents: {
                    vehiclePhoto,
                    rcBook,
                    noc,
                }
            });

            const savedVehicle = await newVehicle.save();
            return apiResponse.successResponseWithData(res, 'Vehicle Added Successfully', savedVehicle);
        } catch (error) {
            console.error(error);
            return apiResponse.ErrorResponse(res, error.message);
        }
    },
];
