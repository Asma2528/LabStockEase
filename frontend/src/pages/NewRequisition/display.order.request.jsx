import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';

const ViewItem = ({ visible, setVisible, orderRequest }) => {

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
            header="View Order Request"
            position="top"
            visible={visible}
            className="w-full md:w-[90%] lg:w-9/12"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full">
            <div className="mb-3">
                    <label htmlFor="orderRequest_code">Order Request Code</label>
                    <input 
                        id="orderRequest_code" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={orderRequest.orderRequest_code} 
                        disabled 
                    />
                </div>
              
             <div  className="mb-3">
                    <label className="block font-medium">Category Type</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={orderRequest.categoryType || 'N/A'} disabled />
                </div>

                <div  className="mb-3">
                    <label className="block font-medium">Category Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={orderRequest.categoryCode || 'N/A'} disabled />
                </div>


                <div className="mb-3">
                    <label htmlFor="date_of_requirement">Date of Requirement</label>
                    <input 
                        id="date_of_requirement" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(orderRequest.date_of_requirement)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="requested_by">Requested By</label>
                    <input 
                        id="requested_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(orderRequest.requested_by?.name)} 
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
                              
                            </tr>
                        </thead>
                        <tbody>
                            {orderRequest.items && orderRequest.items.length > 0 ? (
                                orderRequest.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 border">{getFieldValue(item.class)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.item?.item_code)} : {getFieldValue(item.item?.item_name)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.quantity_required)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.unit_of_measure)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.description)}</td>
                                        <td className="px-4 py-2 border">{getFieldValue(item.remark)}</td>
                                        
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
                        value={getFieldValue(orderRequest.status)} 
                        disabled 
                    />
                </div>

                {/* Other Details */}
                <div className="mb-3">
                    <label htmlFor="remarks">Order Request Remark</label>
                    <input 
                        id="remarks" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(orderRequest.remarks, 'No remarks')} 
                        disabled 
                    />
                </div>

               
                <div className="mb-3">
                    <label htmlFor="approved_by">Approved By</label>
                    <input 
                        id="approved_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(orderRequest.approved_by?.name)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="ordered_by">Issued By</label>
                    <input 
                        id="ordered_by" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={getFieldValue(orderRequest.ordered_by?.name)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="createdAt">Created At</label>
                    <input 
                        id="createdAt" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(orderRequest.createdAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="updatedAt">Last Updated At</label>
                    <input 
                        id="updatedAt" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(orderRequest.updatedAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="approved_at">Approved At</label>
                    <input 
                        id="approved_at" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(orderRequest.approved_at)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="ordered_at">Issued At</label>
                    <input 
                        id="ordered_at" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        value={formatDate(orderRequest.ordered_at)} 
                        disabled 
                    />
                </div>

            </div>
        </Dialog>
    );
};

ViewItem.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
   
    orderRequest: PropTypes.shape({
        orderRequest_code: PropTypes.string,
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
    
        approved_by: PropTypes.shape({
            name: PropTypes.string,
        }),
        ordered_by: PropTypes.shape({
            name: PropTypes.string,
        }),
        approved_at: PropTypes.string,
        ordered_at: PropTypes.string,
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
