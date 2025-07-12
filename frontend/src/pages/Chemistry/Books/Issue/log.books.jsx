import { useState } from 'react';
import BreadCrumbs from '../../../../components/BreadCrumbs';
// import Model from './log.model.books';
import BooksLogCard from './log.card.books';
// import { useGetBooksLogsQuery, useDeleteBooksLogMutation } from '../../../../provider/queries/Books.query';
import { useGetBooksLogsQuery } from '../../../../provider/queries/Books.query';
// import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
// import { toast } from 'sonner';
// import { Button } from 'primereact/button';

const BooksLogsPage = () => {
    // const [visible, setVisible] = useState(false);
    // const [dialogVisible, setDialogVisible] = useState(false);

    const [searchParams, setSearchParams] = useState({
        item_code: '',
        item_name: '',
        user_email: '',
        date_issued: '',  // Single date filter
    });

    const { data: logs, isLoading, isFetching, refetch } = useGetBooksLogsQuery(searchParams);
    // const [deleteBooksLog] = useDeleteBooksLogMutation();

    const onSearchChange = (e) => {
        
        const { name, value } = e.target;
        setSearchParams((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        refetch(); // Fetch logs with updated search parameters
    };

    // const deleteHandler = (_id) => {
    //     setDialogVisible(true);
    //     confirmDialog({
    //         message: "Are you sure you want to delete this log?",
    //         header: 'Confirm Deletion',
    //         icon: 'pi pi-exclamation-triangle',
    //         footer: (
    //             <div className="p-dialog-footer">
    //                 <Button 
    //                     label="Yes, Delete it" 
    //                     icon="pi pi-check" 
    //                     className="p-button-danger" 
    //                     onClick={async () => {
    //                         try {
    //                             const { data, error } = await deleteBooksLog(_id);
    //                             if (error) {
    //                                 toast.error(error.data.message);
    //                                 return;
    //                             }
    //                             toast.success(data.msg);
    //                             refetch();
    //                         } catch (e) {
    //                             toast.error(e.message);
    //                         } finally {
    //                             setDialogVisible(false);
    //                         }
    //                     }} 
    //                 />
    //                 <Button 
    //                     label="No, Keep it"     
    //                     icon="pi pi-times" 
    //                     className="p-button-secondary" 
    //                     onClick={() => setDialogVisible(false)}
    //                 />
    //             </div>
    //         ),
    //     });
    // };

    return (
        <>
            <div className="w-full flex flex-wrap justify-evenly mt-10">
                <BreadCrumbs PageLink='/Books' PageName='Book Log' />

                {/* <div className="mb-3 flex justify-end w-[85%] mx-auto gap-x-6">
                    <button
                        onClick={() => setVisible(!visible)}
                        className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2"
                    >
                        Issue Item
                    </button>
                </div> */}

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="mt-10 flex justify-end w-[90%] mx-auto gap-x-4">
                    <input name="item_code" placeholder="Item Code" className="w-1/5 p-2 border rounded" onChange={onSearchChange} />
                 
                    <input name="item_name" placeholder="Item Name" className="w-1/5 p-2 border rounded" onChange={onSearchChange} />
                    <input
            name="date_issued"
            type="text"
          placeholder="Date Issued"
            className="w-1/6 p-2 border rounded"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            onChange={onSearchChange}
          />
                    <input name="user_email" placeholder="User Email" className="w-1/5 p-2 border rounded" onChange={onSearchChange} />
                </form>

                <div className="w-full pt-10">
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 border-b uppercase bg-gray-50">
                                <tr>
                                <th className="px-4 py-2">Request</th>
                                    <th className="px-4 py-2">Item</th>
                                    <th className="px-4 py-2">Issued Quantity</th>
                                    <th className="px-4 py-2">User</th>
                                    <th className="px-4 py-2">Date Issued</th>
                                      <th className="px-4 py-2">Date Return</th>
                                    {/* <th className="px-4 py-2">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading || isFetching ? (
                                    <tr>
                                        <td colSpan="6" className="text-center px-4 py-2">Loading..</td>
                                    </tr>
                                ) : Array.isArray(logs) && logs.length > 0 ? (
                                    logs.map(log => (
                                        // <BooksLogCard key={log._id} data={log} onDelete={() => deleteHandler(log._id)} />
                                        <BooksLogCard key={log._id} data={log} />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center px-4 py-2">No log items found</td>
                                    </tr>
                                )
                                
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* <Model visible={visible} setVisible={setVisible} /> */}
                {/* <ConfirmDialog visible={dialogVisible} onHide={() => setDialogVisible(false)} /> */}
            </div>
        </>
    );
};

export default BooksLogsPage;
