import { Dialog } from 'primereact/dialog';
import { Formik, ErrorMessage, Field } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useAddBooksItemMutation } from '../../../../provider/queries/Books.query';

const Model = ({ visible, setVisible }) => {
    const [addBooksItem, { isLoading }] = useAddBooksItemMutation();

    const validationSchema = yup.object({
        item_name: yup.string().required("Item name is required"),
        author: yup.string().required("Author is required"),
        publisher: yup.string().required("Publisher is required"),
        edition: yup.string(),
        location: yup.string().required("Location is required"),
                        total_quantity: yup.number().required("Total Quantity is required").positive().integer(),
        
        min_stock_level: yup.number().required("Minimum stock level is required").positive().integer(),
        description: yup.string(),
    });

    const initialValues = {
        item_name: '',
        author: '',
        publisher: '',
        edition: '',
        location: '',
        min_stock_level: 0,
        total_quantity: 0,
        description: '',
    };

    const onSubmitHandler = async (values, { resetForm }) => {
        try {
            const response = await addBooksItem(values);
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to add item');
                return;
            }
            toast.success("Books Item Added Successfully");
            resetForm();
            setVisible(false);
        } catch (e) {
            toast.error(e.message || 'An error occurred');
        }
    };

    return (
        <Dialog header="Add Item" position='top' visible={visible} className="w-full md:w-[70%] lg:w-1/2" onHide={() => setVisible(false)} draggable={false}>
            <Formik onSubmit={onSubmitHandler} initialValues={initialValues} validationSchema={validationSchema}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="w-full">

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
                            <label htmlFor="publisher">Publisher <span className="text-red-500 text-sm">*</span></label>
                            <Field name="publisher" id="publisher" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Publisher" />
                            <ErrorMessage name='publisher' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="edition">Edition</label>
                            <Field name="edition" id="edition" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Edition" />
                            <ErrorMessage name='edition' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="location">Location<span className="text-red-500 text-sm">*</span></label>
                            <Field name="location" id="location" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Location" />
                            <ErrorMessage name='location' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="min_stock_level">Minimum Stock Level <span className="text-red-500 text-sm">*</span></label>
                            <Field name="min_stock_level" id="min_stock_level" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Minimum Stock Level" />
                            <ErrorMessage name='min_stock_level' component={'p'} className='text-red-500 text-sm' />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="total_quantity">Total Quantity <span className="text-red-500 text-sm">*</span></label>
                            <Field name="total_quantity" id="total_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Total Quantity" />
                            <ErrorMessage name='total_quantity' component={'p'} className='text-red-500 text-sm' />
                        </div>
                       

                        <div className="mb-3">
                            <label htmlFor="description">Description</label>
                            <Field name="description" id="description" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Description" />
                            <ErrorMessage name='description' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <Button type="submit" className='w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center' disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Item'}
                        </Button>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

// PropTypes validation
Model.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};

export default Model;
