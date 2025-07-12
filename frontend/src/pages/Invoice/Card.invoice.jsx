import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewInvoice from './display.invoice';  
import UpdateInvoiceModel from './UpdateModel.invoice';  

const InvoiceCard = ({ data, onDelete }) => {

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
           <tr className="bg-white binvoice-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
    <td className="px-4 py-2 font-medium">{data.order?.orderNumber || 'N/A'} / {data.order?.poNumber || 'N/A'}</td>
    <td className="px-4 py-2">{data.billNo}</td>
    <td className="px-4 py-2">{formatDate(data.billDate)}</td>
    <td className="px-4 py-2">{data.invoiceAmount}</td>
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

            {/* View Invoice Dialog */}
            <ViewInvoice visible={visible} setVisible={setVisible} invoice={data} />

            {/* Update Invoice Dialog */}
            <UpdateInvoiceModel visible={updateVisible} setVisible={setUpdateVisible} invoice={data} />
        </>
    );
};

// Define PropTypes
InvoiceCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        billNo: PropTypes.number.isRequired,
        order: PropTypes.shape({
            orderNumber: PropTypes.string.isRequired,
            poNumber: PropTypes.string.isRequired
        }).isRequired,
        invoiceAmount: PropTypes.number.isRequired,
        status: PropTypes.string.isRequired,
        billDate: PropTypes.string.isRequired,
        approved_at: PropTypes.string,
    }).isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default InvoiceCard;
