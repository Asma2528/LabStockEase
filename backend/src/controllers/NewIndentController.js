const httpStatus = require('http-status');
const NewIndentService = require('../services/NewIndent.service');
const CatchAsync = require('../utils/CatchAsync');

class NewIndentController {
  // Faculty (or chemistry user) creates a newIndent
  static createNewIndent = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
      console.error("User ID is missing in the request.");
      return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const newIndentData = { ...req.body, requested_by: userId };
    const newNewIndent = await NewIndentService.createNewIndent(newIndentData);

    return res.status(httpStatus.CREATED).json({ msg: 'New Indent created successfully', newNewIndent });
  });

  // Faculty retrieves their own newIndents (optionally with search filters)
 static getUserNewIndent = async (req, res, next) => {
    try {
      const userEmail = req.user.email; // Assuming the user is authenticated and their email is stored in req.user
      const searchParams = req.query;
      
      const newIndents = await NewIndentService.getUserNewIndent(userEmail, searchParams);
      res.status(httpStatus.OK).json(newIndents);
    } catch (error) {
      next(error);
    }
  };
   

  // Faculty updates their own newIndent (only if status is Pending)
  static updateNewIndent = CatchAsync(async (req, res) => {

    console.log('Request body:', req.body);
    
    const { id } = req.params;
    const updatedNewIndent = await NewIndentService.updateNewIndent(id, req.body, req.user.email);

    if (!updatedNewIndent) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'New Indent not found or cannot be updated' });
    }
    return res.status(httpStatus.OK).json({ msg: 'New Indent updated successfully', updatedNewIndent });
  });

  // Faculty deletes their own newIndent (only if status is Pending)
  static deleteNewIndent = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
      console.error("User ID is missing in the request.");
      return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const { id } = req.params;

    // Call the delete service method, passing the userId as requested_by
    const deletedNewIndent = await NewIndentService.deleteNewIndent(id, userId);

    if (!deletedNewIndent) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'New Indent not found or cannot be deleted' });
    }

    return res.status(httpStatus.OK).json({ msg: 'New Indent deleted successfully' });
  });

  // Admin (or manager) retrieves all newIndents (with optional search filters)
  static getAllNewIndents = CatchAsync(async (req, res) => {
    const newIndents = await NewIndentService.getAllNewIndents(req.query);
    return res.status(httpStatus.OK).json({ newIndents });
  });

  // Admin approves a newIndent – requires valid approved_at, approved_by, and an updated status (Approved/Rejected)
  static approveNewIndent = CatchAsync(async (req, res) => {

    const approvedNewIndent = await NewIndentService.approveNewIndent(
      req.user.id,  // The ID of the admin performing the approval
      req.body      // All the data from the request body (status, remarks, etc.)
    );
  
    if (!approvedNewIndent) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'New Indent not found or cannot be approved' });
    }
  
    return res.status(httpStatus.OK).json({
      msg: 'New Indent approved successfully',
      approvedNewIndent,
    });
  });
  

  // Chemistry staff retrieves approved and issued newIndents with search functionality
  static getApprovedAndOrderedRequests = CatchAsync(async (req, res) => {
   
      
    const newIndents = await NewIndentService.getApprovedAndOrderedRequests(
     req.query
    );

    return res.status(httpStatus.OK).json({ newIndents });
  });

  static getApprovedRequests = CatchAsync(async (req, res) => {
   
      
    const newIndents = await NewIndentService.getApprovedRequests(
     req.query
    );

    return res.status(httpStatus.OK).json({ newIndents });
  });
// Controller: Change the status of a newIndent to "Ordered"
static changeStatusToOrdered = CatchAsync(async (req, res) => {
  // Merge the URL parameter into the request body as _id.
  const updatedNewIndent = await NewIndentService.changeStatusToOrdered(
    { _id: req.params.id, ...req.body },
    req.user.id
  );
  return res.status(httpStatus.OK).json({ msg: 'Status updated to "Ordered" successfully', updatedNewIndent });
});



  // Admin approves a newIndent – requires valid approved_at, approved_by, and an updated status (Approved/Rejected)
  static approveNewIndent = CatchAsync(async (req, res) => {

    const approvedNewIndent = await NewIndentService.approveNewIndent(
      req.user.id,  // The ID of the admin performing the approval
      req.body      // All the data from the request body (status, remarks, etc.)
    );
  
    if (!approvedNewIndent) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'New Indent not found or cannot be approved' });
    }
  
    return res.status(httpStatus.OK).json({
      msg: 'New Indent approved successfully',
      approvedNewIndent,
    });
  });


}

module.exports = NewIndentController;
