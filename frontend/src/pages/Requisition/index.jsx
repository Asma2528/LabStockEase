import { useState, useEffect } from "react";
import BreadCrumbs from "../../components/BreadCrumbs";
import Model from "./model.requisition"; // Create Requisition Modal
import { GoPlus } from "react-icons/go";
import {
  useGetUserRequisitionsQuery,
  useDeleteRequisitionMutation,
} from "../../provider/queries/Requisition.query";
import Loader from "../../components/Loader";
import RequisitionCard from "./card.requisition";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { toast } from "sonner";
import { Button } from "primereact/button";

const RequisitionPage = () => {
  const [visible, setVisible] = useState(false);
  const [searchParams, setSearchParams] = useState({
    requisition_code:'',
    categoryType: "",
     categoryCode: "",
    item: "",
    status: "",
    date_of_requirement: "",
    requested_by: "", // Added requested_by filter
  });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  // Fetching user requisitions data with search parameters
  const { isLoading, data, refetch } = useGetUserRequisitionsQuery(searchParams);


  // Refetch the data whenever searchParams change
  useEffect(() => {
    if (data) {
      setFilteredData(data || []);
    }
  }, [data]);
  


  const [deleteRequisition] = useDeleteRequisitionMutation();

  // Handle search input changes
  const onSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

   // Confirm and handle deletion of a requisition
   const handleDelete = (id) => {
    setDialogVisible(true);
    confirmDialog({
      message: 'Are you sure you want to delete this requisition?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      footer: (
        <div className="p-dialog-footer flex justify-end gap-2">
          <Button
            label="Yes, Delete it"
            icon="pi pi-check"
            className="p-button-danger p-2 rounded-md bg-red-500 text-white"
            onClick={async () => {
              try {
                const { data, error } = await deleteRequisition(id);
                if (error) {
                  toast.error(error.data.message);
                  return;
                }
                toast.success(data.msg);
                refetch();
              } catch (e) {
                toast.error(e.message);
              } finally {
                setDialogVisible(false);
              }
            }}
          />
          <Button
            label="No, Keep it"
            icon="pi pi-times"
            className="p-button-secondary p-2 rounded-md bg-green-600 text-white"
            onClick={() => setDialogVisible(false)}
          />
        </div>
      ),
    });
  };


  

  return (
    <div className="w-full flex flex-col items-center mt-10">
      <BreadCrumbs PageLink="/Requisition" PageName="Requisition" />

      <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
        <button
          onClick={() => setVisible(true)}
          className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
        >
          Create Request <GoPlus />
        </button>
      </div>

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

      <div className="w-full pt-4">
        {isLoading ? (
          <Loader />
        ) : (
          <div className="relative overflow-x-auto shadow">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 border-b uppercase bg-gray-50">
                <tr>
                <th className="px-4 py-2"> Requisition Code</th>
                  <th className="px-4 py-2">Category Type</th>
                  <th className="px-4 py-2">Category Code</th>
                  <th className="px-4 py-2">Date of Requirement</th>
                  <th className="px-4 py-2">Requested By</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
            
              <tbody>
  {Array.isArray(filteredData) && filteredData.length > 0 ? (
    filteredData.map((requisition) => (
      <RequisitionCard
        key={requisition._id}
        data={requisition}
        onDelete={() => handleDelete(requisition._id)}
      />
      
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center px-4 py-2">
        No requisitions found
      </td>
    </tr>
  )}
</tbody>

             
            </table>
          </div>
        )}
      </div>

      <Model visible={visible} setVisible={setVisible} />
      <ConfirmDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} />
    </div>
  );
};

export default RequisitionPage;
