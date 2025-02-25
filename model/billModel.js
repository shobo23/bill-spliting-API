const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  billName: String,
  totalAmount: Number,
  date: { type: Date, default: Date.now },
  participants: [
    {
      name: String,
      amountOwed: Number,
      amountPaid: { type: Number, default: 0 },
    },
  ],
});

const Bill = mongoose.model("Bill", BillSchema);

module.exports = Bill;
