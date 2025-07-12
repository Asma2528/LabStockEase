import { useState, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import OtherModel from './model.other'; // Modal component for adding new others
import { GoPlus } from "react-icons/go";

import { useGetAllOthersQuery, useDeleteOtherMutation } from '../../provider/queries/Other.query';
import Loader from '../../components/Loader';
import OtherCard from './Card.other'; // Create a similar Card for displaying others
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { toast } from 'sonner';
import { Button } from 'primereact/button';

const OtherPage = () => {
    const [visible, setVisible] = useState(false);
    const [searchParams, setSearchParams] = useState({
        description: '',
        otherCode: '',
        otherStatus: '',
        otherInCharge: '',
        otherDate: ''
    });
    const [filteredData, setFilteredData] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    const { isLoading, data, refetch } = useGetAllOthersQuery(searchParams);

    // Refetch data when search parameters change
    useEffect(() => {
        refetch();
    }, [refetch, searchParams]);

    // Update filteredData whenever new data is fetched
    useEffect(() => {
        if (data?.others) {
            setFilteredData(data.others);
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

    const [deleteOther] = useDeleteOtherMutation();

    const deleteHandler = (_id) => {
        setDialogVisible(true);
        confirmDialog({
            message: `Are you sure you want to delete this other?`,
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
                                const { data, error } = await deleteOther(_id);
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
            <BreadCrumbs PageLink='/Others' PageName='Others' />

            <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
                <button
                    onClick={() => setVisible(!visible)}
                    className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
                >
                    Register New Other <GoPlus />
                </button>
            </div>

            <div className="mt-10 flex justify-end w-[94%] mx-auto">
                <form onSubmit={handleSearchSubmit} className="mb-3 flex justify-end w-[90%] mx-auto gap-x-4">
                    <input name="otherCode" placeholder="Search by Other Code" className="w-1/4 p-2 border rounded" onChange={onSearchChange} value={searchParams.otherCode} />
                    <input name="description" placeholder="Search by Description" className="w-1/4 p-2 border rounded" onChange={onSearchChange} value={searchParams.description} />

                    <input name="otherInCharge" placeholder="Search by Other In-Charge" className="w-1/3 p-2 border rounded" onChange={onSearchChange} value={searchParams.otherInCharge} />
                    <input type="text" name="otherDate" placeholder="Search by Other Date" className="w-1/4 p-2 border rounded" onChange={onSearchChange} value={searchParams.otherDate}     onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")} />
                   

                    <select
                        name="otherStatus"
                        value={searchParams.otherStatus}
                        onChange={onSearchChange}
                        className="w-1/3 p-2 border rounded text-gray-500"
                    >
                        <option value="">Search by Status</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </form>
            </div>

            <div className="w-full pt-10">
                {isLoading ? <Loader /> : (
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 border-b uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Other Code</th>
                                    <th className="px-4 py-2">Description</th>
                                    <th className="px-4 py-2">Other Date</th>
                                    <th className="px-4 py-2">Sanction Date</th>
                                    <th className="px-4 py-2">Other Period</th>
                                    <th className="px-4 py-2">Funding Agency</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((other) => (
                                        <OtherCard key={other._id} data={other} onDelete={() => deleteHandler(other._id)} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center px-4 py-2">No others found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <OtherModel visible={visible} setVisible={setVisible} />
            <ConfirmDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} />
        </div>
    );
};

export default OtherPage;
