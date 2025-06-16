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
  try {
    const pendingStatuses = await Status.find({ recieveOfficerStatus: 1})
      .populate('request')
      .exec();
    
    res.status(200).json(pendingStatuses);
  } catch (error) {
    console.error("Error fetching pending statuses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getApproved = async (req, res) => {
  try {
    const approvedRequests = await Status.find({ recieveOfficerStatus: 2 })
      .populate('request')
      .exec();

    res.status(200).json(approvedRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRejected = async (req, res) => {
  try {
    const rejectedRequests = await Status.find({ recieveOfficerStatus: 3 })
    .populate('request')
    .exec();
    res.status(200).json(rejectedRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateApproved = async (req, res) => {
  try {
    const { comment, unloadingDetails, userServiceNumber, returnableItems } = req.body;
    const { referenceNumber } = req.params;

    
    
    // Update existing status
    const updatedStatus = await Status.findOneAndUpdate(
      { referenceNumber, beforeStatus: 10 },
      {
        recieveOfficerStatus: 2,
        recieveOfficerComment : comment,
        recieveOfficerServiceNumber : userServiceNumber,
      },
      { new: true }
    ).populate("request");

    if (!updatedStatus)
      return res.status(404).json({ message: "Status not found" });

    if (updatedStatus.request) {
      if (unloadingDetails) {
        updatedStatus.request.loading = {
          loadingType: 'Unloading',
          loadingLocation: unloadingDetails.unloadingLocation || updatedStatus.request.inLocation,
          loadingTime: new Date(),
          staffType: unloadingDetails.staffType,
          staffServiceNo: unloadingDetails.staffServiceNo,
          nonSLTStaffName: unloadingDetails.nonSLTStaffName,
          nonSLTStaffCompany: unloadingDetails.nonSLTStaffCompany,
          nonSLTStaffNIC: unloadingDetails.nonSLTStaffNIC,
          nonSLTStaffContact: unloadingDetails.nonSLTStaffContact,
          nonSLTStaffEmail: unloadingDetails.nonSLTStaffEmail
        };
      }

      if (returnableItems) {
        updatedStatus.request.returnableItems = returnableItems;
      }
      
      updatedStatus.request.status = 11;
      await updatedStatus.request.save();
    }

    // const newStatus = new Status({
    //   referenceNumber,
    //   request: updatedStatus.request._id,
    //   beforeStatus: 11,
    // });
    // await newStatus.save();


    res.status(200).json({ updatedStatus });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(400).json({ error: error.message });
  }
};


const updateRejected = async (req, res) => {
  try {
    const {comment} = req.body;
    const updatedStatus = await Status.findOneAndUpdate(
      { referenceNumber: req.params.referenceNumber},
      {
        recieveOfficerStatus : 3,
        recieveOfficerComment: comment, 
      },
      { new: true }
    ).populate("request");
    if (!updatedStatus)
      return res.status(404).json({ message: "Status not found" }); 

    if (updatedStatus.request){
      updatedStatus.request.status = 12;
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