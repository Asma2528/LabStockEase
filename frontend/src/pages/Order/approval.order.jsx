import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useGetAllOrdersQuery, useApproveOrderMutation } from '../../provider/queries/Orders.query';
import Loader from '../../components/Loader';
import { toast } from 'sonner';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { FaRegEdit } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';

const ApproveOrderPage = () => {
    const [searchParams, setSearchParams] = useState({
        poNumber: '',
        vendor: '',
        status: '',
        quotationDate: '',
        createdAt: ''
    });

    const { isLoading, data, refetch } = useGetAllOrdersQuery(searchParams);
    const [approveOrder] = useApproveOrderMutation();
    const [expandedRow, setExpandedRow] = useState(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [statusValue, setStatusValue] = useState('');
      const [remark, setRemark] = useState('');


    const orders = useMemo(() => data?.orders || [], [data]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        refetch();
    };

    const handleStatusChange = (id, currentStatus) => {
        setSelectedOrderId(id);
        setStatusValue(currentStatus === 'Approved' ? 'Rejected' : 'Approved'); // Toggle between Approved and Rejected
        setIsDialogVisible(true);
    };

    const handleDialogConfirm = async () => {
        try {
            await approveOrder({ id: selectedOrderId, status: statusValue,   remark:remark }).unwrap();
            toast.success(`Order ${statusValue}`);
            refetch();
        } catch (error) {
            toast.error('Failed to update order');
        } finally {
            setIsDialogVisible(false);
        }
    };

    const toggleExpandRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="w-full flex flex-wrap justify-evenly mt-10">
            <BreadCrumbs PageLink='/ApproveOrders' PageName='Approve Orders' />

            {/* Search Form */}
            <div className="mt-10 flex justify-end w-[98%] mx-auto">
                <form onSubmit={handleSearchSubmit} className="mb-3 flex justify-end w-[90%] mx-auto gap-x-4">
                   
                    {/* Search by Order Number */}
                    <input 
                        name="orderNumber" 
                        placeholder="Order Number" 
                        className="w-1/4 p-2 border rounded" 
                        onChange={handleSearchChange} 
                        value={searchParams.orderNumber} 
                    />
                    <input
                        name="poNumber"
                        placeholder="Search by PO Number"
                        className="w-1/3 p-2 border rounded"
                        onChange={handleSearchChange}
                        value={searchParams.poNumber}
                    />
                    <input
                        name="quotationDate"
                        placeholder="Search by Quotation Date"
                        type="text"
                        className="w-2/5 p-2 border rounded"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                        onChange={handleSearchChange}
                        value={searchParams.quotationDate}
                    />
                    <input
                        name="createdAt"
                        placeholder="Search by Created Date"
                        type="text"
                        className="w-2/5 p-2 border rounded"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                        onChange={handleSearchChange}
                        value={searchParams.createdAt}
                    />
                    <select
                        name="status"
                        value={searchParams.status}
                        onChange={handleSearchChange}
                        className="w-1/3 p-2 border rounded text-gray-500"
                    >
                        <option value="">Search by Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </form>
            </div>

            {/* Orders Table */}
            <div className="w-full pt-10">
                {isLoading ? <Loader /> : (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 border-b uppercase bg-gray-50">
                            <tr>
                            <th className="px-4 py-2">Order Number</th>
                                <th className="px-4 py-2">PO Number</th>
                                <th className="px-4 py-2">Vendor</th>
                                <th className="px-4 py-2">Created By</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        <tr>
                                        <td className="px-4 py-2">{order.orderNumber}</td>
                                            <td className="px-4 py-2">{order.poNumber}</td>
                          
                                            <td className="px-4 py-2">
  {order.vendor ? `${order.vendor.code} - ${order.vendor.name}` : 'Unknown Vendor'}
</td>

                                            <td className="px-4 py-2"> {order.createdBy?.name || 'Unknown'}</td>
                                            <td className="px-4 py-2">{order.status}</td>
                                            <td className="px-4 py-2 flex gap-x-2">
                                                {/* View Button */}
                                                <Button
                                                    onClick={() => toggleExpandRow(order._id)}
                                                    className="p-3 bg-indigo-500 text-white rounded-sm mx-2"
                                                    title="View"
                                                >
                                                    <LuView className="text-xl" />
                                                </Button>

                                                {/* Edit Button to change status */}
                                                <Button
                                                    onClick={() => handleStatusChange(order._id, order.status)}
                                                    className={`p-3 ${order.status === 'Pending' ? 'bg-lime-400' : 'bg-gray-400 cursor-not-allowed'} text-white rounded-sm mx-2`}
                                                    disabled={order.status !== 'Pending'}
                                                    title="Approve/Reject"
                                                >
                                                    <FaRegEdit className="text-xl" />
                                                </Button>
                                            </td>
                                        </tr>

                                        {/* Expanded Row for View Details */}
                                        {expandedRow === order._id && (
                                            <tr>
                                                <td colSpan="6" className="p-4 bg-gray-100">
                                                    <div className="space-y-2 text-gray-600">
                                                        <p><strong>PO Number:</strong> {order.poNumber}</p>
                                                        <p><strong>Category Type:</strong> {order.categoryType}</p>
                                                        <p><strong>Category Code:</strong> {order.categoryCode}</p>
                                                        <p><strong>Vendor Name:</strong> {order.vendor?.name}</p>
                                                        <p><strong>Quotation Ref No:</strong> {order.quotationRefNo}</p>
                                                        <p><strong>Quotation Date:</strong> {new Date(order.quotationDate).toLocaleDateString()}</p>
                                                        <p><strong>Created By:</strong> {order.createdBy?.name || 'Unknown'}</p>
                                                        <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                                        <p><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleDateString()}</p>
                                                        <p><strong>Notes:</strong> {order.notes || 'No notes available'}</p>

                                                      
                                                        {/* Status and Approved By */}
                                                        <p><strong>Status:</strong> {order.status || 'Pending'}</p>
                                                        <p><strong>Approved / Rejected By:</strong> {order.approvedBy?.name || 'Not approved yet'}</p>
 <p><strong>Remark:</strong> {order.remark|| '-'}</p>
                                                        {/* Items Table (last) */}
                                                        <p><strong>Items:</strong></p>
                                                        <table className="w-full text-sm text-left text-gray-500">
                                                            <thead className="bg-gray-200">
                                                                <tr>
                                                                    <th className="px-4 py-2">Entry No.</th>
                                                                    <th className="px-4 py-2">Description</th>
                                                                    <th className="px-4 py-2">Item Code</th>
                                                                    <th className="px-4 py-2">Make</th>
                                                                    <th className="px-4 py-2">Quantity</th>
                                                                    <th className="px-4 py-2">Rate</th>
                                                                    <th className="px-4 py-2">Discount</th>
                                                                
                                                                    <th className="px-4 py-2">Tax/GST</th>
                                                                    <th className="px-4 py-2">Cost</th>
                                                                    
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.items.map((item, index) => (
                                                                    <tr key={index}>
                                                                        <td className="px-4 py-2">{item.entryNo}</td>
                                                                        <td className="px-4 py-2">{item.description}</td>
                                                                        <td className="px-4 py-2">{item.itemCode}</td>
                                                                        <td className="px-4 py-2">{item.make || 'N/A'}</td>
                                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                                        <td className="px-4 py-2">{item.rate}</td>
                                                                        <td className="px-4 py-2">{item.discount}</td>
                                                                
                                                                        <td className="px-4 py-2">{item.taxGST}</td>
                                                                        <td className="px-4 py-2">{item.cost}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        <p><strong>Total Cost:</strong> {order.totalCost || 0}</p>
                                                        <p><strong>Total GST:</strong> {order.totalGST || 0}</p>
                                                        <p><strong>Grand Total:</strong> {order.grandTotal || 0}</p>

                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center px-4 py-2">No orders found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Confirm Dialog for Status Change */}
            <ConfirmDialog
                visible={isDialogVisible}
                onHide={() => setIsDialogVisible(false)}
                message={
                    <>
                        <p>Are you sure you want to change the status to <strong>{statusValue}</strong>?</p>
                         <div className="mb-3">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mt-4">
                            Select Status
                        </label>
                        <select
                            id="status"
                            value={statusValue}
                            onChange={(e) => setStatusValue(e.target.value)}
                            className="mt-1 p-2 border rounded w-full"
                        >
                            <option value="Approved">Approve</option>
                            <option value="Rejected">Reject</option>
                        </select></div>
  <div className="mb-3">
            <label htmlFor="remark">Remark</label>
            <textarea
              id="remark"
              className="w-full p-2 border rounded"
              rows="3"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
                        
                    </>
                }
                header="Confirm Action"
                icon="pi pi-exclamation-triangle"
                footer={
                    <div className="p-dialog-footer flex justify-end gap-2">
                        <Button
                            label="No"
                            icon="pi pi-times"
                            className="p-button-secondary py-2 px-4 rounded-md bg-red-500 text-white"
                            onClick={() => setIsDialogVisible(false)}
                        />
                        <Button
                            label="Yes"
                            icon="pi pi-check"
                            className="p-button-danger py-2 px-4 rounded-md bg-green-600 text-white"
                            onClick={handleDialogConfirm}
                        />
                    </div>
                }
            />
        </div>
    );
};

export default ApproveOrderPage;
