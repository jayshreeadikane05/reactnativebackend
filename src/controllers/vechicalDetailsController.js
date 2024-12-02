const multer = require("multer");
const fs = require('fs');
const path = require('path');
const Vehicle = require('../models/VechicalModel');
const apiResponse = require('../helpers/apiResponse');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); 
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
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
            const {
                model,
                price,
                travelingPrice,
                repairingPrice,
                totalPrice,
                buyingOption,
                sellerDetails, 
                status
            } = req.body;

            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            console.log('Files:', req.files);

            const vehiclePhoto = req.files['vehiclePhoto']?.[0]?.path || null;
            const rcBook = req.files['rcBook']?.[0]?.path || null;
            const noc = req.files['noc']?.[0]?.path || null;

            const parsedSellerDetails = sellerDetails ? JSON.parse(sellerDetails) : null;

            const newVehicle = new Vehicle({
                model,
                price,
                travelingPrice,
                repairingPrice,
                totalPrice,
                buyingOption,
                sellerDetails: parsedSellerDetails,
                documents: {
                    vehiclePhoto,
                    rcBook,
                    noc,
                },
                status: status !== undefined ? status : 0, 
            });

            const savedVehicle = await newVehicle.save();
            return apiResponse.successResponseWithData(res, 'Vehicle Added Successfully', savedVehicle);
        } catch (error) {
            console.error(error);
            return apiResponse.ErrorResponse(res, error.message);
        }
    },
];



exports.getByIdvechical =  [
 async (req,res) => {
    try {
        const { id } = req.params;  
        const vehicle = await Vehicle.findById(id); 
        if (!vehicle) {
            return apiResponse.notFoundResponse(res, 'Vehicle not found');
        }

        return apiResponse.successResponseWithData(res, 'Vehicle retrieved successfully', vehicle);
    } catch (error) {
        return apiResponse.ErrorResponse(res, error.message);
    }
 }   
];

exports.getAllVehicles = [
    async (req, res) => {
      try {
        const { page = 1, limit = 10, model, status } = req.query;
  
        const filters = {};
        if (model) filters.model = { $regex: model, $options: 'i' };
        if (status !== undefined) filters.status = status;
  
        const vehicles = await Vehicle.find(filters)
          .skip((page - 1) * limit)
          .limit(Number(limit));
  
        const totalCount = await Vehicle.countDocuments(filters);
  
        if (vehicles.length === 0) {
          return apiResponse.notFoundResponse(res, 'No vehicles found');
        }
  
        return apiResponse.successResponseWithData(
          res,
          'Vehicles retrieved successfully',
          { vehicles, totalCount }
        );
      } catch (error) {
        console.error(error);
        return apiResponse.ErrorResponse(res, error.message);
      }
    },
  ];
  

  exports.updateVehicles = [
  async (req, res) => {
    try {
      const { id } = req.params;  
      const { model, price, travelingPrice, repairingPrice, totalPrice, buyingOption, sellerDetails, status } = req.body;
      const { vehiclePhoto, rcBook, noc } = req.files || {};

      console.log('Request Body:', req.body);
      console.log('Files:', req.files);

      const updatedData = {
        model,
        price,
        travelingPrice,
        repairingPrice,
        totalPrice,
        buyingOption,
        sellerDetails: sellerDetails ? JSON.parse(sellerDetails) : undefined, 
        documents: {
          vehiclePhoto: vehiclePhoto ? vehiclePhoto[0].path : undefined,
          rcBook: rcBook ? rcBook[0].path : undefined,
          noc: noc ? noc[0].path : undefined,
        },
        status, 
      };

      Object.keys(updatedData).forEach((key) => {
        if (updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });

      if (updatedData.documents) {
        Object.keys(updatedData.documents).forEach((key) => {
          if (updatedData.documents[key] === undefined) {
            delete updatedData.documents[key];
          }
        });
      }

      console.log('Updated Data:', updatedData);

      const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updatedData, { new: true });

      if (!updatedVehicle) {
        return apiResponse.notFoundResponse(res, 'Vehicle not found');
      }

      console.log('Updated Vehicle:', updatedVehicle);

      return apiResponse.successResponseWithData(res, 'Vehicle updated successfully', updatedVehicle);
    } catch (error) {
      console.error(error);
      return apiResponse.ErrorResponse(res, error.message);
    }
  },
];
