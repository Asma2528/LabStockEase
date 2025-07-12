import PropTypes from 'prop-types';
import * as yup from 'yup';
import { ErrorMessage, Field, Formik } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import { useUpdateBooksItemMutation } from '../../../../provider/queries/Books.query';


const UpdateModel = ({ visible, setVisible, item }) => {

    // Validation schema (excludes non-updatable fields like item_code, total_quantity, etc.)
    const validationSchema = yup.object({
        item_name: yup.string().required("Item Name is required"),
        author: yup.string().required("Author is required"),
        publisher: yup.string().required("Publisher is required"),
        location: yup.string().required("Location is required"),
        min_stock_level: yup.number().required("Minimum Stock Level is required").positive().integer(),
        edition: yup.string(),
        description: yup.string(),
    });

    const initialValues = {
        item_name: item?.item_name || '',
        author: item?.author || '',
        publisher: item?.publisher || '',
        location: item?.location || '',
        min_stock_level: item?.min_stock_level || 0,
        edition: item?.edition || '',
        description: item?.description || '',
    };

    const [updateBooksItem, updateBooksResponse] = useUpdateBooksItemMutation();

    const onSubmitHandler = async (values) => {
        try {
            const response = await updateBooksItem({
                data: values,
                id: item._id,
            });

            if (response.error) {
                toast.error(response.error.data.message || 'Update failed');
                return;
            }

            toast.success('Item updated successfully');
            setVisible(false);
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Dialog header="Update Item" draggable={false} visible={visible} className='w-[90%] mx-auto lg:mx-0 lg:w-1/2' onHide={() => setVisible(false)}>
            <Formik onSubmit={onSubmitHandler} initialValues={initialValues} validationSchema={validationSchema}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="w-full">
                        {/* Display Item Code */}
                        <div className="mb-3">
                            <label htmlFor="item_code">Item Code</label>
                            <input id="item_code" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.item_code} disabled />
                        </div>

                        {/* Editable fields */}
                        <div className="mb-3">
                            <label htmlFor="item_name">Item Name <span className="text-red-500 text-sm">*</span></label>
                            <Field name="item_name" id="item_name" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Item Name" />
                            <ErrorMessage name='item_name' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="author">Author <span className="text-red-500 text-sm">*</span></label>
                            <Field name="author" id="author" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Author" />
                            <ErrorMessage name='author' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="publisher">Publisher<span className="text-red-500 text-sm">*</span></label>
                            <Field name="publisher" id="publisher" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Publisher" />
                            <ErrorMessage name='publisher' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="edition">Edition </label>
                            <Field name="edition" id="edition" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Edition" />
                            <ErrorMessage name='edition' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description">Description</label>
                            <Field name="description" id="description" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Description" />
                            <ErrorMessage name='description' component={'p'} className='text-red-500 text-sm' />
                        </div>
                        


                        <div className="mb-3">
                            <label htmlFor="location">Location</label>
                            <Field name="location" id="location" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Location" />
                            <ErrorMessage name='location' component={'p'} className='text-red-500 text-sm' />
                        </div>



                        {/* Display Total Quantity and Current Quantity (disabled) */}
                        <div className="mb-3">
                            <label htmlFor="total_quantity">Total Quantity</label>
                            <input id="total_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.total_quantity} disabled />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="current_quantity">Current Quantity</label>
                            <input id="current_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.current_quantity} disabled />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="min_stock_level">Minimum Stock Level <span className="text-red-500 text-sm">*</span></label>
                            <Field name="min_stock_level" id="min_stock_level" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Minimum Stock Level" />
                            <ErrorMessage name='min_stock_level' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        {/* Display Status (disabled) */}
                        <div className="mb-3">
                            <label htmlFor="status">Status</label>
                            <input id="status" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" value={item.status} disabled />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" loading={updateBooksResponse.isLoading} className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2">
                                Update Item
                            </Button>
                        </div>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

// PropTypes validation
UpdateModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    item: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        item_code: PropTypes.string.isRequired,
        item_name: PropTypes.string,
       author: PropTypes.string,
        publisher: PropTypes.string,
        edition: PropTypes.string,
        location: PropTypes.string,
        total_quantity: PropTypes.number,
        current_quantity: PropTypes.number,
        min_stock_level: PropTypes.number,
        description: PropTypes.string,
        status: PropTypes.string.isRequired,
    }),
};

export default UpdateModel;
