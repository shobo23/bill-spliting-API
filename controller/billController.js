const billModel = require("../model/billModel");

// error handler
const handleError = (res, error) => {
  return res.status(500).json({
    status: false,
    message: "An error occured",
    error: error.message || error.message,
  });
};

// Create a Bill – Make a new bill with a name, total amount, and a list of people sharing it.
const createBill = async (req, res) => {
  try {
    const { billName, totalAmount, participants } = req.body;

    const Bill = await billModel.create({
      billName,
      totalAmount,
      participants,
    });

    return res.status(201).json({
      status: true,
      message: "Bill created Successfully✔",
      data: Bill,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// add to perticipant with ID
const addParticipant = async (req, res) => {
  try {
    const id = req.params.id;

    const { name, amountOwed, amountPaid } = req.body;

    // check for empty fields
    if (!name || !amountOwed || !amountPaid) {
      res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    // find bill
    const Bill = await billModel.findById(id);
    if (!Bill) {
      res.status(404).json({ message: "bill not found" });
    }

    Bill.participants.push({ name, amountOwed, amountPaid });
    Bill.save();
    res.status(200).json({
      status: true,
      message: "perticipant added ✔",
      New_participants: Bill.participants,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get All Bills – Show all bills in the system.
const getAllBills = async (req, res) => {
  try {
    const allBills = await billModel.find();
    return res.status(201).json({ data: allBills });
  } catch (error) {
    handleError(res, error);
  }
};

// Get One Bill – Find and show the details of one bill by its ID.
const getABill = async (req, res) => {
  try {
    const Bill = await billModel.findById(req.params.id);
    if (Bill) {
      return res.status(200).json({ status: true, Bill });
    } else {
      return res
        .status(404)
        .json({ status: false, message: "Bill does not exist" });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// Update a Bill – Change the name, amount, or people in a bill.
const updateBill = async (req, res) => {
  try {
    const { billName, totalAmount } = req.body;
    const { id } = req.params;

    const Bill = await billModel.findByIdAndUpdate(
      id,
      {
        billName,
        totalAmount,
      },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Bill Updated successfully ✔", data: Bill });
  } catch (error) {
    handleError(res, error);
  }
};

// Update Participant
const updateParticipants = async (req, res) => {
  try {
    const { id, partId } = req.params;

    const Bill = await billModel.findById(id);
    if (!Bill) {
      return res.status(404).json({ status: false, message: "Bill not found" });
    }

    const participant = Bill.participants.id(partId);
    if (!participant) {
      return res
        .status(404)
        .json({ status: false, message: "Participant not found" });
    }

    const { name, amountOwed, amountPaid } = req.body;
    if (name) participant.name = name;
    if (amountOwed) participant.amountOwed = amountOwed;
    if (amountPaid) participant.amountPaid = amountPaid;

    await Bill.save();

    return res.status(200).json({
      status: true,
      message: "Participant updated successfully ✔",
      updatedParticipant: participant,
    });
  } catch (error) {
    handleError(res, error);
    console.error(error);
  }
};

// Delete a Bill – Remove a bill from the system.
const deleteABill = async (req, res) => {
  try {
    const { id } = req.params.id;
    const Bill = await billModel.findOneAndDelete(id);
    if (!Bill) {
      return res
        .status(404)
        .json({ status: false, message: "Bill does not exist" });
    }

    return res.status(200).json({ status: true, message: "Bill deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

// Split a Bill Equally – If no one sets how much they owe, divide the total amount equally for everyone
const splitBill = async (req, res) => {
  try {
    const { id } = req.params; // Fixed incorrect destructuring

    // Find the bill by ID
    const bill = await billModel.findById(id);
    if (!bill) {
      return res.status(404).json({ status: false, message: "Bill not found" });
    }

    // Get total participants
    const totalParticipants = bill.participants.length;
    if (totalParticipants === 0) {
      return res
        .status(400)
        .json({ status: false, message: "No participants found" });
    }

    // Calculate equal share
    const equalShare = bill.totalAmount / totalParticipants;

    // Update the amount owed to equla share
    bill.participants.forEach((participant) => {
      if (!participant.amountOwed || participant.amountOwed === 0) {
        participant.amountOwed = equalShare;
      }
    });
    await bill.save();

    return res.status(200).json({
      status: true,
      message: "Bill split equally among participants ✔",
      Splited_bill: bill,
    });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
};

// ⃣Check How Much Everyone Owes – Show how much each person still needs to pay
const CheckOwedAmount = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billModel.findById(id);
    if (!bill) {
      return res.status(404).json({ status: false, message: "Bill not found" });
    }

    // Calculation for how much each participant still owes
    const participantsOwed = bill.participants.map((participant) => ({
      name: participant.name,
      amountOwed: participant.amountOwed,
      amountPaid: participant.amountPaid,
      amountRemaining: participant.amountOwed - participant.amountPaid,
    }));

    return res.status(200).json({
      status: true,
      message: "Amount remaining are stated below",
      participantsOwed,
    });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
};

// Find People Who Have Paid in Full – Show a list of people who have paid everything they
const PaidParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billModel.findById(id);
    if (!bill) {
      return res.status(404).json({ status: false, message: "Bill not found" });
    }

    // Filter participants who have fully paid their owed amount
    const fullyPaidParticipants = bill.participants.filter(
      (participant) => participant.amountPaid >= participant.amountOwed
    );

    return res.status(200).json({
      status: true,
      message: "Fully paid participants are stated below",
      fullyPaidParticipants,
    });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
};

// Track Overpayments – If someone pays too much, show that they have overpaid.
const trackOverpayments = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billModel.findById(id);
    if (!bill) {
      return res.status(404).json({ status: false, message: "Bill not found" });
    }

    // Find participants who have overpaid
    const overpaidParticipants = bill.participants
      .filter((participant) => participant.amountPaid > participant.amountOwed)
      .map((participant) => ({
        name: participant.name,
        amountOwed: participant.amountOwed,
        amountPaid: participant.amountPaid,
        overpaidAmount: participant.amountPaid - participant.amountOwed,
      }));

    return res.status(200).json({
      status: true,
      message: "Participants who overpaid are stated belo",
      overpaidParticipants,
    });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
};

// Find the Person Who Paid the Most – Show the name of the person who has paid the most money.
const ParticipantWhoPaidMost = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billModel.findById(id);
    if (!bill) {
      return res.status(404).json({ status: false, message: "Bill not found" });
    }

    if (bill.participants.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "No participants found" });
    }

    // Find the participant who paid the most
    const topPayer = bill.participants.reduce((max, participant) =>
      participant.amountPaid > max.amountPaid ? participant : max
    );

    return res.status(200).json({
      status: true,
      message: "Participant who paid the most is",
      topPayer: {
        name: topPayer.name,
        amountPaid: topPayer.amountPaid,
      },
    });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
};

// Find Total Money Paid – Show how much money has been paid in total for a bill.
const totalAmountPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await billModel.findById(id);
    if (!bill) {
      return res.status(404).json({ status: false, message: "Bill not found" });
    }

    // Calculate total amount paid
    const totalPaid = bill.participants.reduce(
      (sum, participant) => sum + participant.amountPaid,
      0
    );

    return res.status(200).json({
      status: true,
      message: "Total amount paid is:",
      totalPaid,
    });
  } catch (error) {
    console.error(error);
    handleError(res, error);
  }
};

module.exports = {
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
};
