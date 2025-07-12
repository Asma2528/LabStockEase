import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const ViewInvoice = ({ visible, setVisible, invoice }) => {
    const approvedByName = typeof invoice.approvedBy === 'object' ? invoice.approvedBy?.name : 'N/A';




    return (
        <Dialog
            header="View Invoice"
            visible={visible}
            className="w-full md:w-[80%] lg:w-8/12"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Invoice Number */}
                <div>
                    <label className="block font-medium">Order Number</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={invoice.order?.orderNumber || 'N/A'} disabled />
                </div>

                {/* PO Number */}
                <div>
                    <label className="block font-medium">PO Number</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={invoice.order?.poNumber || 'N/A'} disabled />
                </div>


                <div>
                    <label className="block font-medium">Bill Number</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={invoice.billNo || 'N/A'} disabled />
                </div>


                <div>
                    <label className="block font-medium">Bill Date</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={formatDate(invoice.billDate)} disabled />
                </div>


                <div>
                    <label className="block font-medium">Invoice Amount</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={invoice.invoiceAmount || 'N/A'} disabled />
                </div>


                {/* Status */}
                <div>
                    <label className="block font-medium">Status</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={invoice.status} disabled />
                </div>



                {/* Approved By */}
                <div>
                    <label className="block font-medium">Approved / Rejected By</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={approvedByName} disabled />
                </div>


                <div>
                    <label className="block font-medium">Approved / Rejected At</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={formatDate(invoice.approved_at)} disabled />
                </div>


                <div>
                    <label className="block font-medium">Remark</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={invoice.remark} disabled />
                </div>

                {/* Created At */}
                <div>
                    <label className="block font-medium">Created At</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={formatDate(invoice.createdAt)} disabled />
                </div>

                {/* Updated At */}
                <div>
                    <label className="block font-medium">Updated At</label>
                    <input type="text" className=" w-full px-5 py-2 rounded-md  border " value={formatDate(invoice.updatedAt)} disabled />
                </div>


                <div className="col-span-1 md:col-span-2">
                    <label className="block font-medium">Comments</label>
                    <textarea className=" w-full px-5 py-2 rounded-md  border " value={invoice.comment || 'N/A'} disabled />
                </div>
            </div>


        </Dialog>
    );
};

ViewInvoice.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    invoice: PropTypes.object.isRequired,
};

export default ViewInvoice;
