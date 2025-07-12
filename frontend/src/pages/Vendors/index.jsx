import { useState, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import VendorModel from './model.vendors';
import { GoPlus } from "react-icons/go";

import { useGetAllVendorsQuery, useDeleteVendorMutation } from '../../provider/queries/Vendors.query';
import Loader from '../../components/Loader';
import VendorCard from './Card.vendors';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { toast } from 'sonner';
import { Button } from 'primereact/button';

const VendorsPage = () => {
    const [visible, setVisible] = useState(false);
    const [searchParams, setSearchParams] = useState({ code: '', name: '', contact_person: '', classification: '', address: '', grading: '' });
    const [filteredData, setFilteredData] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    const { isLoading, data, refetch } = useGetAllVendorsQuery(searchParams);

    // Refetch data when search parameters change
    useEffect(() => {
        refetch();
    }, [refetch, searchParams]);

    // Update filteredData whenever new data is fetched
    useEffect(() => {
        if (data?.vendors) {
            setFilteredData(data.vendors);
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

    const [deleteVendor] = useDeleteVendorMutation();

    const deleteHandler = (_id) => {
        setDialogVisible(true);
        confirmDialog({
            message: `Are you sure you want to delete this vendor?`,
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
                                const { data, error } = await deleteVendor(_id);
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
                        className="p-button-secondary p-2 rounded-md bg-blue-900 text-white inline-flex items-center ml-2 pr-4" 
                        onClick={() => setDialogVisible(false)}
                    />
                </div>
            ),
        });
    };

    return (
        <div className="w-full flex flex-wrap justify-evenly mt-10">
            <BreadCrumbs PageLink='/Vendors' PageName='Vendors' />

            <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
                <button
                    onClick={() => setVisible(!visible)}
                    className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
                >
                    Register New Vendor <GoPlus />
                </button>
            </div>

            <div className="mt-10 flex justify-end w-[94%] mx-auto">
                <form onSubmit={handleSearchSubmit} className="mb-3 flex justify-end w-[90%] mx-auto gap-x-4">
                    <input name="code" placeholder="Search by Code" className="w-1/4 p-2 border rounded" onChange={onSearchChange} value={searchParams.code} />
                    <input name="name" placeholder="Search by Name" className="w-1/4 p-2 border rounded" onChange={onSearchChange} value={searchParams.name} />
                    <input name="contact_person" placeholder="Search by Contact Person" className="w-1/3 p-2 border rounded" onChange={onSearchChange} value={searchParams.contact_person} />
                  {/* Classification Dropdown */}
    <select
        name="Class"
        value={searchParams.classification}
        onChange={onSearchChange}
        className="w-1/3 p-2 border rounded text-gray-500"
    >
        <option value="">Search by Classification</option>
        <option value="Capital">Capital</option>
        <option value="Consumables">Consumables</option>
        <option value="Chemicals">Chemicals</option>
        <option value="Glassware">Glassware</option>
        <option value="Books">Books</option>
        <option value="Others">Others</option>
    </select>

    {/* Grading Dropdown */}
    <select
        name="grading"
        value={searchParams.grading}
        onChange={onSearchChange}
        className="w-1/3 p-2 border rounded text-gray-500"
    >
        <option value="">Search by Grading</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
    </select>
                </form>
            </div>

            <div className="w-full pt-10">
                {isLoading ? <Loader /> : (
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 border-b uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Code</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Contact Person</th>
                                    <th className="px-4 py-2">Contact No.</th>
                                    <th className="px-4 py-2">Class</th>
                                    <th className="px-4 py-2">Address</th>
                                    <th className="px-4 py-2">Grading</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((vendor) => (
                                        <VendorCard key={vendor._id} data={vendor} onDelete={() => deleteHandler(vendor._id)} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center px-4 py-2">No vendors found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <VendorModel visible={visible} setVisible={setVisible} />
            <ConfirmDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} />
        </div>
    );
};

export default VendorsPage;
