import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewGeneral from './display.general'; // Make sure to create this component
import UpdateGeneralModel from './UpdateModel.general'; // Make sure to create this component

const GeneralsCard = ({ data, onDelete }) => {
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
                <td className="px-4 py-2 font-medium">{data.generalCode}</td>
                <td className="px-4 py-2 font-medium">{data.description}</td>
<td className="px-4 py-2">{formatDate(data.generalDate)}</td>
<td className="px-4 py-2">{formatDate(data.sanctionDate)}</td>

                <td className="px-4 py-2">{data.generalPeriod}</td>
                <td className="px-4 py-2">{data.fundingAgency}</td>
                <td className="px-4 py-2">{data.generalStatus}</td>
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

            {/* View General Dialog */}
            <ViewGeneral visible={visible} setVisible={setVisible} general={data} />

            {/* Update General Dialog */}
            <UpdateGeneralModel visible={updateVisible} setVisible={setUpdateVisible} general={data} />
        </>
    );
};

// Define PropTypes
GeneralsCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
        generalCode: PropTypes.string.isRequired,
        generalDate: PropTypes.string.isRequired,         // Updated to match 'generalDate' field
        sanctionDate: PropTypes.string.isRequired,       // Updated to match 'sanctionDate' field
        generalPeriod: PropTypes.string.isRequired,      // Updated to match 'generalPeriod' field
        fundingAgency: PropTypes.string.isRequired,      // Updated to match 'fundingAgency' field
        generalStatus: PropTypes.string.isRequired,      // Updated to match 'generalStatus' field
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default GeneralsCard;
