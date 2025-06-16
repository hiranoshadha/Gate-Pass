const Status = require("../models/Status"); 

// Create a new status
const createStatus = async (req, res) => {
  try {
    const { referenceNumber, comment, beforeStatus, afterStatus, request } = req.body;
    const newStatus = new Status({
      referenceNumber,
      comment,
      beforeStatus,
      afterStatus,
      request,
    });

    await newStatus.save();
    res
      .status(201)
      .json({ message: "Status created successfully", status: newStatus });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getPending = async (req, res) => {
  const serviceNo  = req.params.id;
  
  try {
    const pendingStatuses = await Status.find({ executiveOfficerStatus: 1 })
      .populate('request')
      .exec();

    const filteredPending = pendingStatuses.filter(status => status.request?.executiveOfficerServiceNo === serviceNo);
   
    
    res.status(200).json(filteredPending);
  } catch (error) {
    console.error("Error fetching pending statuses:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getApproved = async (req, res) => {
  try {
    const approvedRequests = await Status.find({ executiveOfficerStatus: 2 })
      .populate('request')
      .exec();

    res.status(200).json(approvedRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRejected = async (req, res) => {
  try {
    const rejectedRequests = await Status.find({ executiveOfficerStatus: 3 })
    .populate('request')
    .exec();
    res.status(200).json(rejectedRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateApproved = async (req, res) => {
  try {
    const { comment } = req.body;
    const { referenceNumber } = req.params;

    // Update existing status
    const updatedStatus = await Status.findOneAndUpdate(
      { referenceNumber, executiveOfficerStatus: 1 },
      {
        // afterStatus: 2,
        // comment,
        executiveOfficerStatus: 2,
        executiveOfficerComment: comment,
        verifyOfficerStatus: 1,
      },
      { new: true }
    ).populate("request");

    if (!updatedStatus)
      return res.status(404).json({ message: "Status not found" });

    if (updatedStatus.request) {
      updatedStatus.request.status = 4;
      await updatedStatus.request.save();
    }

    // const newStatus = new Status({
    //   referenceNumber,
    //   request: updatedStatus.request._id,
    //   beforeStatus: 4,
    // });
    // await newStatus.save();


     res.status(200).json({ updatedStatus });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const updateRejected = async (req, res) => {
  try {
    const {comment} = req.body;
    const updatedStatus = await Status.findOneAndUpdate(
      { referenceNumber: req.params.referenceNumber, executiveOfficerStatus: 1},
      {
        // afterStatus: 3,
        // comment: comment,
        executiveOfficerStatus: 3,
        executiveOfficerComment: comment, 
      },
      { new: true }
    ).populate("request");
    if (!updatedStatus)
      return res.status(404).json({ message: "Status not found" }); 

    if (updatedStatus.request){
      updatedStatus.request.status = 3;
      await updatedStatus.request.save();
    }

    res.status(200).json(updatedStatus);
  }catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  createStatus,
  getPending,
  getApproved,
  getRejected,
  updateApproved,
  updateRejected,
};