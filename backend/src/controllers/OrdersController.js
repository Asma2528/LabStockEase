const httpStatus = require('http-status');
const OrdersService = require('../services/Orders.service');
const CatchAsync = require('../utils/CatchAsync');

// ✅ Create Order (Auto-Generates `orderNumber`)
exports.createOrder = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        console.error("User ID is missing in the request.");
        return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const orderData = { ...req.body, createdBy: userId };
    const newOrder = await OrdersService.createOrder(orderData);

    return res.status(httpStatus.CREATED).json({ msg: 'Order created successfully', newOrder });
});

// ✅ Get All Orders (with Search & Filters)
exports.getAllOrders = CatchAsync(async (req, res) => {
    const orders = await OrdersService.getAllOrders(req.query);
    return res.status(httpStatus.OK).json({ orders });
});

// ✅ Get Order by ID
exports.getOrderById = CatchAsync(async (req, res) => {
    const order = await OrdersService.getOrderById(req.params.id);
    if (!order) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Order not found' });
    return res.status(httpStatus.OK).json({ order });
});

// ✅ Update Order (Prevents Editing `orderNumber`)
exports.updateOrder = CatchAsync(async (req, res) => {
    const updatedOrder = await OrdersService.updateOrder(req.params.id, req.body);
    if (!updatedOrder) return res.status(httpStatus.NOT_FOUND).json({ msg: 'Order not found' });
    return res.status(httpStatus.OK).json({ msg: 'Order updated successfully', updatedOrder });
});

// ✅ Approve Order (Change Status & Set `approvedBy`)
exports.approveOrder = CatchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        console.error("User ID is missing in the request.");
        return res.status(httpStatus.UNAUTHORIZED).json({ msg: "User ID missing, please authenticate first" });
    }

    const approvedOrder = await OrdersService.approveOrder(req.params.id, req.body.status, userId,req.body.remark);
    return res.status(httpStatus.OK).json({ msg: 'Order status updated', approvedOrder });
});

// ✅ Delete Order
exports.deleteOrder = CatchAsync(async (req, res) => {
    await OrdersService.deleteOrder(req.params.id);
    return res.status(httpStatus.OK).json({ msg: 'Order deleted successfully' });
});
