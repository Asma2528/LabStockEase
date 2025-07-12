import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewItem from './display.chemicals';
import UpdateModel from './UpdateModel.chemicals';

const ChemicalsCard = ({ data, onDelete }) => {
    const [visible, setVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);

    const handleViewClick = () => setVisible(true);
    const handleUpdateClick = () => setUpdateVisible(true);

    return (
        <>
            <tr className="bg-white border-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
                <td className="px-4 py-2 font-medium">{data.item_code}</td>
                <td className="px-4 py-2 font-medium">{data.item_name}</td>
                <td className="px-4 py-2">{data.casNo}</td>
                <td className="px-4 py-2">{data.total_quantity}</td>
                <td className="px-4 py-2">{data.current_quantity}</td>
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

            {/* View Item Dialog */}
            <ViewItem visible={visible} setVisible={setVisible} item={data} />

            {/* Update Item Dialog */}
            <UpdateModel visible={updateVisible} setVisible={setUpdateVisible} item={data} />
        </>
    );
};

// Define PropTypes
ChemicalsCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        item_code: PropTypes.string.isRequired,
        item_name: PropTypes.string.isRequired,
        casNo: PropTypes.string.isRequired,
        total_quantity: PropTypes.number.isRequired,
        current_quantity: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default ChemicalsCard;
