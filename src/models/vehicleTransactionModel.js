var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var vehicleTransactionSchema = new mongoose.Schema(
  {
    vehicle: {
      type: Schema.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    customer: {
      type: Schema.ObjectId,
      ref: "Customer",
      required: true,
    },
    totalAmount: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "approved_finance"],
      required: true,
    },
    paidAmount: {
      type: String,
      required: function () {
        return this.paymentMethod === "cash";
      },
    },
    remainingAmount: {
      type: String,
      required: true,
    },
    financeDetails: {
      financeName: {
        type: String,
        required: function () {
          return this.paymentMethod === "approved_finance";
        },
      },
      approvedLoanPercentage: {
        type: Number,
        required: function () {
          return this.paymentMethod === "approved_finance";
        },
      },
    },
    manualDocuments: {
      type: [String],
    },
    insurancePaidAmount: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VehicleTransaction", vehicleTransactionSchema);
