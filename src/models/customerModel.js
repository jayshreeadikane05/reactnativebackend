var mongoose = require("mongoose");

var customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    personalDocuments: {
      aadhar: { type: String, required: true },
      pan: { type: String, required: true },
      document7x12: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
