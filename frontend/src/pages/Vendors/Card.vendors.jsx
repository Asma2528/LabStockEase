import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewVendor from './display.vendors';
import UpdateVendorModel from './UpdateModel.vendors';

const VendorsCard = ({ data, onDelete }) => {
    const [visible, setVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);

    const handleViewClick = () => setVisible(true);
    const handleUpdateClick = () => setUpdateVisible(true);

    return (
        <>
            <tr className="bg-white border-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
                <td className="px-4 py-2 font-medium">{data.code}</td>
                <td className="px-4 py-2">{data.name}</td>
                <td className="px-4 py-2">{data.email}</td>
                <td className="px-4 py-2">{data.contact_person}</td>
                <td className="px-4 py-2">{data.contact_no}</td>
                <td className="px-4 py-2">{data.classification}</td>
                <td className="px-4 py-2">{data.address}</td>
                <td className="px-4 py-2">{data.grading}</td>
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

            {/* View Vendor Dialog */}
            <ViewVendor visible={visible} setVisible={setVisible} vendor={data} />

            {/* Update Vendor Dialog */}
            <UpdateVendorModel visible={updateVisible} setVisible={setUpdateVisible} vendor={data} />
        </>
    );
};

// Define PropTypes
VendorsCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        contact_person: PropTypes.string.isRequired,
        contact_no: PropTypes.string.isRequired,
        classification: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        grading: PropTypes.string.isRequired,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default VendorsCard;
