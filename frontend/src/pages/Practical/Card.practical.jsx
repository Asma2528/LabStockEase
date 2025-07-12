import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewPractical from './display.practical'; // Make sure to create this component
import UpdatePracticalModel from './UpdateModel.practical'; // Make sure to create this component

const PracticalsCard = ({ data, onDelete }) => {
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
         
                <td className="px-4 py-2 font-medium">{data.practicalCode}</td>
                <td className="px-4 py-2 font-medium">{data.description}</td>
<td className="px-4 py-2">{formatDate(data.practicalDate)}</td>
<td className="px-4 py-2">{formatDate(data.sanctionDate)}</td>

                <td className="px-4 py-2">{data.practicalPeriod}</td>
                <td className="px-4 py-2">{data.fundingAgency}</td>
                <td className="px-4 py-2">{data.practicalStatus}</td>
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

            {/* View Practical Dialog */}
            <ViewPractical visible={visible} setVisible={setVisible} practical={data} />

            {/* Update Practical Dialog */}
            <UpdatePracticalModel visible={updateVisible} setVisible={setUpdateVisible} practical={data} />
        </>
    );
};

// Define PropTypes
PracticalsCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
         description: PropTypes.string.isRequired,
        practicalCode: PropTypes.string.isRequired,
        practicalDate: PropTypes.string.isRequired,         // Updated to match 'practicalDate' field
        sanctionDate: PropTypes.string.isRequired,       // Updated to match 'sanctionDate' field
        practicalPeriod: PropTypes.string.isRequired,      // Updated to match 'practicalPeriod' field
        fundingAgency: PropTypes.string.isRequired,      // Updated to match 'fundingAgency' field
        practicalStatus: PropTypes.string.isRequired,      // Updated to match 'practicalStatus' field
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default PracticalsCard;
