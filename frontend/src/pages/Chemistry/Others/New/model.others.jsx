import { Dialog } from 'primereact/dialog';
import { Formik, ErrorMessage, Field } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useAddOthersItemMutation } from '../../../../provider/queries/Others.query';

const Model = ({ visible, setVisible }) => {
    const [addOthersItem, { isLoading }] = useAddOthersItemMutation();

    const validationSchema = yup.object({
        item_name: yup.string().required("Item name is required"),
        category: yup.string().required("Category is required"),
        company: yup.string().required("Company/Brand is required"),
        purpose: yup.string(),
        min_stock_level: yup.number().required("Minimum stock level is required").positive().integer(),
                        total_quantity: yup.number().required("Total Quantity is required").positive().integer(),
        
        unit_of_measure: yup.string().required("Unit of measurement is required"),
        description: yup.string(),
    });

    const initialValues = {
        item_name: '',
        category: '',
        company: '',
        purpose: '',
        min_stock_level: 0,
        total_quantity: 0,
        unit_of_measure: '',
        description: '',
    };

    const onSubmitHandler = async (values, { resetForm }) => {
        try {
            const response = await addOthersItem(values);
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to add item');
                return;
            }
            toast.success("Others Item Added Successfully");
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
                            <label htmlFor="category">Category <span className="text-red-500 text-sm">*</span></label>
                            <Field name="category" id="category" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Category" />
                            <ErrorMessage name='category' component={'p'} className='text-red-500 text-sm' />
                        </div>

                      
                        <div className="mb-3">
                            <label htmlFor="company">Company/Brand <span className="text-red-500 text-sm">*</span></label>
                            <Field name="company" id="company" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Company/Brand" />
                            <ErrorMessage name='company' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="purpose">Purpose</label>
                            <Field name="purpose" id="purpose" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Purpose" />
                            <ErrorMessage name='purpose' component={'p'} className='text-red-500 text-sm' />
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
                            <label htmlFor="unit_of_measure">Unit of Measure <span className="text-red-500 text-sm">*</span></label>
                            <Field
                                name="unit_of_measure"
                                id="unit_of_measure"
                                as="select"
                                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                            >
                                <option value="" label="Select unit" />
                                <option value="ml" label="Milliliter (ml)" />
                                <option value="l" label="Liter (l)" />
                                <option value="g" label="Gram (g)" />
                                <option value="kg" label="Kilogram (kg)" />
                                <option value="m^3" label="Cubic Meter (m³)" />
                                <option value="pcs" label="Pieces (pcs)" />
                                <option value="sets" label="Sets" />
                                <option value="boxes" label="Boxes" />
                                <option value="packs" label="Packs" />
                                <option value="meters" label="Meters (m)" />
                            </Field>
                            <ErrorMessage name="unit_of_measure" component="p" className="text-red-500 text-sm" />
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
