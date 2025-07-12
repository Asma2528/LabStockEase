import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewOther from './display.other'; // Make sure to create this component
import UpdateOtherModel from './UpdateModel.other'; // Make sure to create this component

const OthersCard = ({ data, onDelete }) => {
    const [visible, setVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);

                    // Function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

    const handleViewClick = () => setVisible(true);
    const handleUpdateClick = () => setUpdateVisible(true);

    return (
        <>
            <tr className="bg-white border-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
                <td className="px-4 py-2 font-medium">{data.otherCode}</td>
                <td className="px-4 py-2 font-medium">{data.description}</td>
<td className="px-4 py-2">{formatDate(data.otherDate)}</td>
<td className="px-4 py-2">{formatDate(data.sanctionDate)}</td>

                <td className="px-4 py-2">{data.otherPeriod}</td>
                <td className="px-4 py-2">{data.fundingAgency}</td>
                <td className="px-4 py-2">{data.otherStatus}</td>
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

            {/* View Other Dialog */}
            <ViewOther visible={visible} setVisible={setVisible} other={data} />

            {/* Update Other Dialog */}
            <UpdateOtherModel visible={updateVisible} setVisible={setUpdateVisible} other={data} />
        </>
    );
};

// Define PropTypes
OthersCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        otherCode: PropTypes.string.isRequired,
        otherDate: PropTypes.string.isRequired,         // Updated to match 'otherDate' field
        sanctionDate: PropTypes.string.isRequired,       // Updated to match 'sanctionDate' field
        otherPeriod: PropTypes.string.isRequired,      // Updated to match 'otherPeriod' field
        fundingAgency: PropTypes.string.isRequired,      // Updated to match 'fundingAgency' field
        otherStatus: PropTypes.string.isRequired,      // Updated to match 'otherStatus' field
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default OthersCard;
