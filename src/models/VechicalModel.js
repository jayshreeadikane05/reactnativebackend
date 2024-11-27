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
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
