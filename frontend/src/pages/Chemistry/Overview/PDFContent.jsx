
import { useGetDashboardDataQuery } from '../../../provider/queries/Chemistry.dashboard.query';
import { Chart } from 'primereact/chart';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { UserSlicePath } from '../../../provider/slice/user.slice';  // Import the user slice selector
import logo from '../../../assets/logo.png';
import { usePDF } from 'react-to-pdf';
import { Dialog } from 'primereact/dialog'
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PDFContent = ({ setVisible, visible }) => {

    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    const user = useSelector(UserSlicePath);


    const { toPDF, targetRef } = usePDF()

    const { data, isLoading, error } = useGetDashboardDataQuery();



    const formatDate = (dateString) => {
        
        const date = new Date(dateString);

        
        if (isNaN(date.getTime())) {
            console.error("Invalid date:", dateString); // Log if date parsing fails
            return "Invalid Date";
        }
    
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', // 'short' for abbreviated month
            day: 'numeric'
        });
    };

    // Ensure data is in correct format
    const chemicalsSummary = data.chemicalsSummary || {};
    const consumablesSummary = data.consumablesSummary || {};
    const glasswaresSummary = data.glasswaresSummary || {};
    const equipmentsSummary = data.equipmentSummary || {};
    const othersSummary = data.othersSummary || {};
    const booksSummary = data.booksSummary || {};
    
    const totalItemsCount = (chemicalsSummary.totalCount || 0) +
    (consumablesSummary.totalCount || 0) +
    (glasswaresSummary.totalCount || 0) +
    (equipmentsSummary.totalCount || 0) +
    (othersSummary.totalCount || 0) +
    (booksSummary.totalCount || 0);
    
    const totalItemsQuantity = (chemicalsSummary.totalQuantity || 0) +
    (consumablesSummary.totalQuantity || 0) +
    (glasswaresSummary.totalQuantity || 0) +
    (equipmentsSummary.totalQuantity || 0) +
    (othersSummary.totalQuantity || 0) +
    (booksSummary.totalQuantity || 0);
    
    const lowStockCount = data.lowStockCount || 'N/A';
    const nearExpiryCount = data.nearExpiryCount || 'N/A';
    const zeroStockCount = data.zeroStockCount || 'N/A';
    const expiredItemsCount = data.expiredItemsCount || 'N/A';
    const inStockCount = data.inStockCount || 'N/A';
    
    const lowStockItems = data.lowStockItems || [];
    const nearExpiryItems = data.nearExpiryItems || [];
    const outOfStockItems = data.outOfStockItems || [];
    const expiredItems = data.expiredItems || [];

    const generatedDate = new Date().toLocaleDateString();
    
    
    
    useEffect(() => {
        const data = {
            labels: ['Chemicals', 'Equipment', 'Glasswares', 'Consumables', 'Others','Books'],
            datasets: [
                {
                    label: 'Total Quantity',
                    data: [
                        chemicalsSummary.totalQuantity, 
                        consumablesSummary.totalQuantity, 
                        glasswaresSummary.totalQuantity, 
                        equipmentsSummary.totalQuantity, 
                        othersSummary.totalQuantity,
                        booksSummary.totalQuantity
                    ],
                    backgroundColor: [
                        'rgba(252, 246, 96, 0.3)',
                        'rgba(136, 132, 255, 0.2)',
                        'rgba(215, 188, 232, 0.2)',
                        'rgba(198, 235, 190, 0.2)',
                        'rgba(255, 99, 132, 0.2)'  // Added color for 'Others'
                    ],
                    borderColor: [
                        'rgb(252, 246, 97)',
                        'rgb(136, 109, 255)',
                        'rgb(215, 151, 232)',
                        'rgb(156, 235, 190)',
                        'rgb(255, 99, 132)'  // Added color for 'Others'
                    ],
                    borderWidth: 1
                }
            ]
        };
        const options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        };
        
        setChartData(data);
        setChartOptions(options);
    }, [chemicalsSummary.totalQuantity, consumablesSummary.totalQuantity, glasswaresSummary.totalQuantity, equipmentsSummary.totalQuantity, othersSummary.totalQuantity,booksSummary.totalQuantity]);
    
       useEffect(() => {
            const data = {
                labels: ['Chemicals', 'Consumables', 'Glasswares', 'Equipments', 'Books', 'Others'],
                datasets: [
                    {
                        data: [
                            chemicalsSummary.totalCount || 0, 
                            consumablesSummary.totalCount || 0, 
                            glasswaresSummary.totalCount || 0, 
                            equipmentsSummary.totalCount || 0, 
                            booksSummary.totalCount || 0, 
                            othersSummary.totalCount || 0
                        ],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',  // Chemicals
                            'rgba(54, 162, 235, 0.5)',  // Consumables
                            'rgba(255, 224, 86, 0.5)',  // Glasswares
                            'rgba(15, 272, 192, 0.5)',  // Equipments
                            'rgba(153, 102, 255, 0.5)', // Books
                            'rgba(255, 119, 64, 0.5)'   // Others
                        ],
                        hoverBackgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)'
                        ]
                    }
                ]
            };
            const options = {
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true
                        }
                    }
                }
            };
    
            setChartData(data);
            setChartOptions(options);
        }, [chemicalsSummary.totalCount, consumablesSummary.totalCount, glasswaresSummary.totalCount, equipmentsSummary.totalCount, othersSummary.totalCount,booksSummary.totalCount]);

    if (isLoading) return <div>Loading...</div>;
    if (error) {
        toast.error("Error fetching dashboard data");
        return <div>Error fetching data</div>;
    }

    if (!data) return <div>No data available</div>;
    return (
        <>
            <Dialog draggable={false} visible={visible} className=' w-[98%] mx-auto lg:mx-0 ' onHide={() => setVisible(false)}>
                <div ref={targetRef} className="cards w-[92%] flex flex-col gap-x-16 mx-10 ">
                    <div className="logo flex flex-wrap justify-center items-center">
                        <img src={logo} alt="LabStockEase Logo" className="mx-2 w-6 h-9" />
                        <h1 className='text-3xl font-bold my-2'>LabStockEase</h1>
                    </div>
                    <h1 className='text-center font-semibold text-xl p-5'>Chemistry Lab Overview</h1>
                    <div className="flex justify-between details p-5">
                        <p>Generated on: {generatedDate}</p>
                        <p>Generated by: {user.name}</p>
                    </div>
                    {/* Urgent Actions Card */}

                    <div className="cards w-[92%] flex p-5 flex-wrap gap-x-16">
                        <div className="card w-80 h-56 rounded-md">
                            <h2 className="font-bold text-lg p-1">Urgent Actions</h2>
                            <div className="bg-rose-100 text-black border-2 border-rose-300 shadow-none h-40 rounded-md p-5">
                                <h3 className="m-0">Low Stock Quantity:</h3>
                                <p className="m-0 font-semibold">{lowStockCount}</p>
                                <h3 className="mt-5">Near Expiry Quantity:</h3>
                                <p className="m-0 font-semibold">{nearExpiryCount}</p>
                            </div>
                        </div>

                        {/* Stock Details Card */}
                        <div className="card w-80 h-56 rounded-md">
                            <h2 className="font-bold text-lg p-1">Stock Details</h2>
                            <div className="bg-blue-100 text-black border-2 border-blue-300 shadow-none h-40 rounded-md p-5">
                                <h3 className="m-0">Zero Stock Products:</h3>
                                <p className="m-0 font-semibold">{zeroStockCount}</p>
                                <h3 className="mt-5">In Stock Products:</h3>
                                <p className="m-0 font-semibold">{inStockCount}</p>
                            </div>
                        </div>

                        {/* Item Details Card */}
                        <div className="card w-80 h-56 rounded-md">
                            <h2 className="font-bold text-lg p-1">Item Details</h2>
                            <div className="bg-emerald-50 text-black border-2 border-emerald-200 shadow-none h-40 rounded-md p-5">
                                <h3 className="m-0">Total Count of All Items:</h3>
                                <p className="m-0 font-semibold">{totalItemsCount}</p>
                                <h3 className="mt-5">Total Quantity of All Items:</h3>
                                <p className="m-0 font-semibold">{totalItemsQuantity}</p>
                            </div>
                        </div>

                        {/* Expiration and Stock Card */}
                        <div className="card w-80 h-56 rounded-md">
                            <h2 className="font-bold text-lg p-1">Out of Stock & Expiration</h2>
                            <div className="bg-yellow-100 text-black border-2 border-yellow-300 shadow-none h-40 rounded-md p-5">
                                <h3 className="m-0">Out of Stock Items:</h3>
                                <p className="m-0 font-semibold">{zeroStockCount}</p>
                                <h3 className="mt-5">Expired Items:</h3>
                                <p className="m-0 font-semibold">{expiredItemsCount}</p>
                            </div>
                        </div>
                    </div>
              
                <div className="w-fit flex flex-wrap my-10 gap-x-10 p-5 items-center">
                    <h2 className="font-bold text-lg w-full">Item Quantity by Category</h2>
                   <Chart type="bar" className='w-full lg:w-1/2' data={chartData} options={chartOptions} />
                    <h2 className="font-bold text-lg w-full mt-10">Item Count by Category</h2>
                    <Chart type="pie" data={chartData} options={chartOptions} className="w-full lg:w-1/3" />
                </div>

                {/* Low Stock Items Table */}
                <div className="w-[92%] flex flex-wrap flex-col my-10 gap-y-2 p-5 gap-x-2">
                    <h1 className="font-bold">Low Stock Items:</h1>
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                            <thead className="text-xs text-black border-b uppercase bg-gray-50">
                                <tr className="border-b">
                                <th scope="col" className="px-4 py-2">Item Code</th>
                                    <th scope="col" className="px-4 py-2">Item Name</th>
            
                                    <th scope="col" className="px-4 py-2">Total Quantity</th>
                                    <th scope="col" className="px-4 py-2">Current Quantity</th>
                                    <th scope="col" className="px-4 py-2">Minimum Stock Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockItems.map(item => (
                                    <tr key={item._id}>
                                                <td className="px-4 py-2">{item.item_code}</td>
                                        <td className="px-4 py-2">{item.item_name}</td>
                                
                                        <td className="px-4 py-2">{item.total_quantity}</td>
                                        <td className="px-4 py-2">{item.current_quantity}</td>
                                        <td className="px-4 py-2">{item.min_stock_level}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

  {/* Out of Stock Items Table */}
  <div className="w-[92%] flex flex-wrap flex-col my-10 gap-y-2 p-5 gap-x-2 ">
                    <h1 className="font-bold">Out of Stock Items:</h1>
                    <div className="relative overflow-x-auto shadow">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                            <thead className="text-xs text-black border-b uppercase bg-gray-50">
                                <tr className="border-b">
                                <th scope="col" className="px-4 py-2">Item Code</th>
                                    <th scope="col" className="px-4 py-2">Item Name</th>
                                    <th scope="col" className="px-4 py-2">Total Quantity</th>
                                    <th scope="col" className="px-4 py-2">Current Quantity</th>
                                    <th scope="col" className="px-4 py-2">Minimum Stock Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outOfStockItems.map(item => (
                                    <tr key={item._id}>
                                               <td className="px-4 py-2">{item.item_code}</td>
                                        <td className="px-4 py-2">{item.item_name}</td>
                                
                                        <td className="px-4 py-2">{item.total_quantity}</td>
                                        <td className="px-4 py-2">{item.current_quantity}</td>
                                        <td className="px-4 py-2">{item.min_stock_level}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
{/* Near Expiry Items Table */}

<div className="w-[92%] flex flex-wrap flex-col my-10 gap-y-2 p-5 gap-x-2 ">
 
    <h1 className="font-bold text-lg">Near Expiry Items</h1>
    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
    <thead className="text-xs text-black border-b uppercase bg-gray-50">
            <tr>
                <th className="border p-2">Item Code</th>
                <th className="border p-2">Item Name</th>
                <th className="border p-2">Total Quantity</th>
                <th className="border p-2">Current Quantity</th>
                <th className="border p-2">Min Stock Level</th>
                <th className="border p-2">Expiration Date</th>
            </tr>
        </thead>
        <tbody>
            {nearExpiryItems.length > 0 ? (
                nearExpiryItems.map(item => {
                    const itemData = item.chemical || item.consumable || item.other || item.equipment || {};
                    return (
                        <tr key={item._id}>
                            <td className="border p-2">{itemData.item_code || 'N/A'}</td>
                            <td className="border p-2">{itemData.item_name || 'N/A'}</td>
                            <td className="border p-2">{itemData.total_quantity || 'N/A'}</td>
                            <td className="border p-2">{itemData.current_quantity || 'N/A'}</td>
                            <td className="border p-2">{itemData.min_stock_level || 'N/A'}</td>
                            <td className="border p-2">{formatDate(item.expiration_date)}</td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan="6" className="border p-2 text-center">No Near Expiry Items</td>
                </tr>
            )}
        </tbody>
    </table>
</div>

{/* Expired Items Table */}

<div className="w-[92%] flex flex-wrap flex-col my-10 gap-y-2 p-5 gap-x-2 ">
 
    <h1 className="font-bold text-lg">Expired Items</h1>
    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
    <thead className="text-xs text-black border-b uppercase bg-gray-50">
            <tr>
                <th className="border p-2">Item Code</th>
                <th className="border p-2">Item Name</th>
                <th className="border p-2">Total Quantity</th>
                <th className="border p-2">Current Quantity</th>
                <th className="border p-2">Min Stock Level</th>
                <th className="border p-2">Expiration Date</th>
            </tr>
        </thead>
        <tbody>
            {expiredItems.length > 0 ? (
                expiredItems.map(item => {
                    const itemData = item.chemical || item.consumable || item.other || item.equipment || {};
                    return (
                        <tr key={item._id}>
                            <td className="border p-2">{itemData.item_code || 'N/A'}</td>
                            <td className="border p-2">{itemData.item_name || 'N/A'}</td>
                            <td className="border p-2">{itemData.total_quantity || 'N/A'}</td>
                            <td className="border p-2">{itemData.current_quantity || 'N/A'}</td>
                            <td className="border p-2">{itemData.min_stock_level || 'N/A'}</td>
                            <td className="border p-2">{formatDate(item.expiration_date)}</td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan="6" className="border p-2 text-center">No Expired Items</td>
                </tr>
            )}
        </tbody>
    </table>
</div>


                </div>
                <footer>
                    <button className='px-6 py-2 m-10  outline-none bg-blue-800 rounded-md text-white'
                        onClick={() => toPDF({
                            method: 'save',
                            page: {
                                format: 'A4'
                            }
                        })}

                    >Download PDF</button>
                </footer>
            </Dialog>
        </>
    );
}

export default PDFContent;

// Assign a display name to the component for easier debugging
PDFContent.displayName = 'PDFContent';

PDFContent.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};


