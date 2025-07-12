import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewOrder from './display.orders';
import UpdateOrderModel from './UpdateModel.orders';


const OrderCard = ({ data, onDelete }) => {


    const [visible, setVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);
 
   
    const handleViewClick = () => setVisible(true);
    const handleUpdateClick = () => setUpdateVisible(true);


    return (
        <>
            <tr className="bg-white border-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
                <td className="px-4 py-2 font-medium">{data.orderNumber}</td>
                <td className="px-4 py-2 font-medium">{data.poNumber}</td>
                <td className="px-4 py-2">
                    {data.vendor ? `${data.vendor.code} - ${data.vendor.name}` : 'Unknown Vendor'}
                </td>

                <td className="px-4 py-2">{data.status}</td>

                <td className="px-4 py-2">
                    <div className="flex items-center">
                        <Button onClick={handleViewClick} title="View" className="p-3 bg-indigo-500 text-white rounded-sm mx-2">
                            <LuView className="text-xl" />
                        </Button>
                        <Button onClick={handleUpdateClick} title="Edit" className="p-3 bg-lime-400 text-white rounded-sm mx-2">
                            <FaRegEdit className="text-xl" />
                        </Button>
                        <Button onClick={onDelete} title="Delete" className="p-3 bg-red-500 text-white rounded-sm mx-2">
                            <FaRegTrashAlt className="text-xl" />
                        </Button>
       
                          
                    </div>
                </td>
            </tr>
  
            {/* View Order Dialog */}
            <ViewOrder visible={visible} setVisible={setVisible} order={data} />

            {/* Update Order Dialog */}
            <UpdateOrderModel visible={updateVisible} setVisible={setUpdateVisible} order={data} />


        </>
    );
};

// Define PropTypes
OrderCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        orderNumber: PropTypes.string.isRequired,
        poNumber: PropTypes.string.isRequired,
        vendor: PropTypes.shape({
            code: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
        }).isRequired,
        quotationRefNo: PropTypes.string.isRequired,
        quotationDate: PropTypes.string.isRequired,
        additionalText: PropTypes.string,
        status: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(PropTypes.shape({
            entryNo: PropTypes.number.isRequired,
            description: PropTypes.string.isRequired,
            make: PropTypes.string,
            quantity: PropTypes.number.isRequired,
            rate: PropTypes.number.isRequired,
            discount: PropTypes.number,

            taxGST: PropTypes.number,
            cost: PropTypes.number.isRequired
        })).isRequired,
        notes: PropTypes.string,
        thClass: PropTypes.arrayOf(PropTypes.string),
        approvedBy: PropTypes.object
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default OrderCard;
