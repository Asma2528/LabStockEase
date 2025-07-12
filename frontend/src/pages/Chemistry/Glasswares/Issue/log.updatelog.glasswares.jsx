import PropTypes from 'prop-types';
import * as yup from 'yup';
import { ErrorMessage, Field, Formik } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import { useUpdateLogMutation } from '../../../../provider/queries/Glasswares.query'; 
import { format } from 'date-fns';
import { useSelector } from 'react-redux';


const UpdateModel = ({ visible, setVisible, log }) => {

console.log(log);
    const user = useSelector((state) => state.user);

    // Define validation schema
    const validationSchema = yup.object({
        issued_quantity: yup.number().required("Issued Quantity is required").min(0, "Quantity must be zero or greater").integer(),
        date_issued: yup.date().required("Date Issued is required"),
    });

    // Set initial values, ensuring they come from the log prop
    const initialValues = {
        item_code: log?.item?.item_code || '',
        item_name: log?.item?.item_name || '',
        current_quantity: log?.item?.current_quantity || 0,  
        issued_quantity: log?.issued_quantity || 0,
        date_issued: log?.date_issued ? format(new Date(log.date_issued), 'yyyy-MM-dd') : '',
    };

    const [updateGlasswaresLog] = useUpdateLogMutation(); 

    const onSubmitHandler = async (values) => {
        try {
            const formattedValues = {
                ...values,
                date_issued: new Date(values.date_issued).toISOString(),
                item_id: log.item._id,
                user_email: user.email, 
            };

        
            const response = await updateGlasswaresLog({
                logId: log._id.trim(),  // Ensure this is correct
                logData: formattedValues,  // This should contain the formatted values
            });


            if (response.error) {
                toast.error(response.error.data.message || 'Update failed');
                return;
            }

            toast.success('Log updated successfully');
            setVisible(false);
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Dialog header="Update Log" draggable={false} visible={visible} className='w-[90%] mx-auto lg:mx-0 lg:w-1/2' onHide={() => setVisible(false)}>
            <Formik onSubmit={onSubmitHandler} initialValues={initialValues} validationSchema={validationSchema}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="mb-3">
                            <label htmlFor="item_code">Item Code</label>
                            <Field name="item_code" id="item_code" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" readOnly />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="item_name">Item Name</label>
                            <Field name="item_name" id="item_name" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" readOnly />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="current_quantity">Current Quantity</label>
                            <Field name="current_quantity" id="current_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" readOnly />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="issued_quantity">Issued Quantity <span className="text-red-500 text-sm">*</span></label>
                            <Field name="issued_quantity" id="issued_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" />
                            <ErrorMessage name='issued_quantity' component='p' className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="date_issued">Date Issued <span className="text-red-500 text-sm">*</span></label>
                            <Field name="date_issued" id="date_issued" type="date" className="w-full px-5 py-2 rounded-md outline-none border-1 border" />
                            <ErrorMessage name='date_issued' component='p' className='text-red-500 text-sm' />
                        </div>

                        {/* <div className="mb-3">
                            <label htmlFor="returned_quantity">Returned Quantity</label>
                            <Field name="returned_quantity" id="returned_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" readOnly />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="lost_or_damaged_quantity">Lost/ Damaged Quantity <span className="text-red-500 text-sm">*</span></label>
                            <Field name="lost_or_damaged_quantity" id="lost_or_damaged_quantity" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" />
                            <ErrorMessage name='lost_or_damaged_quantity' component='p' className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="date_returned">Date Returned <span className="text-red-500 text-sm">*</span></label>
                            <Field name="date_returned" id="date_returned" type="date" className="w-full px-5 py-2 rounded-md outline-none border-1 border" />
                            <ErrorMessage name='date_returned' component='p' className='text-red-500 text-sm' />
                        </div> */}

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2">
                                Update Log
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
    log: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        item: PropTypes.shape({
            _id: PropTypes.string.isRequired,
            item_code: PropTypes.string,
            item_name: PropTypes.string,
            current_quantity: PropTypes.number,
        }),
        issued_quantity: PropTypes.number,
        current_quantity: PropTypes.number,
        date_issued: PropTypes.string,
    }).isRequired,
};

export default UpdateModel;
