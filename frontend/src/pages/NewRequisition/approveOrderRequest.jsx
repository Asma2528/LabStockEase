import { useState, useEffect, useMemo } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import {useApproveOrderRequestMutation,useGetAllOrderRequestsQuery} from "../../provider/queries/Order.Request.query"
import Loader from '../../components/Loader';
import { toast } from 'sonner';
import { Button } from 'primereact/button';
import { FaRegEdit } from 'react-icons/fa';

const ApproveOrderRequestPage = () => {
  const [searchParams, setSearchParams] = useState({
    orderRequest_code:"",
    categoryType: "",
     categoryCode: "",  
       item: "",
    status: "",
    date_of_requirement: "",
    requested_by: "",
  });

  const getFieldValue = (value, fallback = '-') => {
    return value ? value : fallback;
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return '-'; // Return '-' if the date is invalid or empty
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const { isLoading, data, refetch } = useGetAllOrderRequestsQuery(searchParams);
  const [approveOrderRequest] = useApproveOrderRequestMutation();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedOrderRequest, setSelectedOrderRequest] = useState(null);
  const [statusValue, setStatusValue] = useState(''); // for the status (approve/reject)
  const [remark, setRemark] = useState(''); // for orderRequest remarks
  const [itemRemarks, setItemRemarks] = useState({}); // for item-specific remarks

  const orderRequests = useMemo(() => data?.orderRequests || [], [data]);



  useEffect(() => {
    refetch();
  }, [refetch]);

  const onSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleStatusChange = (id, currentStatus) => {
    
    const selectedReq = orderRequests.find((req) => req._id === id);
    setSelectedOrderRequest(selectedReq);
    setStatusValue(currentStatus || 'Pending');
    setRemark(selectedReq.remark || '');
    setItemRemarks(
      selectedReq.items.reduce((acc, item) => {
        acc[item._id] = item.remark || '';
        return acc;
      }, {})
    );
    setIsDialogVisible(true);
  };
  

  const handleDialogConfirm = async () => {
    try {
      if (!statusValue || (statusValue !== "Approved" && statusValue !== "Rejected")) {
        toast.error("Invalid status value.");
        return;
      }

      await approveOrderRequest({
        id: selectedOrderRequest._id,
        updateData: {
          id: selectedOrderRequest._id,
          status: statusValue,
          remark,
          items: selectedOrderRequest.items.map((item) => ({
            item_id: item._id,
            remark: itemRemarks[item._id] || '',
          })),
        },
      }).unwrap();
      toast.success(`Order Request ${statusValue}`);
      setIsDialogVisible(false);
      refetch();
    } catch (error) {
      console.error('Approval error:', error);
      const errorMsg = error?.data?.msg || error?.data?.message || 'Failed to update order Request';
      toast.error(errorMsg);
    }
  };
  
  

  return (
    <div className="w-full flex flex-wrap justify-evenly mt-10">
      <BreadCrumbs PageLink='/approve-order-request' PageName='Approve Order Requests' />
      
      {/* Search Bar */}
      <div className="mt-10 flex justify-center w-full mx-auto">
        <form className="flex flex-wrap justify-center gap-x-4 mb-4 w-full">
        <input
            name="orderRequest_code"
            placeholder="Search by Code"
            className="w-1/6 p-2 border rounded"
            onChange={onSearchChange}
            value={searchParams.orderRequest_code}
          />
             <input
            name="categoryType"
            placeholder="Category Type"
            className="w-1/6 p-2 border rounded"
            onChange={onSearchChange}
            value={searchParams.categoryType}
          />
        
    
          <input
            name="date_of_requirement"
            type="text"
            placeholder="Date of Requirement"
            className="w-1/5 p-2 border rounded"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            onChange={onSearchChange}
            value={searchParams.date_of_requirement}
          />
          <input
            name="requested_by"
            placeholder="Search by Requested By"
            className="w-1/5 p-2 border rounded"
            onChange={onSearchChange}
            value={searchParams.requested_by}
          />
          <select
            name="status"
            className="w-1/5 p-2 border rounded text-slate-500 focus:text-black"
            onChange={onSearchChange}
            value={searchParams.status}
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Ordered">Ordered</option>
          </select>
        </form>
      </div>

      {/* OrderRequests Table */}
      <div className="w-full pt-10">
        {isLoading ? <Loader /> : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 borderRequest-b uppercase bg-gray-50">
              <tr>
              <th className="px-4 py-2">Order Request Code</th>
                  <th className="px-4 py-2">Category Type</th>
                  <th className="px-4 py-2">Category Code</th>
                <th className="px-4 py-2">Date of Requirement</th>
                <th className="px-4 py-2">Requested By</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderRequests.length > 0 ? (
                orderRequests.map((orderRequest) => (
                  <tr key={orderRequest._id}>
                                        <td className="px-4 py-2 font-medium">{orderRequest.orderRequest_code || "N/A"}</td>
        <td className="px-4 py-2 font-medium">{orderRequest.categoryType|| "N/A"}</td>
               <td className="px-4 py-2 font-medium">{orderRequest.categoryCode|| "N/A"}</td>
                    <td className="px-4 py-2">{orderRequest.date_of_requirement ? new Date(orderRequest.date_of_requirement).toLocaleDateString() : "N/A"}</td>
                    <td className="px-4 py-2">{orderRequest.requested_by?.name || "N/A"}</td>
                    <td className="px-4 py-2">{orderRequest.createdAt ? new Date(orderRequest.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td className="px-4 py-2">{orderRequest.status || "N/A"}</td>
                    <td className="px-4 py-2 flex gap-x-2">
                      <Button
                        onClick={() => handleStatusChange(orderRequest._id, orderRequest.status)}
                        className={`p-3 bg-lime-400 text-white rounded-sm mx-2`}
                   
                        title="Approve/Reject"
                      >
                        <FaRegEdit className="text-xl" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center px-4 py-2">No Order Requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

  {/* Edit OrderRequest Dialog */}
  {isDialogVisible && selectedOrderRequest && (
  <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-500 bg-opacity-50">
    <div className="bg-white p-8 rounded-md w-full max-w-6xl h-[80vh] overflow-y-auto relative">
    <h2 className="text-xl font-semibold mb-4">Approve Order Request</h2>
      {/* Close Button */}
      <button
        onClick={() => setIsDialogVisible(false)} // Close the dialog
        className="absolute top-4 right-4 text-2xl text-gray-900 hover:text-gray-700"
      >
        &times;
      </button>
      
  

      <form>
        <div className="mb-4">
        <div className="mb-3">
            <label htmlFor="projectCode">Order Request Code</label>
            <input
              id="orderRequest_code"
              type="text"
              className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              value={selectedOrderRequest.orderRequest_code}
              disabled
            />
          </div>

      
             <div  className="mb-3">
                    <label className="block font-medium">Category Type</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={selectedOrderRequest.categoryType || 'N/A'} disabled />
                </div>

                <div  className="mb-3">
                    <label className="block font-medium">Category Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={selectedOrderRequest.categoryCode || 'N/A'} disabled />
                </div>


          {/* Date of Requirement */}
          <div className="mb-3">
            <label htmlFor="date_of_requirement">Date of Requirement</label>
            <input
              id="date_of_requirement"
              type="text"
              className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              value={formatDate(selectedOrderRequest.date_of_requirement)}
              disabled
            />
          </div>

          {/* Requested By */}
          <div className="mb-3">
            <label htmlFor="requested_by">Requested By</label>
            <input
              id="requested_by"
              type="text"
              className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              value={getFieldValue(selectedOrderRequest.requested_by?.name)}
              disabled
            />
          </div>




                <div className="mb-3">
                    <label htmlFor="approved_by">Approved By</label>
                    <input 
                        id="approved_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(selectedOrderRequest.approved_by?.name)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="ordered_by">Ordered By</label>
                    <input 
                        id="ordered_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(selectedOrderRequest.ordered_by?.name)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="createdAt">Created At</label>
                    <input 
                        id="createdAt" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(selectedOrderRequest.createdAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="updatedAt">Last Updated At</label>
                    <input 
                        id="updatedAt" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(selectedOrderRequest.updatedAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="approved_at">Approved At</label>
                    <input 
                        id="approved_at" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(selectedOrderRequest.approved_at)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="ordered_at">Ordered At</label>
                    <input 
                        id="ordered_at" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(selectedOrderRequest.ordered_at)} 
                        disabled 
                    />
                </div>

          {/* Items Information in Table */}
          <div className="mb-3">
            <label htmlFor="items">Item Details</label>
            <table className="w-full text-left table-auto border-1 border-gray-300">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Class</th>
                  <th className="px-4 py-2 border">Item</th>
                  <th className="px-4 py-2 border">Quantity Required</th>
                  <th className="px-4 py-2 border">Unit of Measure</th>
                  <th className="px-4 py-2 border">Description</th>
                  <th className="px-4 py-2 border">Remark</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderRequest.items && selectedOrderRequest.items.length > 0 ? (
                  selectedOrderRequest.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">{item.class || 'N/A'}</td>
                      <td className="px-4 py-2 border">
                        {item.item?.item_code} : {item.item?.item_name || 'N/A'}
                      </td>
                      <td className="px-4 py-2 border">{item.quantity_required || 'N/A'}</td>
                      <td className="px-4 py-2 border">{item.unit_of_measure || 'N/A'}</td>
                      <td className="px-4 py-2 border">{item.description || 'N/A'}</td>
                      {/* Editable Remark Column */}
                      <td className="px-4 py-2 border">
  <input
    type="text"
    value={itemRemarks[item._id] || ''} 
    onChange={(e) =>
      setItemRemarks({ ...itemRemarks, [item._id]: e.target.value })
    }
    placeholder="Enter Remark"
    className="p-2 border rounded w-full"
    disabled={selectedOrderRequest.status !== "Pending"} 
  />
</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-2 border text-center">No items available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Status Selection */}
          <div className="mb-3">
  <label htmlFor="status">Status</label>
  <select
    id="status"
    className="w-full p-2 border rounded"
    value={statusValue}  // Binding statusValue to the select element
    onChange={(e) => setStatusValue(e.target.value)}  // Update statusValue when selected
  >
      <option value="">Select Status</option>
    <option value="Approved">Approve</option>
    <option value="Rejected">Reject</option>
  </select>
</div>


          {/* OrderRequest Remarks */}
          <div className="mb-3">
            <label htmlFor="remark">Order Request Remarks</label>
            <textarea
              id="remark"
              className="w-full p-2 border rounded"
              rows="3"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>

        </div>

        <div className="flex justify-end gap-2">
  {/* Cancel Button */}
  <Button
    label="Cancel"
    icon="pi pi-times"
    className="p-button-secondary py-2 px-4 rounded-md bg-red-500 text-white"
    onClick={() => setIsDialogVisible(false)}
  />
<Button
  label="Confirm"
  icon="pi pi-check"
  className={`p-button-danger py-2 px-4 rounded-md ${selectedOrderRequest?.status === 'Pending' ? 'bg-green-400 text-white' : 'bg-gray-800 cursor-not-allowed text-white'}`}
  onClick={handleDialogConfirm}
  disabled={selectedOrderRequest?.status === 'Approved' || selectedOrderRequest?.status === 'Rejected'}
/>



</div>

      </form>
    </div>
  </div>
)}



    </div>
  );
};

export default ApproveOrderRequestPage;
