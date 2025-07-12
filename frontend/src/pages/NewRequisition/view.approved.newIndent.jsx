import { useState, useEffect, useMemo } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useGetApprovedAndOrderedRequestsQuery,useChangeStatusToOrderedMutation } from '../../provider/queries/New.Indent.query';
import Loader from '../../components/Loader';
import { toast } from 'sonner';
import { Button } from 'primereact/button';
import { FaRegEdit } from 'react-icons/fa';

const ViewApprovedNewIndentPage = () => {
  const [searchParams, setSearchParams] = useState({
    newindent_code:"",
    categoryType: "",
     categoryCode: "",    item: "",
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

  const { isLoading, data, refetch } = useGetApprovedAndOrderedRequestsQuery(searchParams);
  console.log(data);
  const [orderedNewIndent] = useChangeStatusToOrderedMutation();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedNewIndent, setSelectedNewIndent] = useState(null);
  const [statusValue, setStatusValue] = useState(''); // for the status (approve/reject)
 

  const newIndents = useMemo(() => data?.newIndents || [], [data]);


console.log(data);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const onSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleStatusChange = (id, currentStatus) => {
    
    const selectedReq = newIndents.find((req) => req._id === id);
    setSelectedNewIndent(selectedReq);
    setStatusValue(currentStatus);
   
    setIsDialogVisible(true);
  };
  
  const handleDialogConfirm = async () => {
    try {
      // Call the mutation with only id and status
      await orderedNewIndent({
        id: selectedNewIndent._id,
        status: "Ordered",
      }).unwrap();
      
      toast.success(`New Indents ${statusValue}`);
      setIsDialogVisible(false);
      refetch();
    } catch (error) {
      console.error('Ordered error:', error);
      const errorMsg = error?.data?.msg || error?.data?.message || 'Failed to update new indents';
      toast.error(errorMsg);
    }
  };
  
  

  return (
    <div className="w-full flex flex-wrap justify-evenly mt-10">
      <BreadCrumbs PageLink='/view-approved-new-indents' PageName='Approve New Indents' />
      
      {/* Search Bar */}
      <div className="mt-10 flex justify-center w-full mx-auto">
        <form className="flex flex-wrap justify-center gap-x-4 mb-4 w-full">
        <input
            name="newindent_code"
            placeholder="Search by Code"
            className="w-1/6 p-2 border rounded"
            onChange={onSearchChange}
            value={searchParams.newindent_code}
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
            <option value="Approved">Approved</option>
            <option value="Ordered">Ordered</option>
          </select>
        </form>
      </div>

    
      <div className="w-full pt-10">
        {isLoading ? <Loader /> : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700  uppercase bg-gray-50">
              <tr>
              <th className="px-4 py-2">New Indent Code</th>
                  <th className="px-4 py-2">Category Type</th>
                  <th className="px-4 py-2">Category Code</th>
                <th className="px-4 py-2">Date of Requirement</th>
                <th className="px-4 py-2">Requested By</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {newIndents.length > 0 ? (
                newIndents.map((newIndent) => (
                  <tr key={newIndents._id}>
                                         <td className="px-4 py-2">{newIndent.newindent_code || "N/A"}</td>
        <td className="px-4 py-2 font-medium">{newIndent.categoryType|| "N/A"}</td>
               <td className="px-4 py-2 font-medium">{newIndent.categoryCode|| "N/A"}</td>
                    <td className="px-4 py-2">{newIndent.date_of_requirement ? new Date(newIndent.date_of_requirement).toLocaleDateString() : "N/A"}</td>
                    <td className="px-4 py-2">{newIndent.requested_by?.name || "N/A"}</td>
                    <td className="px-4 py-2">{newIndent.status || "N/A"}</td>
                    <td className="px-4 py-2 flex gap-x-2">
                      <Button
                        onClick={() => handleStatusChange(newIndent._id, newIndent.status)}
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
                  <td colSpan="6" className="text-center px-4 py-2">No new indents found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

  {isDialogVisible && selectedNewIndent && (
  <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-500 bg-opacity-50">
    <div className="bg-white p-8 rounded-md w-full max-w-6xl h-[80vh] overflow-y-auto relative">
    <h2 className="text-xl font-semibold mb-4">Change Status to Ordered: New Indent</h2>
      {/* Close Button */}
      <button
        onClick={() => setIsDialogVisible(false)} // Close the dialog
        className="absolute top-4 right-4 text-2xl text-gray-900 hover:text-gray-700"
      >
        &times;
      </button>
      
  

      <form>
        <div className="mb-4">
        <div className="mb-4">
        <label htmlFor="new">New Indent Code</label>
            <input
              id="projectCode"
              type="text"
              className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              value={selectedNewIndent.newindent_code}
              disabled
            />
          </div>

     
             <div  className="mb-3">
                    <label className="block font-medium">Category Type</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={selectedNewIndent.categoryType || 'N/A'} disabled />
                </div>

                <div  className="mb-3">
                    <label className="block font-medium">Category Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={selectedNewIndent.categoryCode || 'N/A'} disabled />
                </div>


          {/* Date of Requirement */}
          <div className="mb-3">
            <label htmlFor="date_of_requirement">Date of Requirement</label>
            <input
              id="date_of_requirement"
              type="text"
              className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              value={formatDate(selectedNewIndent.date_of_requirement)}
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
              value={getFieldValue(selectedNewIndent.requested_by?.name)}
              disabled
            />
          </div>



                <div className="mb-3">
                    <label htmlFor="approved_by">Approved By</label>
                    <input 
                        id="approved_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(selectedNewIndent.approved_by?.name)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="orderedd_by">Ordered By</label>
                    <input 
                        id="orderedd_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(selectedNewIndent.ordered_by?.name)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="createdAt">Created At</label>
                    <input 
                        id="createdAt" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(selectedNewIndent.createdAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="updatedAt">Last Updated At</label>
                    <input 
                        id="updatedAt" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(selectedNewIndent.updatedAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="approved_at">Approved At</label>
                    <input 
                        id="approved_at" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(selectedNewIndent.approved_at)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="orderedd_at">Ordered At</label>
                    <input 
                        id="orderedd_at" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(selectedNewIndent.orderedd_at)} 
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
                  <th className="px-4 py-2 border">Technical Details</th>
                  <th className="px-4 py-2 border">Remark</th>
                </tr>
              </thead>
              <tbody>
                {selectedNewIndent.items && selectedNewIndent.items.length > 0 ? (
                  selectedNewIndent.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">{item.class || 'N/A'}</td>
                      <td className="px-4 py-2 border">
                        {item.item || 'N/A'} 
                      </td>
                      <td className="px-4 py-2 border">{item.quantity_required || 'N/A'}</td>
                      <td className="px-4 py-2 border">{item.unit_of_measure || 'N/A'}</td>
                      <td className="px-4 py-2 border">{item.description || 'N/A'}</td>
                      <td className="px-4 py-2 border">{item.technical_details|| 'N/A'}</td>
                      {/* Editable Remark Column */}
                      <td className="px-4 py-2 border">
  <input
    type="text"
    value={item.remark || ''} 
    placeholder="Enter Remark"
    className="p-2 border rounded w-full"
    disabled={selectedNewIndent.status !== "Pending"} 
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


       
          <div className="mb-3">
            <label htmlFor="remark">New Indent Remarks</label>
            <textarea
              id="remark"
              className="w-full p-2 border rounded"
              rows="3"
              value={selectedNewIndent.remark}
            />
          </div>


          {/* Status Selection */}
          <div className="mb-3">
  <label htmlFor="status"><b>Changing Status:</b></label>
  <select
    id="status"
    className="w-full p-2 border rounded"
    value={statusValue}  // Binding statusValue to the select element
    onChange={(e) => setStatusValue(e.target.value)}  // Update statusValue when selected
  >
     
    <option value="Ordered">Ordered</option>
  </select>
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
  label="Changing Status"
  icon="pi pi-check"
  className={`p-button-danger py-2 px-4 rounded-md ${selectedNewIndent?.status === 'Approved' ? 'bg-green-400 text-white' : 'bg-gray-700 cursor-not-allowed text-white'}`}
  onClick={handleDialogConfirm}
  disabled={selectedNewIndent?.status === 'Ordered' }
/>



</div>

      </form>
    </div>
  </div>
)}



    </div>
  );
};

export default ViewApprovedNewIndentPage;
