import { useState, useEffect, useMemo } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useGetApprovedAndIssuedRequisitionsQuery, useChangeStatusToIssuedMutation } from '../../provider/queries/Requisition.query';
import Loader from '../../components/Loader';
import { toast } from 'sonner';
import { Button } from 'primereact/button';
import { FaRegEdit } from 'react-icons/fa';

const ViewApprovedRequisitionPage = () => {
  const [searchParams, setSearchParams] = useState({
    requisition_code: '',
    status: "",
    categoryType: "",
    categoryCode: "",
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

  const { isLoading, data, refetch } = useGetApprovedAndIssuedRequisitionsQuery(searchParams);
  console.log("Requisitions data:", data);
  const [issueRequisition] = useChangeStatusToIssuedMutation();
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [statusValue, setStatusValue] = useState(''); // for the status (approve/reject)

  const [issuedItems, setIssuedItems] = useState([]);
  const [issuedDate, setIssuedDate] = useState('');
  const handleStatusChange = (id, currentStatus) => {
  const selectedReq = requisitions.find((req) => req._id === id);
  setSelectedRequisition(selectedReq);
  setStatusValue(currentStatus);

  // Preload issued items in local state
 const mappedItems = selectedReq.items.map((item) => ({
  item: item.item, // ensure we explicitly include item reference
  class: item.class,
  quantity_issued:item.quantity_issued || '',
  item_code: item.item_code,
  item_name: item.item_name,
  unit_of_measure: item.unit_of_measure,
  quantity_required: item.quantity_required,
  description: item.description,
  remark: item.remark,
  quantity_returned: item.quantity_returned,
  date_issued: item.date_issued || '',
  issued_by: item.issued_by || '',
}));

  setIssuedItems(mappedItems);

  setIssuedDate(new Date().toISOString().split('T')[0]); // default today

  setIsDialogVisible(true);
};


  const handleIssuedQuantityChange = (index, value) => {
    const updatedItems = [...issuedItems];
    updatedItems[index].quantity_issued = value;
    setIssuedItems(updatedItems);
  };

  const requisitions = useMemo(() => data?.requisitions || [], [data]);




  useEffect(() => {
    refetch();
  }, [refetch]);

  const onSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };



  const handleDialogConfirm = async (e) => {
     e.preventDefault();
    try {


await issueRequisition({
  id: selectedRequisition._id,
  status: "Issued",
  issued_at: issuedDate,
  items: issuedItems.map((item) => ({
    item: item.item, 
    quantity_issued: item.quantity_issued,
    class: item.class, 
  })),
});

      toast.success(`Requisition ${statusValue}`);
      setIsDialogVisible(false);
      refetch();
    } catch (error) {
      console.error('Issue error:', error);
      const errorMsg = error?.data?.msg || error?.data?.message || 'Failed to update requisition';
      toast.error(errorMsg);
    }
  };



  return (
    <div className="w-full flex flex-wrap justify-evenly mt-10">
      <BreadCrumbs PageLink='/view-approved-requisition' PageName='Approve Requisitions' />

      {/* Search Bar */}
      <div className="mt-10 flex justify-center w-full mx-auto">
        <form className="flex flex-wrap justify-center gap-x-4 mb-4 w-full">
          <input
            name="categoryType"
            placeholder="Category Type"
            className="w-1/6 p-2 border rounded"
            onChange={onSearchChange}
            value={searchParams.categoryType}
          />


          <input
            name="requisition_code"
            placeholder="Code"
            className="w-1/12 p-2 border rounded"
            onChange={onSearchChange}
            value={searchParams.requisition_code}
          />

          <input
            name="date_of_requirement"
            type="text"
            placeholder="Date of Requirement"
            className="w-1/6 p-2 border rounded"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            onChange={onSearchChange}
            value={searchParams.date_of_requirement}
          />
          <input
            name="requested_by"
            placeholder="Requested By"
            className="w-1/6 p-2 border rounded"
            onChange={onSearchChange}
            value={searchParams.requested_by}
          />
          <select
            name="status"
            className="w-1/6 p-2 border rounded text-slate-500 focus:text-black"
            onChange={onSearchChange}
            value={searchParams.status}
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Issued">Issued</option>
            <option value="Return">Return</option>
          </select>
        </form>
      </div>

      {/* Requisitions Table */}
      <div className="w-full pt-10">
        {isLoading ? <Loader /> : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700  uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-2">Requisition Code  </th>
                <th className="px-4 py-2">Category Type</th>
                <th className="px-4 py-2">Category Code</th>
                <th className="px-4 py-2">Date of Requirement</th>
                <th className="px-4 py-2">Requested By</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.length > 0 ? (
                requisitions.map((requisition) => (
                  <tr key={requisition._id}>
                    <td className="px-4 py-2 font-medium">{requisition.requisition_code || "N/A"}</td>
                    <td className="px-4 py-2 font-medium">{requisition.categoryType || "N/A"}</td>
                    <td className="px-4 py-2 font-medium">{requisition.categoryCode || "N/A"}</td>
                    <td className="px-4 py-2">{requisition.date_of_requirement ? new Date(requisition.date_of_requirement).toLocaleDateString() : "N/A"}</td>
                    <td className="px-4 py-2">{requisition.requested_by?.name || "N/A"}</td>
                    <td className="px-4 py-2">{requisition.createdAt ? new Date(requisition.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td className="px-4 py-2">{requisition.status || "N/A"}</td>
                    <td className="px-4 py-2 flex gap-x-2">
                      <Button
                        onClick={() => handleStatusChange(requisition._id, requisition.status)}
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
                  <td colSpan="6" className="text-center px-4 py-2">No requisitions found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Requisition Dialog */}
      {isDialogVisible && selectedRequisition && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-8 rounded-md w-full max-w-6xl h-[80vh] overflow-y-auto relative">
            <h2 className="text-xl font-semibold mb-4">Change Status to Issue: Requisition</h2>
            {/* Close Button */}
            <button
              onClick={() => setIsDialogVisible(false)} // Close the dialog
              className="absolute top-4 right-4 text-2xl text-gray-900 hover:text-gray-700"
            >
              &times;
            </button>



            <form>
              <div className="mb-4">
                {/* Project Info */}
                <div className="mb-3">
                  <label htmlFor="requisition_code">Requisition Code</label>
                  <input
                    id="requisition_code"
                    type="text"
                    className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                    value={selectedRequisition.requisition_code}
                    disabled
                  />
                </div>


                <div className="mb-3">
                  <label className="block font-medium">Category Type</label>
                  <input type="text" className="w-full px-5 py-2 rounded-md border" value={selectedRequisition.categoryType || 'N/A'} disabled />
                </div>

                <div className="mb-3">
                  <label className="block font-medium">Category Code</label>
                  <input type="text" className="w-full px-5 py-2 rounded-md border" value={selectedRequisition.categoryCode || 'N/A'} disabled />
                </div>

                {/* Date of Requirement */}
                <div className="mb-3">
                  <label htmlFor="date_of_requirement">Date of Requirement</label>
                  <input
                    id="date_of_requirement"
                    type="text"
                    className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                    value={formatDate(selectedRequisition.date_of_requirement)}
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
                    value={getFieldValue(selectedRequisition.requested_by?.name)}
                    disabled
                  />
                </div>



                <div className="mb-3">
                  <label htmlFor="approved_by">Approved By</label>
                  <input
                    id="approved_by"
                    type="text"
                    className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                    value={getFieldValue(selectedRequisition.approved_by?.name)}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="issued_by">Issued By</label>
                  <input
                    id="issued_by"
                    type="text"
                    className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                    value={getFieldValue(selectedRequisition.issued_by?.name)}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="createdAt">Created At</label>
                  <input
                    id="createdAt"
                    type="text"
                    className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                    value={formatDate(selectedRequisition.createdAt)}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="updatedAt">Last Updated At</label>
                  <input
                    id="updatedAt"
                    type="text"
                    className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                    value={formatDate(selectedRequisition.updatedAt)}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="approved_at">Approved At</label>
                  <input
                    id="approved_at"
                    type="text"
                    className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                    value={formatDate(selectedRequisition.approved_at)}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="issued_at">Issued At</label>
                  <input
                    id="issued_at"
                    type="text"
                    className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                    value={formatDate(selectedRequisition.issued_at)}
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
                                                <th className="px-4 py-2 border">Quantity Issued</th>

                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequisition.items && selectedRequisition.items.length > 0 ? (
                        selectedRequisition.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 border">{item.class || 'N/A'}</td>
                            <td className="px-4 py-2 border">
                              {item.item_code} : {item.item_name || 'N/A'}
                            </td>
                            <td className="px-4 py-2 border">{item.quantity_required || 'N/A'}</td>
                            <td className="px-4 py-2 border">{item.unit_of_measure || 'N/A'}</td>
                            <td className="px-4 py-2 border">{item.description || 'N/A'}</td>
                            {/* Editable Remark Column */}
                            <td className="px-4 py-2 border">
                              <input
                                type="text"
                                value={item.remark || '-'}
                                disabled={selectedRequisition.status !== "Pending"}
                              />
                            </td>
                           
                            <td className="px-4 py-2 border">
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  className="p-2 border rounded border-gray-600 w-full"
                                  value={issuedItems[index]?.quantity_issued || ''}
                                  onChange={(e) => handleIssuedQuantityChange(index, e.target.value)}
                                />
                              </td>

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


                {/* Requisition Remarks */}
                <div className="mb-3">
                  <label htmlFor="remark">Requisition Remarks</label>
                  <textarea
                    id="remark"
                    className="w-full p-2 border rounded"
                    rows="3"

                    value={selectedRequisition.remark || '-'}
                  />
                </div>


                <div className="mb-3">
                  <label htmlFor="remark">Date Issued</label>
                  <input
                    type="date"
                    id="date_issued"
                    className="w-full p-2 border rounded"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
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

                    <option value="Issued">Issue</option>
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
                  className={`p-button-danger py-2 px-4 rounded-md ${selectedRequisition?.status === 'Approved' ? 'bg-green-400 text-white' : 'bg-gray-700 cursor-not-allowed text-white'}`}
                  onClick={handleDialogConfirm}
                  disabled={selectedRequisition?.status === 'Issued'}
                />



              </div>

            </form>
          </div>
        </div>
      )}



    </div>
  );
};

export default ViewApprovedRequisitionPage;
