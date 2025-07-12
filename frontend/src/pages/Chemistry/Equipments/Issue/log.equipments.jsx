import { useState } from 'react';
import BreadCrumbs from '../../../../components/BreadCrumbs';
import EquipmentsLogCard from './log.card.equipments';
import { useGetEquipmentsLogsQuery} from '../../../../provider/queries/Equipments.query';
import ReportButton from './ReportButton';

const EquipmentsLogsPage = () => {

    const [searchParams, setSearchParams] = useState({
        item_code: '',
        item_name: '',
        user_email: '',
        date_issued: '',  // Single date filter
    });

    const { data: logs, isLoading, isFetching, refetch } = useGetEquipmentsLogsQuery(searchParams);
    const onSearchChange = (e) => {
        
        const { name, value } = e.target;
        setSearchParams((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        refetch(); // Fetch logs with updated search parameters
    };



    return (
        <>
            <div className="w-full flex flex-wrap justify-evenly mt-10">
                <BreadCrumbs PageLink='/Equipments' PageName='Equipment Log' />

             <div className='w-[90%] mx-auto flex justify-end'>
                <ReportButton data={{ items: logs }} />
             </div>

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
                                    <th className="px-4 py-2">Date Issued</th>
                                    <th className="px-4 py-2">User</th>
                                                                    <th className="px-4 py-2">Returned Quantity</th>
                                    <th className="px-4 py-2">Lost/ Damaged Quantity</th>
                                    <th className="px-4 py-2">Date Returned</th>

                                </tr>
                            </thead>
                            <tbody>
                                {isLoading || isFetching ? (
                                    <tr>
                                        <td colSpan="6" className="text-center px-4 py-2">Loading..</td>
                                    </tr>
                                ) : Array.isArray(logs) && logs.length > 0 ? (
                                    logs.map(log => (
                                        <EquipmentsLogCard key={log._id} data={log}  />
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

            </div>
        </>
    );
};

export default EquipmentsLogsPage;
