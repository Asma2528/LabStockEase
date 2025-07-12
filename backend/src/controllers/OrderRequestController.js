const httpStatus = require('http-status');
const OrderRequestService = require('../services/OrderRequest.service');
const CatchAsync = require('../utils/CatchAsync');

class OrderRequestController {
  // Faculty (or chemistry user) creates a orderRequest
  static createOrderRequest = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
      console.error("User ID is missing in the request.");
      return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const orderRequestData = { ...req.body, requested_by: userId };
    const newOrderRequest = await OrderRequestService.createOrderRequest(orderRequestData);

    return res.status(httpStatus.CREATED).json({ msg: 'OrderRequest created successfully', newOrderRequest });
  });

  // Faculty retrieves their own orderRequests (optionally with search filters)
 static getUserOrderRequest = async (req, res, next) => {
    try {
      const userEmail = req.user.email; // Assuming the user is authenticated and their email is stored in req.user
      const searchParams = req.query;
      
      const orderRequests = await OrderRequestService.getUserOrderRequest(userEmail, searchParams);
      res.status(httpStatus.OK).json(orderRequests);
    } catch (error) {
      next(error);
    }
  };
   

  // Faculty updates their own orderRequest (only if status is Pending)
  static updateOrderRequest = CatchAsync(async (req, res) => {

    console.log('Request body:', req.body);
    
    const { id } = req.params;
    const updatedOrderRequest = await OrderRequestService.updateOrderRequest(id, req.body, req.user.email);

    if (!updatedOrderRequest) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'OrderRequest not found or cannot be updated' });
    }
    return res.status(httpStatus.OK).json({ msg: 'OrderRequest updated successfully', updatedOrderRequest });
  });

  // Faculty deletes their own orderRequest (only if status is Pending)
  static deleteOrderRequest = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
      console.error("User ID is missing in the request.");
      return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const { id } = req.params;
    console.log("id: ", id);
    console.log("uid: ", userId);

    // Call the delete service method, passing the userId as requested_by
    const deletedOrderRequest = await OrderRequestService.deleteOrderRequest(id, userId);

    if (!deletedOrderRequest) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'OrderRequest not found or cannot be deleted' });
    }

    return res.status(httpStatus.OK).json({ msg: 'OrderRequest deleted successfully' });
  });

  // Admin (or manager) retrieves all orderRequests (with optional search filters)
  static getAllOrderRequests = CatchAsync(async (req, res) => {
    const orderRequests = await OrderRequestService.getAllOrderRequests(req.query);
    return res.status(httpStatus.OK).json({ orderRequests });
  });

  // Admin approves a orderRequest – requires valid approved_at, approved_by, and an updated status (Approved/Rejected)
  static approveOrderRequest = CatchAsync(async (req, res) => {

    const approvedOrderRequest = await OrderRequestService.approveOrderRequest(
      req.user.id,  // The ID of the admin performing the approval
      req.body      // All the data from the request body (status, remarks, etc.)
    );
  
    if (!approvedOrderRequest) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'OrderRequest not found or cannot be approved' });
    }
  
    return res.status(httpStatus.OK).json({
      msg: 'OrderRequest approved successfully',
      approvedOrderRequest,
    });
  });
  
  static getApprovedRequests = CatchAsync(async (req, res) => {

    const orderRequests = await OrderRequestService.getApprovedRequests(
    req.query
    );

    return res.status(httpStatus.OK).json({ orderRequests });
  });
  // Chemistry staff retrieves approved and issued orderRequests with search functionality
  static getApprovedAndOrderedRequests = CatchAsync(async (req, res) => {

    const orderRequests = await OrderRequestService.getApprovedAndOrderedRequests(
    req.query
    );

    return res.status(httpStatus.OK).json({ orderRequests });
  });
// Controller: Change the status of a orderRequest to "Ordered"
static changeStatusToOrdered = CatchAsync(async (req, res) => {
  // Merge the URL parameter into the request body as _id.
  const updatedOrderRequest = await OrderRequestService.changeStatusToOrdered(
    { _id: req.params.id, ...req.body },
    req.user.id
  );
  return res.status(httpStatus.OK).json({ msg: 'Status updated to "Ordered" successfully', updatedOrderRequest });
});



  // Admin approves a orderRequest – requires valid approved_at, approved_by, and an updated status (Approved/Rejected)
  static approveOrderRequest = CatchAsync(async (req, res) => {

    const approvedOrderRequest = await OrderRequestService.approveOrderRequest(
      req.user.id,  // The ID of the admin performing the approval
      req.body      // All the data from the request body (status, remarks, etc.)
    );
  
    if (!approvedOrderRequest) {
      return res.status(httpStatus.NOT_FOUND).json({ msg: 'OrderRequest not found or cannot be approved' });
    }
  
    return res.status(httpStatus.OK).json({
      msg: 'OrderRequest approved successfully',
      approvedOrderRequest,
    });
  });


}

module.exports = OrderRequestController;
