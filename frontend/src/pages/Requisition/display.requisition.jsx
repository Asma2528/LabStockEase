import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';

const ViewItem = ({ visible, setVisible, requisition }) => {

    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) {
            return '-'; // Return '-' if the date is invalid or empty
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFieldValue = (value, fallback = '-') => {
        return value ? value : fallback;
    };

    return (
        <Dialog
            header="View Requisition"
            position="top"
            visible={visible}
            className="w-full md:w-[90%] lg:w-9/12"
            onHide={() => setVisible(false)}
            draggable={false}
        >

<div className="mb-3">
                    <label htmlFor="requested_by">Requisition Code</label>
                    <input 
                        id="requisition_code" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(requisition.requisition_code)} 
                        disabled 
                    />
                </div>

             <div  className="mb-3">
                    <label className="block font-medium">Category Type</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={requisition.categoryType || 'N/A'} disabled />
                </div>

                <div  className="mb-3">
                    <label className="block font-medium">Category Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={requisition.categoryCode || 'N/A'} disabled />
                </div>


                <div className="mb-3">
                    <label htmlFor="date_of_requirement">Date of Requirement</label>
                    <input 
                        id="date_of_requirement" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(requisition.date_of_requirement)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="requested_by">Requested By</label>
                    <input 
                        id="requested_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(requisition.requested_by?.name)} 
                        disabled 
                    />
                </div>

                {/* Items Information in Table */}
                <div className="mb-3">
                    <label htmlFor="items">Item Details</label>
                    <table className="w-full text-left table-auto border-1 border-gray-300">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border">Class</th>
                                <th className="px-4 py-2 border">Item</th>
                                <th className="px-4 py-2 border">Quantity Required</th>
                                <th className="px-4 py-2 border">Unit of Measure</th>
                                <th className="px-4 py-2 border">Description</th>
                                <th className="px-4 py-2 border">Remark</th>
                                                                                        <th className="px-4 py-2 border">Quantity Issued</th>

                                <th className="px-4 py-2 border">Quantity Returned</th>

                                                                    <th className="px-4 py-2 border">Quantity Lost/Damaged</th>

                            </tr>
                        </thead>
                        <tbody>
                            {requisition.items && requisition.items.length > 0 ? (
                                requisition.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 border">{getFieldValue(item.class)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.item_code)} : {getFieldValue(item.item_name)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.quantity_required)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.unit_of_measure)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.description)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.remark)}</td>
                                                                                <td className="px-4 py-2 border">{getFieldValue(item.quantity_issued)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.quantity_returned)}</td>

                                        <td className="px-4 py-2 border">{getFieldValue(item.quantity_lost_damaged)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-2 border text-center">No items available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mb-3">
                    <label htmlFor="status">Status</label>
                    <input 
                        id="status" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(requisition.status)} 
                        disabled 
                    />
                </div>

                {/* Other Details */}
                <div className="mb-3">
                    <label htmlFor="remarks">Requisition Remark</label>
                    <input 
                        id="remarks" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(requisition.remarks, 'No remarks')} 
                        disabled 
                    />
                </div>

               
                <div className="mb-3">
                    <label htmlFor="approved_by">Approved By</label>
                    <input 
                        id="approved_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(requisition.approved_by?.name)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="issued_by">Issued By</label>
                    <input 
                        id="issued_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(requisition.issued_by?.name)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="createdAt">Created At</label>
                    <input 
                        id="createdAt" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(requisition.createdAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="updatedAt">Last Updated At</label>
                    <input 
                        id="updatedAt" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(requisition.updatedAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="approved_at">Approved At</label>
                    <input 
                        id="approved_at" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(requisition.approved_at)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="issued_at">Issued At</label>
                    <input 
                        id="issued_at" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(requisition.issued_at)} 
                        disabled 
                    />
                </div>

         
        </Dialog>
    );
};

ViewItem.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    requisition: PropTypes.shape({
        requisition_code: PropTypes.string,
        class: PropTypes.string,
        item: PropTypes.shape({
            item_code: PropTypes.string,
            item_name: PropTypes.string,
        }),
        categoryType: PropTypes.string,
        categoryCode: PropTypes.string,
        quantity_required: PropTypes.number,
        unit_of_measure: PropTypes.string,
        description: PropTypes.string,
        date_of_requirement: PropTypes.string,
        status: PropTypes.string,
        remarks: PropTypes.string,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
        requested_by: PropTypes.shape({
            name: PropTypes.string,
        }),
        quantity_returned: PropTypes.number,
        approved_by: PropTypes.shape({
            name: PropTypes.string,
        }),
        issued_by: PropTypes.shape({
            name: PropTypes.string,
        }),
        approved_at: PropTypes.string,
        issued_at: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({
            class: PropTypes.string,
            description: PropTypes.string,
            item: PropTypes.shape({
                item_code: PropTypes.string,
                item_name: PropTypes.string,
            }),
            quantity_required: PropTypes.number,
            unit_of_measure: PropTypes.string,
        })).isRequired,
    }).isRequired,
};

export default ViewItem;
