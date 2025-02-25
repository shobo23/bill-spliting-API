const Express = require("express");
const {
  createBill,
  addParticipant,
  getAllBills,
  getABill,
  updateBill,
  deleteABill,
  updateParticipants,
  splitBill,
  CheckOwedAmount,
  PaidParticipant,
  trackOverpayments,
  ParticipantWhoPaidMost,
  totalAmountPaid,
} = require("../controller/billController");
const route = Express.Router();

// create bill
route.post("/createBill", createBill);

// add perticipant
route.post("/addParticipants/:id", addParticipant);

// all bills
route.get("/allBills", getAllBills);

// get A bill
route.get("/getABill/:id", getABill);

// update bill
route.patch("/updateBill/:id", updateBill);

// update participant of an specific bill
route.patch("/bills/:id/participants/:partId", updateParticipants);

// delete a bill
route.delete("/deleteABill/:id", deleteABill);

// split bills
route.patch("/splitbills/:id", splitBill)

// get amount remaining
route.get("/remainingAmount/:id", CheckOwedAmount)

// get participant who has full paid
route.get("/fullPaid/:id", PaidParticipant)

// get participants that over paid
route.get("/overpaidParticipant/:id", trackOverpayments)

// get highest paid participant
route.get("/higestPaid/:id", ParticipantWhoPaidMost)

// get total amount paid
route.get("/totalAmountPaid/:id", totalAmountPaid)


module.exports = route;
