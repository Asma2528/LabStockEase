import { useState, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import InwardModel from './model.inwards';
import { GoPlus } from "react-icons/go";
import { useGetAllInwardsQuery, useDeleteInwardMutation } from '../../provider/queries/Inwards.query';
import Loader from '../../components/Loader';
import InwardCard from './Card.inwards';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { toast } from 'sonner';
import { Button } from 'primereact/button';

const InwardsPage = () => {
    const [visible, setVisible] = useState(false);
    const [searchParams, setSearchParams] = useState({
        inward_code:'',
        vendorCode: '',
        itemCode: '',
        billNo: '',
   class: '',
        createdAt: '',
    });
    
    const [filteredData, setFilteredData] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    const { isLoading, data, refetch } = useGetAllInwardsQuery(searchParams);


    // Refetch data when search parameters change
    useEffect(() => {
        refetch();
    }, [refetch, searchParams]);

    // Update filteredData whenever new data is fetched
    useEffect(() => {
        if (data?.inwards) {
            setFilteredData(data.inwards);
        }
    }, [data]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        setSearchParams((prev) => ({ ...prev }));  // Ensure state updates
        refetch();
    };
    
    

    const onSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prevParams) => ({
            ...prevParams,
            [name]: value.trim() !== "" ? value : undefined,  // ✅ Remove empty string issues
        }));
    };
    
    
    const [deleteInward] = useDeleteInwardMutation();

    const deleteHandler = (_id) => {
        setDialogVisible(true);
        confirmDialog({
            message: `Are you sure you want to delete this inward?`,
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
                                const { data, error } = await deleteInward(_id);
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
            <BreadCrumbs PageLink='/Inwards' PageName='Inwards' />

            <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
                <button
                    onClick={() => setVisible(!visible)}
                    className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
                >
                    Register New Inward <GoPlus />
                </button>
            </div>

            <div className="mt-10 flex justify-end w-[100%]  flex-col">
    <label htmlFor="Search">Search By:</label>
    <form onSubmit={handleSearchSubmit} className="mb-3 flex  w-[99%] gap-x-2 flex-wrap">
       
    <input
    name="inward_code"
    placeholder="Inward Code"
    type="text"
    className="w-2/12 p-2 border rounded"
    onChange={onSearchChange}
    value={searchParams.inward_code}
/>

        {/* Class Filter */}
        <select
            name="class"
            value={searchParams.class}
            onChange={onSearchChange}
            className="w-2/12 p-2  border rounded text-gray-500"
        >
            <option value="">Select Class</option>
            <option value="Chemicals">Chemicals</option>
            <option value="Books">Books</option>
            <option value="Glasswares">Glasswares</option>
            <option value="Consumables">Consumables</option>
            <option value="Equipments">Equipments</option>
            <option value="Others">Others</option>
        </select>   

        <input
    name="itemCode"
    placeholder="Item Code"
    type="text"
    className="w-1/12 p-2 border rounded"
    onChange={onSearchChange}
    value={searchParams.itemCode}
/>

<input
    name="vendorCode"
    placeholder="Vendor Code"
    type="text"
    className="w-2/12 p-2 border rounded"
    onChange={onSearchChange}
    value={searchParams.vendorCode}
/>

<input
    name="billNo"
    placeholder="Invoice Bill No"
    type="number"
    className="w-2/12 p-2 border rounded"
    onChange={onSearchChange}
    value={searchParams.billNo}
/>



<input 
                        name="createdAt" 
                        placeholder="Created At" 
                        type="text"   
                        className="w-1/6 p-2  border rounded"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                        onChange={onSearchChange} 
                        value={searchParams.createdAt} 
                    />



    </form>
</div>

            <div className="w-full pt-10">
                {isLoading ? <Loader /> : (
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700  border-b uppercase bg-gray-50">
                                <tr>
                                <th className="px-4 py-2">Class</th>
                                    <th className="px-4 py-2">Item Code</th>
                                    <th className="px-4 py-2">Quantity</th>
                                    <th className="px-4 py-2">Unit</th>
                                    <th className="px-4 py-2">Vendor Code</th>
                                    <th className="px-4 py-2">Invoice Bill No</th>
                                    <th className="px-4 py-2">Created At</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((inward) => (
                                        <InwardCard key={inward._id} data={inward} onDelete={() => deleteHandler(inward._id)} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center px-4 py-2">No inwards found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <InwardModel visible={visible} setVisible={setVisible} />
            <ConfirmDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} />
        </div>
    );
};

export default InwardsPage;
