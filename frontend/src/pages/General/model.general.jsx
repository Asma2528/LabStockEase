import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useAddGeneralMutation } from '../../provider/queries/General.query';


const GeneralModel = ({ visible, setVisible }) => {
    const [addGeneral, { isLoading }] = useAddGeneralMutation();
    

    // Validation schema
    const validationSchema = yup.object({
        generalDate: yup.date(),
        sanctionDate: yup.date(),
        generalPeriod: yup.string(),
        fundingAgency: yup.string(),
       description: yup.string(),
        generalCost: yup.number().positive(),
        fundStatus: yup.string().oneOf(['Pending', 'Approved', 'Released', 'Completed']),
        generalInCharge: yup.string(),
        generalStatus: yup.string().oneOf(['Ongoing', 'Completed', 'On Hold', 'Cancelled']),
    });

    // Initial values
    const initialValues = {
        description:'',
        generalDate: '',
        sanctionDate: '',
        generalPeriod: '',
        fundingAgency: '',
        generalCost: '',
        fundStatus: '',
        generalInCharge: '',
        generalStatus: '',
    };

    // Form submission handler
    const onSubmitHandler = async (values, { resetForm }) => {
        try {
            const response = await addGeneral(values);

            if (response.error) {
                toast.error(response.error.data.message || 'Failed to add general');
                return;
            }

            toast.success("General Added Successfully");
            resetForm();
            setVisible(false);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'An error occurred');
        }
    };

    return (
        <Dialog
            header="Add General"
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

                        {/* General Date */}
                        <div className="mb-3">
                            <label htmlFor="generalDate">General Date</label>
                            <Field name="generalDate" type="date" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="generalDate" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Sanction Date */}
                        <div className="mb-3">
                            <label htmlFor="sanctionDate">Sanction Date</label>
                            <Field name="sanctionDate" type="date" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="sanctionDate" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* General Period */}
                        <div className="mb-3">
                            <label htmlFor="generalPeriod">General Period</label>
                            <Field name="generalPeriod" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter General Period" />
                            <ErrorMessage name="generalPeriod" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Funding Agency */}
                        <div className="mb-3">
                            <label htmlFor="fundingAgency">Funding Agency</label>
                            <Field name="fundingAgency" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Funding Agency" />
                            <ErrorMessage name="fundingAgency" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* General Cost */}
                        <div className="mb-3">
                            <label htmlFor="generalCost">General Cost</label>
                            <Field name="generalCost" type="number" className="w-full px-5 py-2 rounded-md border" placeholder="Enter General Cost" />
                            <ErrorMessage name="generalCost" component="p" className="text-red-500 text-sm" />
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

                        {/* General In-Charge */}
                        <div className="mb-3">
                            <label htmlFor="generalInCharge">General In-Charge</label>
                            <Field name="generalInCharge" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter General In-Charge" />
                            <ErrorMessage name="generalInCharge" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* General Status */}
                        <div className="mb-3">
                            <label htmlFor="generalStatus">General Status</label>
                            <Field as="select" name="generalStatus" className="w-full px-5 py-2 rounded-md border">
                                <option value="">Select General Status</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Cancelled">Cancelled</option>
                            </Field>
                            <ErrorMessage name="generalStatus" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add General'}
                        </Button>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

GeneralModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};

export default GeneralModel;
