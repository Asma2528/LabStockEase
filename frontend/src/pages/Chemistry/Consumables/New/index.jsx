import { useState, useEffect } from 'react';
import BreadCrumbs from '../../../../components/BreadCrumbs';
import Model from './model.consumables';
import { GoPlus } from "react-icons/go";
import { useGetAllConsumablesItemsQuery } from '../../../../provider/queries/Consumables.query';
import Loader from '../../../../components/Loader';
import ConsumablesCard from './Card.consumables';
import { useNavigate } from 'react-router-dom';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { toast } from 'sonner';
import { Button } from 'primereact/button';
import { useDeleteConsumablesItemMutation } from '../../../../provider/queries/Consumables.query';
import ReportButton from './ReportButton';

const ConsumablesPage = () => {
    const [visible, setVisible] = useState(false);
    const [searchParams, setSearchParams] = useState({ item_code: '', item_name: '', casNo:'',company: '', status: '' });
    const [filteredData, setFilteredData] = useState([]); // State to store filtered items
    const [dialogVisible, setDialogVisible] = useState(false);

    const navigate = useNavigate();
    const { isLoading, data, refetch } = useGetAllConsumablesItemsQuery(searchParams);

    // Refetch data whenever searchParams change
    useEffect(() => {
        refetch();
    }, [refetch, searchParams]);

    // Update filteredData whenever new data is fetched
    useEffect(() => {
        if (data?.items) {
            setFilteredData(data.items); // Update filteredData state with the latest data
        }
    }, [data]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        refetch();
    };

    const onSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    const [DeleteConsumablesItem] = useDeleteConsumablesItemMutation();

    const deleteHandler = (_id) => {
        setDialogVisible(true);
        confirmDialog({
            message: `Are you sure you want to delete this item?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            footer: (
                <div className="p-dialog-footer">
                    <Button
                        label="Yes, Delete it"
                        icon="pi pi-check"
                        className="p-button-danger p-2 rounded-md bg-red-500 text-white"
                        onClick={async () => {
                                                           
                            try {
                                const { data, error } = await DeleteConsumablesItem(_id);
                                if (error) {
                                    toast.error(error.data.message);
                                    return;
                                }
                                toast.success(data.msg);
                                refetch(); // Refetch data after deletion to update the list
                            } catch (e) {
                                toast.error(e.message);
                            } finally {
                                setDialogVisible(false);
                            }
                        }}
                    />
                    <Button
                        label="No, keep it"
                        icon="pi pi-times"
                        className="p-button-secondary p-button-success p-2 rounded-md bg-green-600 text-white mx-5"
                        onClick={() => setDialogVisible(false)}
                    />
                </div>
            ),
        });
    };

    return (
        <div className="w-full flex flex-wrap justify-evenly mt-10">
            <BreadCrumbs PageLink='/Consumables' PageName='Consumable' />

            <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
                <button
                    onClick={() => setVisible(!visible)}
                    className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
                >
                    Register New Consumable <GoPlus />
                </button>

                <button
                    onClick={() => navigate('/chemistry/consumables/restock')}
                    className="px-4 rounded-md py-2 bg-teal-400 text-white inline-flex items-center gap-x-2"
                >
                    Stock Refill <GoPlus />
                </button>

                <button
                    onClick={() => navigate('/chemistry/consumables/logs')}
                    className="px-4 rounded-md py-2 bg-yellow-400 text-white inline-flex items-center gap-x-2"
                >
                    View Issue Logs
                </button>
                  <ReportButton data={data} />
            </div>

            <div className="mt-10 flex justify-end w-[90%] mx-auto">
                <form onSubmit={handleSearchSubmit} className="mb-3 flex justify-end w-[90%] mx-auto gap-x-4">
                    <input
                        name="item_code"
                        placeholder="Search by Item Code"
                        className="w-1/4 p-2 border rounded"
                        onChange={onSearchChange}
                        value={searchParams.item_code}
                    />
                    <input
                        name="item_name"
                        placeholder="Search by Item Name"
                        className="w-1/4 p-2 border rounded"
                        onChange={onSearchChange}
                        value={searchParams.item_name}
                    />
                        <input
                        name="casNo"
                        placeholder="Search by CAS No"
                        className="w-1/4 p-2 border rounded"
                        onChange={onSearchChange}
                        value={searchParams.casNo}
                    />
                    <input
                        name="company"
                        placeholder="Search by Company"
                        className="w-1/4 p-2 border rounded"
                        onChange={onSearchChange}
                        value={searchParams.company}
                    />
                        <select
                        name="status"
                        value={searchParams.status}
                        onChange={onSearchChange}
                        className="w-1/5 p-2 border rounded text-gray-500"
                    >
                        <option value="">Status</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="In Stock">In Stock</option>
                    </select>

                
                </form>
            </div>

            <div className="w-full pt-10">
                {isLoading ? (
                    <Loader />
                ) : (
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 border-b uppercase bg-gray-50">
                                <tr className="border-b">
                                    <th scope="col" className="px-4 py-2">Item Code</th>
                                    <th scope="col" className="px-4 py-2">Item Name</th>
                                    <th scope="col" className="px-4 py-2">CAS No</th>
                                    <th scope="col" className="px-4 py-2">Total Quantity</th>
                                    <th scope="col" className="px-4 py-2">Current Quantity</th>
                                    <th scope="col" className="px-4 py-2">Status</th>
                                    <th scope="col" className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((c) => (
                                        <ConsumablesCard
                                            key={c._id}
                                            data={c}
                                            onDelete={() => deleteHandler(c._id)}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center px-4 py-2">No items found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Model visible={visible} setVisible={setVisible} />
            <ConfirmDialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                acceptClassName='p-button-danger p-dialog-footer'
                contentClassName='py-4'
            />
        </div>
    );
};

export default ConsumablesPage;
