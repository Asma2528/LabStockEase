import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewRestockItem from './display.restock.others'; // Component for viewing restock details
import UpdateRestockModel from './restock.update.others';


// Utility function to format the date
const formatDate = (dateString) => {
    if (!dateString) {
        return "N/A"; // Show "N/A" when date is null or undefined
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};


const RestockCard = ({ data, onDelete }) => {


    const [visible, setVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);

    const handleViewClick = () => setVisible(true);
    const handleUpdateClick = () => setUpdateVisible(true);

    if (!data.other) {
        return null; // If other is null, do not render the card
    }

    
    return (
        <>
            <tr className="bg-white border-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
                {/* Access the item_code and item_name from other object */}
                <td className="px-4 py-2 font-medium">{`${data.other.item_code} : ${data.other.item_name}`}</td>
                <td className="px-4 py-2 font-medium">{data.quantity_purchased}</td>
                <td className="px-4 py-2">{data.inward?.inward_code || 'N/A'}</td>
                <td className="px-4 py-2">{formatDate(data.expiration_date)}</td>
                <td className="px-4 py-2 font-medium">{data.location}</td>
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

            {/* View Item Dialog */}
            <ViewRestockItem visible={visible} setVisible={setVisible} item={data} />

            {/* Update Item Dialog */}
            <UpdateRestockModel visible={updateVisible} setVisible={setUpdateVisible} item={data} />
        </>
    );
};

// Define PropTypes
RestockCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        other: PropTypes.shape({
            item_code: PropTypes.string.isRequired,
            item_name: PropTypes.string.isRequired,
        }).isRequired,
        quantity_purchased: PropTypes.number.isRequired,
        inward: PropTypes.shape({
            inward_code: PropTypes.string,
        }),
        expiration_date: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};


export default RestockCard;
