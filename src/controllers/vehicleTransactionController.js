const Vehicle = require('../models/VechicalModel');
const Customer = require('../models/customerModel');
const apiResponse = require('../helpers/apiResponse');
const VehicleTransaction = require('../models/vehicleTransactionModel');


exports.createTransaction = [
    async (req, res) => {
      try {
        const {
          customerId,
          vehicleId,
          paidAmount,
          paymentMethod,
          financeDetails,
          manualDocuments,
          insurancePaidAmount,
        } = req.body;
  
        const vehicle = await Vehicle.findById(vehicleId);
        const customer = await Customer.findById(customerId);
  
        if (!vehicle || !customer) {
          return apiResponse.notFoundResponse(res, 'Customer or vehicle not found');
        }
        if (vehicle.status === 1) {
            return apiResponse.validationErrorWithData(
              res,
              'Vehicle is already sold out and cannot be purchased'
            );
          }
          
        let totalAmount = vehicle.price; 
        let remainingAmount = 0;
  
        if (paymentMethod === 'cash') {
          if (!paidAmount || paidAmount <= 0) {
            return apiResponse.validationErrorWithData(
              res,
              'Paid amount is required and should be greater than 0 for cash payment method'
            );
          }
          remainingAmount = totalAmount - paidAmount;
          if (remainingAmount < 0) remainingAmount = 0;
        }
        
        else if (paymentMethod === 'approved_finance') {
          if (!financeDetails || !financeDetails.approvedLoanPercentage) {
            return apiResponse.validationErrorWithData(
              res,
              'Finance details with approved loan percentage are required for approved_finance payment method'
            );
          }
  
          const loanPercentage = financeDetails.approvedLoanPercentage / 100;
          const loanAmount = totalAmount * loanPercentage;
  
          remainingAmount = totalAmount - paidAmount - loanAmount;
  
          if (remainingAmount < 0) remainingAmount = 0;
        }
  
        const newTransaction = new VehicleTransaction({
          vehicle: vehicle._id,
          customer: customer._id,
          totalAmount,
          paidAmount,
          remainingAmount,
          paymentMethod,
          financeDetails: paymentMethod === 'approved_finance' ? financeDetails : null,
          manualDocuments,
          insurancePaidAmount,
        });
  
        await newTransaction.save();
  
        vehicle.status = 1;
        await vehicle.save();
  
        return apiResponse.successResponseWithData(
          res,
          'Transaction created successfully and vehicle status updated to sold out',
          newTransaction
        );
      } catch (error) {
        console.error(error);
        return apiResponse.ErrorResponse(res, error.message);
      }
    },
  ];
  