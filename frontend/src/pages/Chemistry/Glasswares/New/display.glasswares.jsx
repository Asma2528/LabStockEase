import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';

const ViewItem = ({ visible, setVisible, item }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Dialog
            header="View Item"
            position="top"
            visible={visible}
            className="w-full md:w-[70%] lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full">
                <div className="mb-3">
                    <label htmlFor="item_code">Item Code</label>
                    <input id="item_code" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.item_code} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="item_name">Item Name</label>
                    <input id="item_name" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.item_name} disabled />
                </div>

      

                <div className="mb-3">
                    <label htmlFor="status">Description</label>
                    <input id="status" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.description} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="company">Company/Brand</label>
                    <input id="company" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.company} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="purpose">Purpose</label>
                    <input id="purpose" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.purpose} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="unit_of_measure">Unit of Measure</label>
                    <input id="unit_of_measure" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.unit_of_measure} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="total_quantity">Total Quantity</label>
                    <input id="total_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.total_quantity} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="current_quantity">Current Quantity</label>
                    <input id="current_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.current_quantity} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="min_stock_level">Minimum Stock Level</label>
                    <input id="min_stock_level" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.min_stock_level} disabled />
                </div>


                <div className="mb-3">
                    <label htmlFor="status">Status</label>
                    <input id="status" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.status} disabled />
                </div>

             <div className="mb-3">
                    <label htmlFor="status">Created At</label>
                    <input id="status" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={formatDate(item.createdAt)} disabled />
                </div>
           
                <div className="mb-3">
                    <label htmlFor="status">Last Updated At</label>
                    <input id="status" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={formatDate(item.updatedAt)} disabled />
                </div>

            </div>
        </Dialog>
    );
};

// PropTypes validation
ViewItem.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    item: PropTypes.object.isRequired,
};

export default ViewItem;
