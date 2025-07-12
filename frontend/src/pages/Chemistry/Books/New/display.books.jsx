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
                    <input 
                        id="item_code" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.item_code} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="item_name">Item Name</label>
                    <input 
                        id="item_name" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.item_name} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="author">Author<span className="text-red-500 text-sm">*</span></label>
                    <input 
                        name="author" 
                        id="author" 
                        type="text" 
                        defaultValue={item.author} 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        placeholder="Enter Author" 
                        disabled
                    />
                </div>  

                <div className="mb-3">
                    <label htmlFor="publisher">Publisher <span className="text-red-500 text-sm">*</span></label>
                    <input 
                        name="publisher" 
                        id="publisher" 
                        type="text" 
                        defaultValue={item.publisher}
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        placeholder="Enter Publisher" 
                        disabled
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="edition">Edition</label>
                    <input 
                        id="edition" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.edition} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="location">Location<span className="text-red-500 text-sm">*</span></label>
                    <input 
                        id="location" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.location} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="description">Description</label>
                    <input 
                        id="description" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.description} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="total_quantity">Total Quantity</label>
                    <input 
                        id="total_quantity" 
                        type="number" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.total_quantity} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="current_quantity">Current Quantity</label>
                    <input 
                        id="current_quantity" 
                        type="number" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.current_quantity} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="min_stock_level">Minimum Stock Level</label>
                    <input 
                        id="min_stock_level" 
                        type="number" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.min_stock_level} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="status">Status</label>
                    <input 
                        id="status" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={item.status} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="status">Created At</label>
                    <input 
                        id="status" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={formatDate(item.createdAt)} 
                        disabled 
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="status">Last Updated At</label>
                    <input 
                        id="status" 
                        type="text" 
                        className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                        defaultValue={formatDate(item.updatedAt)} 
                        disabled 
                    />
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
