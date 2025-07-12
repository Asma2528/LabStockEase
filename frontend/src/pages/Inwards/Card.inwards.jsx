import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewInward from './display.inwards';  
import UpdateInwardModel from './UpdateModel.inwards';  

const InwardCard = ({ data, onDelete }) => {

    const [visible, setVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);

    const handleViewClick = () => setVisible(true);
    const handleUpdateClick = () => setUpdateVisible(true);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <tr className="bg-white binward-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
            <td className="px-4 py-2 font-medium">{data.inward_code}</td>
            <td className="px-4 py-2 font-medium">{data.class}</td>
                <td className="px-4 py-2 font-medium">{data.item?.item_code}</td>
                <td className="px-4 py-2">{data.quantity}</td>
                <td className="px-4 py-2">{data.unit}</td>
                <td className="px-4 py-2">{data.vendor?.code || 'N/A'}</td>
                <td className="px-4 py-2">{data.invoice?.billNo || 'N/A'}</td>
                <td className="px-4 py-2">{formatDate(data.createdAt)}</td>
            
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

            {/* View Inward Dialog */}
            <ViewInward visible={visible} setVisible={setVisible} inward={data} />

            {/* Update Inward Dialog */}
            <UpdateInwardModel visible={updateVisible} setVisible={setUpdateVisible} inward={data} />
        </>
    );
};

// Define PropTypes
InwardCard.propTypes = {
    data: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default InwardCard;
