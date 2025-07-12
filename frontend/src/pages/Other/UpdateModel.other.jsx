import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useUpdateOtherMutation } from '../../provider/queries/Other.query';

const UpdateOtherModel = ({ visible, setVisible, other }) => {
    const [updateOther, { isLoading }] = useUpdateOtherMutation();

    // Validation schema for other fields
    const validationSchema = yup.object({
        otherDate: yup.date(),
        sanctionDate: yup.date(),
        otherPeriod: yup.string(),
        fundingAgency: yup.string(),
        otherCost: yup.number().positive(),
        fundStatus: yup.string().oneOf(['Pending', 'Approved', 'Released', 'Completed']),
        otherInCharge: yup.string(),
        otherStatus: yup.string().oneOf(['Ongoing', 'Completed', 'On Hold', 'Cancelled']),
    });

    // Define initial values with reinitialization
    const initialValues = {
        description: other?.description || '',
        otherDate: other?.otherDate || '',
        sanctionDate: other?.sanctionDate || '',
        otherPeriod: other?.otherPeriod || '',
        fundingAgency: other?.fundingAgency || '',
        otherCost: other?.otherCost || '',
        fundStatus: other?.fundStatus || '',
        otherInCharge: other?.otherInCharge || '',
        otherStatus: other?.otherStatus || '',
    };

    // Form submission handler
    const onSubmitHandler = async (values) => {
        try {
            const response = await updateOther({ id: other._id, ...values });

            // Handle error response
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to update other');
                return;
            }

            // Success feedback
            toast.success("Other Updated Successfully");
            setVisible(false);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'An error occurred');
        }
    };

    return (
        <Dialog
            header="Update Other"
            visible={visible}
            className="w-full md:w-[70%] lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmitHandler}
                enableReinitialize
            >
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="w-full">
                <div className="mb-3">
                            <label htmlFor="description">Description</label>
                            <Field name="description" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Description" />
                            <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Other Date */}
                        <div className="mb-3">
                            <label htmlFor="otherDate">Other Date</label>
                            <Field name="otherDate" type="date" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="otherDate" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Sanction Date */}
                        <div className="mb-3">
                            <label htmlFor="sanctionDate">Sanction Date</label>
                            <Field name="sanctionDate" type="date" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="sanctionDate" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Other Period */}
                        <div className="mb-3">
                            <label htmlFor="otherPeriod">Other Period</label>
                            <Field name="otherPeriod" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Other Period" />
                            <ErrorMessage name="otherPeriod" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Funding Agency */}
                        <div className="mb-3">
                            <label htmlFor="fundingAgency">Funding Agency</label>
                            <Field name="fundingAgency" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Funding Agency" />
                            <ErrorMessage name="fundingAgency" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Other Cost */}
                        <div className="mb-3">
                            <label htmlFor="otherCost">Other Cost</label>
                            <Field name="otherCost" type="number" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Other Cost" />
                            <ErrorMessage name="otherCost" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Fund Status */}
                        <div className="mb-3">
                            <label htmlFor="fundStatus">Fund Status</label>
                            <Field as="select" name="fundStatus" className="w-full px-5 py-2 rounded-md border">
                                <option value="">Select Fund Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Released">Released</option>
                                <option value="Completed">Completed</option>
                            </Field>
                            <ErrorMessage name="fundStatus" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Other In-Charge */}
                        <div className="mb-3">
                            <label htmlFor="otherInCharge">Other In-Charge</label>
                            <Field name="otherInCharge" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Other In-Charge" />
                            <ErrorMessage name="otherInCharge" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Other Status */}
                        <div className="mb-3">
                            <label htmlFor="otherStatus">Other Status</label>
                            <Field as="select" name="otherStatus" className="w-full px-5 py-2 rounded-md border">
                                <option value="">Select Other Status</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Cancelled">Cancelled</option>
                            </Field>
                            <ErrorMessage name="otherStatus" component="p" className="text-red-500 text-sm" />
                        </div>

                        <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Other'}
                        </Button>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

UpdateOtherModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    other: PropTypes.object.isRequired,
};

export default UpdateOtherModel;
