import { useState, useEffect } from "react";
import BreadCrumbs from "../../components/BreadCrumbs";
import Model from "./model.new.indent"; // Create Requisition Modal
import { GoPlus } from "react-icons/go";
import {useGetUserNewIndentsQuery,useDeleteNewIndentMutation} from "../../provider/queries/New.Indent.query";
import Loader from "../../components/Loader";
import NewIndentCard from "./card.new.indent";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { toast } from "sonner";
import { Button } from "primereact/button";

const NewIndentPage = () => {
  const [visible, setVisible] = useState(false);
  const [searchParams, setSearchParams] = useState({
    newindent_code:"",
       categoryType: "",
     categoryCode: "",

    status: "",
    date_of_requirement: "",
    requested_by: "", // Added requested_by filter
  });
  const [dialogVisible, setDialogVisible] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  // Fetching user requisitions data with search parameters
  const { isLoading, data, refetch } = useGetUserNewIndentsQuery(searchParams);



  // Refetch the data whenever searchParams change
  useEffect(() => {
    if (data) {
      setFilteredData(data || []);
    }
  }, [data]);
  


  const [deleteNewIndent] = useDeleteNewIndentMutation();

  // Handle search input changes
  const onSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

   // Confirm and handle deletion of a requisition
   const handleDelete = (id) => {
    setDialogVisible(true);
    confirmDialog({
      message: 'Are you sure you want to delete this new indent?',
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
                const { data, error } = await deleteNewIndent(id);
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
      <BreadCrumbs PageLink="/New-Indent" PageName="New Indent" />

      <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
        <button
          onClick={() => setVisible(true)}
          className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
        >
          Create New Indent <GoPlus />
        </button>
      </div>

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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Ordered">Ordered</option>
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
  {Array.isArray(filteredData) && filteredData.length > 0 ? (
    filteredData.map((newIndent) => (
      <NewIndentCard
        key={newIndent._id}
        data={newIndent}
        onDelete={() => handleDelete(newIndent._id)}
      />
      
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center px-4 py-2">
        No New Indents found
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

export default NewIndentPage;
