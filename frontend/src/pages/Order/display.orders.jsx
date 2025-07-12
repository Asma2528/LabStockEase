import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';
import ReportButton from './ReportButton';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const ViewOrder = ({ visible, setVisible, order }) => {
    const createdByName = typeof order.createdBy === 'object' ? order.createdBy?.name : order.createdBy;
    const approvedByName = typeof order.approvedBy === 'object' ? order.approvedBy?.name : 'N/A';




    return (
        <Dialog
            header="View Order"
            visible={visible}
            className="w-full md:w-[90%] lg:w-10/12"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Order Number */}
                <div>
                    <label className="block font-medium">Order Number</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={order.orderNumber} disabled />
                </div>

                {/* PO Number */}
                <div>
                    <label className="block font-medium">PO Number</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={order.poNumber} disabled />
                </div>

            
                <div>
                    <label className="block font-medium">Category Type</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={order.categoryType || 'N/A'} disabled />
                </div>

                <div>
                    <label className="block font-medium">Category Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={order.categoryCode || 'N/A'} disabled />
                </div>


                {/* Vendor */}
                <div>
                    <label className="block font-medium">Vendor Name</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={order.vendor ? `${order.vendor.code} - ${order.vendor.name}` : 'Unknown Vendor'} disabled />
                </div>

                {/* Quotation Ref No */}
                <div>
                    <label className="block font-medium">Quotation Ref No</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={order.quotationRefNo} disabled />
                </div>

                {/* Quotation Date */}
                <div>
                    <label className="block font-medium">Quotation Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(order.quotationDate)} disabled />
                </div>

                {/* Status */}
                <div>
                    <label className="block font-medium">Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={order.status} disabled />
                </div>

                {/* Created By */}
                <div>
                    <label className="block font-medium">Created By</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={createdByName || 'N/A'} disabled />
                </div>

                {/* Approved By */}
                <div>
                    <label className="block font-medium">Approved / Rejected By</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={approvedByName} disabled />
                </div>

 <div>
                    <label className="block font-medium">Remark</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={order.remark} disabled />
                </div>

                {/* Created At */}
                <div>
                    <label className="block font-medium">Created At</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(order.createdAt)} disabled />
                </div>

                {/* Updated At */}
                <div>
                    <label className="block font-medium">Updated At</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(order.updatedAt)} disabled />
                </div>

                {/* Notes */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block font-medium">Notes</label>
                    <textarea className="w-full px-5 py-2 rounded-md border" value={order.notes || 'N/A'} disabled />
                </div>
            </div>

            {/* Items Table */}
            <div className="mt-5">
                <h3 className="font-bold mb-2">Items</h3>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="border px-3 py-2">Entry No</th>
                            <th className="border px-3 py-2">Description</th>
                            <th className="border px-3 py-2">Class</th>
                            <th className="border px-3 py-2">Item Code</th>
                            <th className="border px-3 py-2">Make</th>
                            <th className="border px-3 py-2">Qty</th>
                            <th className="border px-3 py-2">Rate</th>
                            <th className="border px-3 py-2">Discount (%)</th>
    
                            <th className="border px-3 py-2">GST (%)</th>
                            <th className="border px-3 py-2">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => (

                            <tr key={index}>
                                <td className="border px-3 py-2">{item.entryNo}</td>
                                <td className="border px-3 py-2">{item.description}</td>
                                <td className="border px-3 py-2">{item.class}</td>
                                <td className="border px-3 py-2">{item.item?.item_code || 'N/A'}</td>
                                <td className="border px-3 py-2">{item.make || 'N/A'}</td>
                                <td className="border px-3 py-2">{item.quantity}</td>
                                <td className="border px-3 py-2">{item.rate}</td>
                                <td className="border px-3 py-2">{item.discount}</td>
               
                                <td className="border px-3 py-2">{item.taxGST}</td>
                                <td className="border px-3 py-2">{item.cost.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Order Totals */}
                <div className="mt-4 text-left">
                    <div className="text-base font-semibold">Total Cost: ₹{order.totalCost?.toFixed(2) || '0.00'}</div>
                    <div className="text-base font-semibold">Total GST: ₹{order.totalGST?.toFixed(2) || '0.00'}</div>
                    <div className="text-base font-semibold">Grand Total: ₹{order.grandTotal?.toFixed(2) || '0.00'}</div>
                </div>
            </div>
            <div className="w-full flex justify-end mb-10 font-normal">
                    <ReportButton order={order} />
                </div>
        </Dialog>
    );
};

ViewOrder.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    order: PropTypes.object.isRequired,
};

export default ViewOrder;
