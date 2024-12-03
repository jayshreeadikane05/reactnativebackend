const multer = require("multer");
const fs = require('fs');
const path = require('path');
const customerModel = require('../models/customerModel');
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


  exports.addCustomer = [
    upload.fields([
      { name: "aadhar", maxCount: 1 },
      { name: "pan", maxCount: 1 },
      { name: "document7x12", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const { name, mobile, address } = req.body; 
        const { aadhar, pan, document7x12 } = req.files;
  
        if (!name || !mobile || !address) {
          return apiResponse.validationErrorWithData(
            res,
            "Name, Mobile, and Address are required"
          );
        }
  
        if (!aadhar || !pan || !document7x12) {
          return apiResponse.validationErrorWithData(
            res,
            "All personal documents (Aadhar, PAN, 7x12 copy) are required"
          );
        }
  
        const customerData = {
          name,
          mobile,
          address,
          personalDocuments: {
            aadhar: aadhar[0].path, 
            pan: pan[0].path,     
            document7x12: document7x12[0].path,
          },
        };
  
        const newCustomer = new customerModel(customerData);
        await newCustomer.save();
  
        return apiResponse.successResponseWithData(
          res,
          "Customer added successfully",
          newCustomer
        );
      } catch (error) {
        console.error("Error adding customer:", error);
        return apiResponse.ErrorResponse(res, error.message);
      }
    },
  ];
  



  exports.getCustomerById = [
    async (req, res) => {
      try {
        const { id } = req.params;
        const customer = await customerModel.findById(id);
  
        if (!customer) {
          return apiResponse.notFoundResponse(res, 'Customer not found');
        }
  
        return apiResponse.successResponseWithData(
          res,
          'Customer retrieved successfully',
          customer
        );
      } catch (error) {
        console.error('Error retrieving customer by ID:', error);
        return apiResponse.ErrorResponse(res, error.message);
      }
    },
  ];


  exports.getAllCustomers = [
    async (req, res) => {
      try {
        const { name, page = 1, limit = 10 } = req.query; 
  
        const filters = {};
        if (name) {
          filters.name = { $regex: name, $options: "i" };
        }
  
        const skip = (page - 1) * limit; 
  
        const customers = await customerModel
          .find(filters)
          .skip(skip)
          .limit(Number(limit));
  
        const totalCount = await customerModel.countDocuments(filters);
  
        if (customers.length === 0) {
          return apiResponse.notFoundResponse(res, "No customers found");
        }
  
        return apiResponse.successResponseWithData(
          res,
          "Customers retrieved successfully",
          {
            customers,
            totalCount,
            currentPage: Number(page),
            totalPages: Math.ceil(totalCount / limit),
          }
        );
      } catch (error) {
        console.error("Error retrieving all customers:", error);
        return apiResponse.ErrorResponse(res, error.message);
      }
    },
  ];
  
  

  
  exports.updateCustomer = [
    upload.fields([
      { name: "aadhar", maxCount: 1 },
      { name: "pan", maxCount: 1 },
      { name: "document7x12", maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const { id } = req.params; // Customer ID from request parameters
        const { name, mobile, address } = req.body; // Customer data from request body
        const { aadhar, pan, document7x12 } = req.files || {}; // Files from request
  
        // Fetch existing customer to validate and merge documents
        const existingCustomer = await customerModel.findById(id);
        if (!existingCustomer) {
          return apiResponse.notFoundResponse(res, "Customer not found");
        }
  
        // Prepare updated data object
        const updatedData = {
          ...(name && { name }), // Update only if new name is provided
          ...(mobile && { mobile }), // Update only if new mobile is provided
          ...(address && { address }), // Update only if new address is provided
          personalDocuments: {
            ...existingCustomer.personalDocuments, // Merge existing documents
            ...(aadhar && { aadhar: aadhar[0].path }), // Update if new Aadhar is provided
            ...(pan && { pan: pan[0].path }), // Update if new PAN is provided
            ...(document7x12 && { document7x12: document7x12[0].path }), // Update if new 7x12 is provided
          },
        };
  
        // Save updated customer data in the database
        const updatedCustomer = await customerModel.findByIdAndUpdate(
          id,
          { $set: updatedData },
          { new: true, runValidators: true }
        );
  
        if (!updatedCustomer) {
          return apiResponse.notFoundResponse(res, "Customer not found");
        }
  
        return apiResponse.successResponseWithData(
          res,
          "Customer updated successfully",
          updatedCustomer
        );
      } catch (error) {
        console.error("Error updating customer:", error);
        return apiResponse.ErrorResponse(res, error.message);
      }
    },
  ];
  
  

  

  exports.deleteCustomer = [
    async (req, res) => {
      try {
        const { id } = req.params;
        const deletedCustomer = await customerModel.findByIdAndDelete(id);
  
        if (!deletedCustomer) {
          return apiResponse.notFoundResponse(res, 'Customer not found');
        }
  
        return apiResponse.successResponse(
          res,
          'Customer deleted successfully'
        );
      } catch (error) {
        console.error('Error deleting customer:', error);
        return apiResponse.ErrorResponse(res, error.message);
      }
    },
  ];