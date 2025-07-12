import { useState, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import OrderModel from './model.orders';
import { GoPlus } from "react-icons/go";
import { useGetAllOrdersQuery, useDeleteOrderMutation } from '../../provider/queries/Orders.query';
import Loader from '../../components/Loader';
import OrderCard from './Card.orders';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { toast } from 'sonner';
import { Button } from 'primereact/button';

const OrdersPage = () => {
    const [visible, setVisible] = useState(false);
    const [searchParams, setSearchParams] = useState({ orderNumber: '', poNumber: '', class: '', status: '', quotationDate: '', createdAt: '' });
    const [filteredData, setFilteredData] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    const { isLoading, data, refetch } = useGetAllOrdersQuery(searchParams);


    // Refetch data when search parameters change
    useEffect(() => {
        refetch();
    }, [refetch, searchParams]);

    // Update filteredData whenever new data is fetched
    useEffect(() => {
        if (data?.orders) {
            setFilteredData(data.orders);
        }
    }, [data]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
    
        // Convert frontend-friendly filter names to backend-compatible ones
        const updatedFilters = {
            ...searchParams,
            "items.class": searchParams.class, // Map 'class' to 'items.class' for backend compatibility
        };
    
        delete updatedFilters.class; // Remove redundant 'class' field to avoid conflicts
    
        setSearchParams(updatedFilters);
        refetch();
    };
    

    const onSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prevParams) => ({
            ...prevParams,
            [name]: value,
        }));
    };

    const [deleteOrder] = useDeleteOrderMutation();

    const deleteHandler = (_id) => {
        setDialogVisible(true);
        confirmDialog({
            message: `Are you sure you want to delete this order?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            footer: (
                <div className="p-dialog-footer">
                    <Button
                        label="Yes, Delete it"
                        icon="pi pi-check" 
                        className="p-button-danger rounded-md bg-red-500 text-white inline-flex items-center p-2 justify-center pr-4" 
                        onClick={async () => {
                            try {
                                const { data, error } = await deleteOrder(_id);
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
                        className="p-button-secondary p-2 rounded-md bg-green-600 text-white inline-flex items-center ml-2 pr-4" 
                        onClick={() => setDialogVisible(false)}
                    />
                </div>
            ),
        });
    };

    return (
        <div className="w-full flex flex-wrap justify-evenly mt-10">
            <BreadCrumbs PageLink='/Orders' PageName='Orders' />

            <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
                <button
                    onClick={() => setVisible(!visible)}
                    className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
                >
                    Register New Order <GoPlus />
                </button>
            </div>

            <div className="mt-10 flex justify-end w-[100%] mx-auto flex-col">
            <label className="my-3 ml-14" htmlFor="Search">Search By:</label>
                <form onSubmit={handleSearchSubmit} className="mb-3 flex justify-end w-[90%] mx-auto gap-x-4">
                    
                    {/* Search by Order Number */}
                    <input 
                        name="orderNumber" 
                        placeholder="Order Number" 
                        className="w-1/2 p-2 border rounded" 
                        onChange={onSearchChange} 
                        value={searchParams.orderNumber} 
                    />

                    {/* Search by PO Number */}
                    <input 
                        name="poNumber" 
                        placeholder="PO Number" 
                        className="w-1/2 p-2 border rounded" 
                        onChange={onSearchChange} 
                        value={searchParams.poNumber} 
                    />

                    {/* Search by Quotation Date */}
                    <input 
                        name="quotationDate" 
                        placeholder="Quotation Date" 
                        type="text"   
                        className="w-1/2 p-2 border rounded"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                        onChange={onSearchChange} 
                        value={searchParams.quotationDate} 
                    />
                 

                    {/* Status Dropdown */}
                    <select
                        name="status"
                        value={searchParams.status}
                        onChange={onSearchChange}
                        className="w-1/3 p-2 border rounded text-gray-500"
                    >
                        <option value="">Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Received">Received</option>
                    </select>

                    {/* Class Dropdown (New Filter) */}
                    <select
                        name="class"
                        value={searchParams.class}
                        onChange={onSearchChange}
                        className="w-1/3 p-2 border rounded text-gray-500"
                    >
                        <option value="">Class</option>
                        <option value="Chemical">Chemical</option>
                        <option value="Books">Books</option>
                        <option value="Glasswares">Glassware</option>
                        <option value="Consumables">Consumables</option>
                        <option value="Equipments">Equipment</option>
                        <option value="Others">Others</option>
                    </select>
                </form>
            </div>

            <div className="w-full pt-10">
                {isLoading ? <Loader /> : (
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 border-b uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Order Number</th>
                                    <th className="px-4 py-2">PO Number</th>
    
                                    <th className="px-4 py-2">Vendor</th>
                        
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((order) => (
                                        <OrderCard key={order._id} data={order} onDelete={() => deleteHandler(order._id)} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center px-4 py-2">No orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <OrderModel visible={visible} setVisible={setVisible} />
            <ConfirmDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} />
        </div>
    );
};

export default OrdersPage;
