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

const ViewInward = ({ visible, setVisible, inward }) => {
    const createdByName = typeof inward.createdBy === 'object' ? inward.createdBy?.name : inward.createdBy;

    return (
        <Dialog
            header="View Inward"
            visible={visible}
            className="w-full md:w-[90%] lg:w-10/12"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              
                  <div>
                    <label className="block font-medium">Inward Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={inward.inward_code} disabled />
                </div>


                {/* Class */}
                <div>
                    <label className="block font-medium">Class</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={inward.class} disabled />
                </div>

                {/* Item */}
                <div>
                    <label className="block font-medium">Item</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border"  value={`${inward.item?.item_code || 'N/A'} - ${inward.item?.item_name || 'N/A'}`}   disabled />
                </div>

                {/* Description */}
                <div>
                    <label className="block font-medium">Description</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={inward.description} disabled />
                </div>

                {/* Grade */}
                <div>
                    <label className="block font-medium">Grade</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={inward.grade || 'N/A'} disabled />
                </div>

                {/* CAS No */}
                <div>
                    <label className="block font-medium">CAS No</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={inward.casNo || 'N/A'} disabled />
                </div>

                {/* Quantity & Unit */}
                <div>
                    <label className="block font-medium">Quantity</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={inward.quantity} disabled />
                </div>

 {/* Quantity & Unit */}
 <div>
                    <label className="block font-medium">Unit</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={inward.unit} disabled />
                </div>

                {/* TH Class */}
                <div>
                    <label className="block font-medium">TH Class</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={inward.thClass || 'N/A'} disabled />
                </div>

                {/* Vendor Code & Name */}
                <div>
                    <label className="block font-medium">Vendor</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={`${inward.vendor?.code || 'N/A'} - ${inward.vendor?.name || 'N/A'}`} disabled />
                </div>

                {/* Invoice Bill No & Date */}
                <div>
                    <label className="block font-medium">Invoice</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={`${inward.invoice?.billNo || 'N/A'} - ${formatDate(inward.invoice?.billDate)}`} disabled />
                </div>

              

                {/* Created By */}
                <div>
                    <label className="block font-medium">Created By</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={createdByName || 'N/A'} disabled />
                </div>

           

                {/* Created At */}
                <div>
                    <label className="block font-medium">Created At</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={formatDate(inward.createdAt)} disabled />
                </div>

                {/* Updated At */}
                <div>
                    <label className="block font-medium">Updated At</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md  border" value={formatDate(inward.updatedAt)} disabled />
                </div>

               
            </div>
        </Dialog>
    );
};

ViewInward.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    inward: PropTypes.object.isRequired,
};

export default ViewInward;
