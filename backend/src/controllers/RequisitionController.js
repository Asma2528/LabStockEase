const httpStatus = require('http-status');
const RequisitionService = require('../services/Requisition.service');
const CatchAsync = require('../utils/CatchAsync');

class RequisitionController {
  // Faculty (or chemistry user) creates a requisition
  static createRequisition = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
      console.error("User ID is missing in the request.");
      return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const requisitionData = { ...req.body, requested_by: userId };
    const newRequisition = await RequisitionService.createRequisition(requisitionData);

    return res.status(httpStatus.CREATED).json({ msg: 'Requisition created successfully', newRequisition });
  });

  // Faculty retrieves their own requisitions (optionally with search filters)
 static getUserRequisition = async (req, res, next) => {
    try {
      const userEmail = req.user.email; // Assuming the user is authenticated and their email is stored in req.user
      const searchParams = req.query;
      
      const requisitions = await RequisitionService.getUserRequisition(userEmail, searchParams);
      res.status(httpStatus.OK).json(requisitions);
    } catch (error) {
      next(error);
    }
  };
   
    // Faculty retrieves their own requisitions (optionally with search filters)
 static getUserReturnRequisition = async (req, res, next) => {
  try {
    const userEmail = req.user.email; // Assuming the user is authenticated and their email is stored in req.user
    const searchParams = req.query;
    
    const requisitions = await RequisitionService.getUserReturnRequisition(userEmail, searchParams);
    res.status(httpStatus.OK).json(requisitions);
  } catch (error) {
    next(error);
  }
};

  // Faculty updates their own requisition (only if status is Pending)
  static updateRequisition = CatchAsync(async (req, res) => {

    console.log('Request body:', req.body);
    
    const { id } = req.params;
    const updatedRequisition = await RequisitionService.updateRequisition(id, req.body, req.user.email);

    if (!updatedRequisition) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'Requisition not found or cannot be updated' });
    }
    return res.status(httpStatus.OK).json({ msg: 'Requisition updated successfully', updatedRequisition });
  });

  // Faculty deletes their own requisition (only if status is Pending)
  static deleteRequisition = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
      console.error("User ID is missing in the request.");
      return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const { id } = req.params;
    console.log("id: ", id);
    console.log("uid: ", userId);

    // Call the delete service method, passing the userId as requested_by
    const deletedRequisition = await RequisitionService.deleteRequisition(id, userId);

    if (!deletedRequisition) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'Requisition not found or cannot be deleted' });
    }

    return res.status(httpStatus.OK).json({ msg: 'Requisition deleted successfully' });
  });

  // Admin (or manager) retrieves all requisitions (with optional search filters)
  static getAllRequisitions = CatchAsync(async (req, res) => {
    const requisitions = await RequisitionService.getAllRequisitions(req.query);
    return res.status(httpStatus.OK).json({ requisitions });
  });

  // Admin approves a requisition – requires valid approved_at, approved_by, and an updated status (Approved/Rejected)
  static approveRequisition = CatchAsync(async (req, res) => {

    const approvedRequisition = await RequisitionService.approveRequisition(
      req.user.id,  // The ID of the admin performing the approval
      req.body      // All the data from the request body (status, remarks, etc.)
    );
  
    if (!approvedRequisition) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'Requisition not found or cannot be approved' });
    }
  
    return res.status(httpStatus.OK).json({
      msg: 'Requisition approved successfully',
      approvedRequisition,
    });
  });
  

  // Chemistry staff retrieves approved and issued requisitions with search functionality
  static getApprovedRequisitions = CatchAsync(async (req, res) => {
    const { requisition_code,
      project,
       date_of_requirement,
     requested_by } = req.query;
   
    const requisitions = await RequisitionService.getApprovedRequisitions({
      requisition_code,
     project,
      date_of_requirement,
    requested_by
    });

    return res.status(httpStatus.OK).json({ requisitions });
  });
// Controller: Change the status of a requisition to "Issued"
static changeStatusToIssued = CatchAsync(async (req, res) => {
  // Merge the URL parameter into the request body as _id.
  const updatedRequisition = await RequisitionService.changeStatusToIssued(
    { _id: req.params.id, ...req.body },
    req.user.id
  );
  return res.status(httpStatus.OK).json({ msg: 'Status updated to "Issued" successfully', updatedRequisition });
});

 // Chemistry staff retrieves approved and issued requisitions with search functionality
 static getApprovedandIssuedRequisitions = CatchAsync(async (req, res) => {
  const { requisition_code,
    project,
     date_of_requirement,
   requested_by } = req.query;
 
  const requisitions = await RequisitionService.getApprovedandIssuedRequisitions({
    requisition_code,
   project,
    date_of_requirement,
  requested_by
  });

  return res.status(httpStatus.OK).json({ requisitions });
});

  // Admin approves a requisition – requires valid approved_at, approved_by, and an updated status (Approved/Rejected)
  static approveRequisition = CatchAsync(async (req, res) => {

    const approvedRequisition = await RequisitionService.approveRequisition(
      req.user.id,  // The ID of the admin performing the approval
      req.body      // All the data from the request body (status, remarks, etc.)
    );
  
    if (!approvedRequisition) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'Requisition not found or cannot be approved' });
    }
  
    return res.status(httpStatus.OK).json({
      msg: 'Requisition approved successfully',
      approvedRequisition,
    });
  });


  
  // Admin approves a requisition – requires valid approved_at, approved_by, and an updated status (Approved/Rejected)
  static returnRequisition = CatchAsync(async (req, res) => {

    const returnRequisition = await RequisitionService.returnRequisition(

      req.body      // All the data from the request body (status, remarks, etc.)
    );
  
    if (!returnRequisition) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'Requisition not found or cannot be returned' });
    }
  
    return res.status(httpStatus.OK).json({
      msg: 'Requisition returned successfully',
      returnRequisition,
    });
  });


  // Retrieve return requisitions (where status === 'Return')
  static getReturnRequisitions = CatchAsync(async (req, res) => {
    const requisitions = await RequisitionService.getReturnRequisitions(req.query);
    return res.status(httpStatus.OK).json({ requisitions });
  });
}

module.exports = RequisitionController;
