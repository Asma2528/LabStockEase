import { useState, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs.jsx';
import Loader from '../../components/Loader';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { toast } from 'sonner';
import { Button } from 'primereact/button';
import { useDeleteUserMutation, useFetchAllUsersQuery } from '../../provider/queries/Auth.query';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import UpdateModel from './UpdateModel.user.jsx';

const UserPage = () => {
    const [filteredData, setFilteredData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchParams, setSearchParams] = useState({ name: '', email: '', roles: '' });
    const [dialogVisible, setDialogVisible] = useState(false); // ✅ Added state for dialog visibility

    const { isLoading, data, refetch } = useFetchAllUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [updateVisible, setUpdateVisible] = useState(false);

    useEffect(() => {
        if (data) {
            const filtered = data.filter((user) => {
                const matchesName = user.name.toLowerCase().includes(searchParams.name.toLowerCase());
                const matchesEmail = user.email.toLowerCase().includes(searchParams.email.toLowerCase());
                const matchesRole = searchParams.roles ? user.roles.includes(searchParams.roles) : true;
                return matchesName && matchesEmail && matchesRole;
            });
            setFilteredData(filtered);
        }
    }, [data, searchParams]);

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDelete = (_id) => {
        setDialogVisible(true); // ✅ Show the dialog when delete is triggered
        confirmDialog({
            message: "Are you sure you want to delete this user?",
            header: "Confirm Deletion",
            icon: "pi pi-exclamation-triangle text-red-500 text-2xl",
            className: "p-dialog-sm",
            acceptClassName: "hidden",
            rejectClassName: "hidden",
            footer: (
                <div className="flex justify-center gap-4 mt-4">
                    <Button
                        label="Yes, Delete it"
                        icon="pi pi-check"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all duration-300 flex items-center gap-2"
                        onClick={async () => {
                            try {
                                await deleteUser(_id).unwrap();
                                toast.success("User deleted successfully");
                                refetch();
                            } catch (error) {
                                toast.error(error?.data?.message || "Failed to delete user");
                            } finally {
                                setDialogVisible(false); // ✅ Hide the dialog after action
                            }
                        }}
                    />
                    <Button
                        label="No, Keep it"
                        icon="pi pi-times"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all duration-300 flex items-center gap-2"
                        onClick={() => setDialogVisible(false)} 
                    />
                </div>
            ),
        });
    };

    return (
        <div className="w-full flex flex-wrap justify-evenly mt-10">
            <BreadCrumbs PageLink="/user" PageName="Users" />

            <div className="mt-10 flex justify-end w-[94%] mx-auto">
                <form className="mb-3 flex justify-end w-[90%] mx-auto gap-x-4">
                    <input
                        name="name"
                        placeholder="Search by Name"
                        className="w-1/5 p-2 border rounded"
                        onChange={handleSearchChange}
                        value={searchParams.name}
                    />
                    <input
                        name="email"
                        placeholder="Search by Email ID"
                        className="w-1/3 p-2 border rounded"
                        onChange={handleSearchChange}
                        value={searchParams.email}
                    />
                    <select
                        name="roles"
                        value={searchParams.roles}
                        onChange={handleSearchChange}
                        className="w-1/4 p-2 border rounded text-gray-500"
                    >
                        <option value="">Search by Roles</option>
                        <option value="admin">Admin</option>
                        <option value="lab-assistant">Lab Assistant</option>
                        <option value="faculty">Faculty</option>
                        <option value="manager">Manager</option>
                        <option value="stores">Stores</option>
                        <option value="accountant">Accountant</option>
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
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email ID</th>
                                    <th className="px-4 py-2">Roles</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((user) => (
                                        <tr key={user._id} className="bg-white border-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
                                            <td className="px-4 py-2 font-medium">{user.name}</td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2">{user.roles.join(", ")}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center">
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setUpdateVisible(true);
                                                        }}
                                                        title="Edit"
                                                        className="p-3 bg-lime-400 text-white rounded-sm mx-2"
                                                    >
                                                        <FaRegEdit className="text-xl" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDelete(user._id)}
                                                        title="Delete"
                                                        className="p-3 bg-red-500 text-white rounded-sm mx-2"
                                                    >
                                                        <FaRegTrashAlt className="text-xl" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <UpdateModel visible={updateVisible} setVisible={setUpdateVisible} item={selectedUser} />

            {/* ✅ Corrected ConfirmDialog */}
            <ConfirmDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} />
        </div>
    );
};

export default UserPage;
