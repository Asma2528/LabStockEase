import { useState } from "react";
import BreadCrumbs from "../../../../components/BreadCrumbs";
import RestockModel from "./restock.models.consumables";
import { GoPlus } from "react-icons/go";
import {
  useGetAllRestockItemsQuery,
  useDeleteRestockItemMutation,
} from "../../../../provider/queries/Consumables.query";
import RestockCard from "./restock.card.consumables";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { toast } from "sonner";
import { Button } from "primereact/button";

const ConsumablesRestockPage = () => {
  const [visible, setVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [searchParams, setSearchParams] = useState({
    consumable: "",
    expiration_date: "",
    location: "",
    inward_code: "",
  });

  const { data, isLoading, isFetching, refetch } =
    useGetAllRestockItemsQuery(searchParams);

  // Handle search input changes
  const onSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    refetch();
  };

  const [deleteRestockItem] = useDeleteRestockItemMutation();

  const deleteHandler = (_id) => {
    confirmDialog({
      message: `Are you sure you want to delete this restock item?`,
      header: "Confirm Deletion",
      icon: "pi pi-exclamation-triangle",
      footer: (
        <div className="p-dialog-footer">
          <Button
            label="Yes, Delete it"
            icon="pi pi-check"
            className="p-button-danger"
            onClick={async () => {
              try {
                const { data, error } = await deleteRestockItem(_id);
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
            className="p-button-secondary"
            onClick={() => setDialogVisible(false)}
          />
        </div>
      ),
    });
  };

  return (
    <>
      <div className="w-full flex flex-wrap justify-evenly mt-10">
        <BreadCrumbs PageLink="/Restock" PageName="Restock Items" />

        <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
          <button
            onClick={() => setVisible(!visible)}
            className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
          >
            Register Restock Item <GoPlus />
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-10 flex justify-end w-[90%] mx-auto gap-x-4"
        >
          <input
            name="consumable"
            placeholder="Search By Item Code"
            className="w-1/5 p-2 border rounded"
            onChange={onSearchChange}
          />
        
          <input
            name="inward_code"
            placeholder="Search by Inward Code"
            className="w-1/5 p-2 border rounded"
            onChange={onSearchChange}
          />
          <input
            name="location"
            placeholder="Search By Location"
            className="w-1/5 p-2 border rounded"
            onChange={onSearchChange}
          />
        <input 
                        name="expiration_date" 
                        placeholder="Search using Expiration Date" 
                        type="text"   
                        className="w-1/4 p-2  border rounded"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                        onChange={onSearchChange} 
                        value={searchParams.expiration_date} 
                    />

        </form>

        <div className="w-full pt-10">
          <div className="relative overflow-x-auto shadow">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 border-b uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Consumable</th>
                  <th className="px-4 py-2">Quantity Purchased</th>
                  <th className="px-4 py-2">Inward Code</th>
                  <th className="px-4 py-2">Expiration Date</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading || isFetching ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Loading..
                    </td>
                  </tr>
                ) : data && Array.isArray(data) && data.length > 0 ? (
                  data.map((c) => (
                    <RestockCard
                      key={c._id}
                      data={c}
                      onDelete={() => deleteHandler(c._id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center px-4 py-2">
                      No items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <RestockModel visible={visible} setVisible={setVisible} />
        <ConfirmDialog
          visible={dialogVisible}
          onHide={() => setDialogVisible(false)}
        />
      </div>
    </>
  );
};

export default ConsumablesRestockPage;
