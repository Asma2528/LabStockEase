import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useAddPracticalMutation } from '../../provider/queries/Practical.query';


const PracticalModel = ({ visible, setVisible }) => {
    const [addPractical, { isLoading }] = useAddPracticalMutation();
    

    // Validation schema
    const validationSchema = yup.object({
            description: yup.string(),
        practicalDate: yup.date(),
        sanctionDate: yup.date(),
        practicalPeriod: yup.string(),
        fundingAgency: yup.string(),
        practicalCost: yup.number().positive(),
        fundStatus: yup.string().oneOf(['Pending', 'Approved', 'Released', 'Completed']),
        practicalInCharge: yup.string(),
        practicalStatus: yup.string().oneOf(['Ongoing', 'Completed', 'On Hold', 'Cancelled']),
    });

    // Initial values
    const initialValues = {
        description:'',
        practicalDate: '',
        sanctionDate: '',
        practicalPeriod: '',
        fundingAgency: '',
        practicalCost: '',
        fundStatus: '',
        practicalInCharge: '',
        practicalStatus: '',
    };

    // Form submission handler
    const onSubmitHandler = async (values, { resetForm }) => {
        try {
            const response = await addPractical(values);

            if (response.error) {
                toast.error(response.error.data.message || 'Failed to add practical');
                return;
            }

            toast.success("Practical Added Successfully");
            resetForm();
            setVisible(false);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'An error occurred');
        }
    };

    return (
        <Dialog
            header="Add Practical"
            position="top"
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
                {({ handleSubmit}) => (
                    <form onSubmit={handleSubmit} className="w-full">
<div className="mb-3">
                            <label htmlFor="description">Description</label>
                            <Field name="description" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Description" />
                            <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
                        </div>
        
                        {/* Practical Date */}
                        <div className="mb-3">
                            <label htmlFor="practicalDate">Practical Date</label>
                            <Field name="practicalDate" type="date" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="practicalDate" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Sanction Date */}
                        <div className="mb-3">
                            <label htmlFor="sanctionDate">Sanction Date</label>
                            <Field name="sanctionDate" type="date" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="sanctionDate" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Practical Period */}
                        <div className="mb-3">
                            <label htmlFor="practicalPeriod">Practical Period</label>
                            <Field name="practicalPeriod" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Practical Period" />
                            <ErrorMessage name="practicalPeriod" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Funding Agency */}
                        <div className="mb-3">
                            <label htmlFor="fundingAgency">Funding Agency</label>
                            <Field name="fundingAgency" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Funding Agency" />
                            <ErrorMessage name="fundingAgency" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Practical Cost */}
                        <div className="mb-3">
                            <label htmlFor="practicalCost">Practical Cost</label>
                            <Field name="practicalCost" type="number" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Practical Cost" />
                            <ErrorMessage name="practicalCost" component="p" className="text-red-500 text-sm" />
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

                        {/* Practical In-Charge */}
                        <div className="mb-3">
                            <label htmlFor="practicalInCharge">Practical In-Charge</label>
                            <Field name="practicalInCharge" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Practical In-Charge" />
                            <ErrorMessage name="practicalInCharge" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Practical Status */}
                        <div className="mb-3">
                            <label htmlFor="practicalStatus">Practical Status</label>
                            <Field as="select" name="practicalStatus" className="w-full px-5 py-2 rounded-md border">
                                <option value="">Select Practical Status</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Cancelled">Cancelled</option>
                            </Field>
                            <ErrorMessage name="practicalStatus" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Practical'}
                        </Button>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

PracticalModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};

export default PracticalModel;
