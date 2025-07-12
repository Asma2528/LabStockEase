import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';

const ViewRestockItem = ({ visible, setVisible, item }) => {
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
            header="View Restock Item"
            position="top"
            visible={visible}
            className="w-full md:w-[70%] lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full">
                <div className="mb-3">
                    <label htmlFor="book">Book</label>
                    <input id="book" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={`${item.book.item_code} : ${item.book.item_name}`} disabled />
                </div>
    


                <div className="mb-3">
                    <label htmlFor="quantity_purchased">Quantity Purchased</label>
                    <input id="quantity_purchased" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.quantity_purchased} disabled />
                </div>

             <div className="mb-3">
                    <label htmlFor="inward">Inward</label>
                    <input id="inward" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={`${item.inward?.inward_code}`} disabled />
                </div>

                

                <div className="mb-3">
                    <label htmlFor="createdAt">Created At</label>
                    <input id="createdAt" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={formatDate(item.createdAt) || 'N/A'} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="updatedAt">Updated At</label>
                    <input id="updatedAt" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={formatDate(item.updatedAt) || 'N/A'} disabled />
                </div>
            </div>
        </Dialog>
    );
};

// PropTypes validation
ViewRestockItem.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
       item: PropTypes.object.isRequired,
};


export default ViewRestockItem;
