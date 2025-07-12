import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const ViewVendor = ({ visible, setVisible, vendor }) => {
    return (
        <Dialog
            header="View Vendor"
            position="top"
            visible={visible}
            className="w-full md:w-[70%] lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full">
                <div className="mb-3">
                    <label htmlFor="code">Vendor Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.code} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="name">Vendor Name</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.name} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="email">Vendor Email</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.email} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="contact_person">Contact Person</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.contact_person} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="contact_no">Contact Number</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.contact_no} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="classification">Class</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.classification} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="grading">Grading</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.grading} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="address">Address</label>
                    <textarea className="w-full px-5 py-2 rounded-md border" value={vendor.address} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="gst_no">GST Number</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.gst_no} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="pan_no">TAN/PAN Number</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={vendor.tan_pan_no} disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="created_at">Created At</label>
                    <input
                        type="text"
                        className="w-full px-5 py-2 rounded-md border"
                        value={formatDate(vendor.createdAt)}
                        disabled
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="updated_at">Updated At</label>
                    <input
                        type="text"
                        className="w-full px-5 py-2 rounded-md border"
                        value={formatDate(vendor.updatedAt)}
                        disabled
                    />
                </div>
            </div>
        </Dialog>
    );
};

// PropTypes validation
ViewVendor.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    vendor: PropTypes.shape({
        code: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        contact_person: PropTypes.string.isRequired,
        contact_no: PropTypes.string.isRequired,
        classification: PropTypes.string.isRequired,
        grading: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        gst_no: PropTypes.string,
        tan_pan_no: PropTypes.string,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
    }).isRequired,
};

export default ViewVendor;
