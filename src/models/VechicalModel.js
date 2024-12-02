const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
    {
        model: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        travelingPrice: {
            type: Number,
            required: true,
        },
        repairingPrice: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true, 
        },
        buyingOption: {
            type: String,
            required: true,
        },
        sellerDetails: {
            ownerName: {
                type: String,
            },
            ownerPhoneNumber: {
                type: String,
            },
            ownerAddress: {
                type: String,
            },
            bankName: {
                type: String,
            },
            financeOwnerName: {
                type: String,
            },
            financeOwnerPhoneNumber: {
                type: String,
            },
        },
        documents: {
            vehiclePhoto: {
                type: String,
                required: false,
            },
            rcBook: {
                type: String,
                required: false,
            },
            noc: {
                type: String,
                required: false,
            },
        },
        status: {
            type: Number,
            required: true,
            enum: [0, 1], // 0 for buy, 1 for sold
            default: 0,  // Default to 0 (available for purchase)
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
