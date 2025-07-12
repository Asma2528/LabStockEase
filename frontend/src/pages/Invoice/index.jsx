import { useState, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import InvoiceModel from './model.invoice';
import { GoPlus } from "react-icons/go";
import { useGetAllInvoicesQuery, useDeleteInvoiceMutation } from '../../provider/queries/Invoice.query';
import Loader from '../../components/Loader';
import InvoiceCard from './Card.invoice';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { toast } from 'sonner';
import { Button } from 'primereact/button';

const InvoicesPage = () => {
    const [visible, setVisible] = useState(false);
    const [searchParams, setSearchParams] = useState({ orderNumber: '', poNumber: '', billNo: '', billDate: '', status: '' });
    const [filteredData, setFilteredData] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    const { isLoading, data, refetch } = useGetAllInvoicesQuery(searchParams);

    // Refetch data when search parameters change
    useEffect(() => {
        refetch();
    }, [refetch, searchParams]);

    // Update filteredData whenever new data is fetched
    useEffect(() => {
        if (data?.invoices) {
            setFilteredData(data.invoices);
        }
    }, [data]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        refetch();
    };
    
    

    const onSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prevParams => ({
            ...prevParams,
            [name]: value.trim(),  // Trim to avoid extra spaces causing mismatches
        }));
    };
    

    const [deleteInvoice] = useDeleteInvoiceMutation();

    const deleteHandler = (_id) => {
        setDialogVisible(true);
        confirmDialog({
            message: `Are you sure you want to delete this invoice?`,
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
                                const { data, error } = await deleteInvoice(_id);
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
            <BreadCrumbs PageLink='/Invoices' PageName='Invoices' />

            <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
                <button
                    onClick={() => setVisible(!visible)}
                    className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
                >
                    Register New Invoice <GoPlus />
                </button>
            </div>

            <div className="mt-10 flex justify-end w-[100%] mx-auto flex-col">
            <label className="my-3 ml-14" htmlFor="Search">Search By:</label>
                <form onSubmit={handleSearchSubmit} className="mb-3 flex justify-end w-[90%] mx-auto gap-x-4">
                    
                    {/* Search by Invoice Number */}
                    <input 
                        name="orderNumber" 
                        placeholder="Enter Order Number" 
                        className="w-1/2 p-2  rounded" 
                        onChange={onSearchChange} 
                        value={searchParams.orderNumber} 
                    />

                    {/* Search by PO Number */}
                    <input 
                        name="poNumber" 
                        placeholder="PO Number" 
                        className="w-1/2 p-2  rounded" 
                        onChange={onSearchChange} 
                        value={searchParams.poNumber} 
                    />

<input 
                        name="billNo" 
                        placeholder="Bill No" 
                        className="w-1/2 p-2  rounded" 
                        onChange={onSearchChange} 
                        value={searchParams.billNo} 
                    />

                    {/* Search by Quotation Date */}
                    <input 
                        name="billDate" 
                        placeholder="Bill Date" 
                        type="text"   
                        className="w-1/2 p-2 rounded"
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
                        className="w-1/3 p-2  rounded text-gray-500"
                    >
                        <option value="">Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="On hold">On Hold</option>
                    </select>

                 
                </form>
            </div>

            <div className="w-full pt-10">
                {isLoading ? <Loader /> : (
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 binvoice-b uppercase bg-gray-50">
                                <tr><th className="px-4 py-2">Order</th>
                                    <th className="px-4 py-2">Bill Number</th>
                                    <th className="px-4 py-2">Bill Date</th>
                                    <th className="px-4 py-2">Invoice Amount</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((invoice) => (
                                        <InvoiceCard key={invoice._id} data={invoice} onDelete={() => deleteHandler(invoice._id)} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center px-4 py-2">No invoices found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <InvoiceModel visible={visible} setVisible={setVisible} />
            <ConfirmDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} />
        </div>
    );
};

export default InvoicesPage;
