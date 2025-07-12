import { Dialog } from 'primereact/dialog';
import { Formik, ErrorMessage, Field } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useAddVendorMutation } from '../../provider/queries/Vendors.query';

const VendorModel = ({ visible, setVisible }) => {
    const [addVendor, { isLoading }] = useAddVendorMutation();

    // Validation schema using yup
    const validationSchema = yup.object({
        name: yup.string().required("Vendor name is required"),
        email: yup.string().required("Vendor email is required"),
        contact_person: yup.string().required("Contact person is required"),
        contact_no: yup.string()
            .required("Contact number is required")
            .matches(/^[0-9]{10}$/, "Contact number must be a 10-digit number"),
        classification: yup.string()
            .required("Class is required")
            .oneOf(['Capital', 'Consumables', 'Chemical', 'Glassware', 'Books', 'Others'], "Invalid class"),
        tan_pan_no: yup.string()
            .required("TAN/PAN number is required")
            .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "TAN/PAN number must be in the format: 5 letters, 4 numbers, 1 letter"),
        gst_no: yup.string()
            .required("GST number is required")
            .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "GST number must follow the correct format"),
        grading: yup.string()
            .required("Vendor grading is required")
            .oneOf(['A', 'B', 'C', 'D', 'E'], "Invalid grading"),
        address: yup.string().required("Address is required"),
    });

    // Initial values for the form
    const initialValues = {
        name: '',
        email: '',
        contact_person: '',
        contact_no: '',
        classification: '',
        tan_pan_no: '',
        gst_no: '',
        grading: '',
        address: '',
    };

    // Form submission handler
    const onSubmitHandler = async (values, { resetForm }) => {
        console.log('Submitting form with values:', values);
        try {
            const response = await addVendor(values);
            console.log('API Response:', response);

            // Handle error response
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to add vendor');
                return;
            }

            // Success feedback
            toast.success("Vendor Added Successfully");
            resetForm();
            setVisible(false);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'An error occurred');
        }
    };

    return (
        <Dialog
            header="Add Vendor"
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
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="w-full">

                       
                        {/* Vendor Name */}
                        <div className="mb-3">
                            <label htmlFor="name">Vendor Name</label>
                            <Field name="name" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Vendor Name" />
                            <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
                        </div>


     <div className="mb-3">
                            <label htmlFor="email">Vendor Email</label>
                            <Field name="email" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Vendor Email" />
                            <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Contact Person */}
                        <div className="mb-3">
                            <label htmlFor="contact_person">Contact Person</label>
                            <Field name="contact_person" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Contact Person" />
                            <ErrorMessage name="contact_person" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Contact Number */}
                        <div className="mb-3">
                            <label htmlFor="contact_no">Contact Number</label>
                            <Field name="contact_no" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter 10-digit Contact Number" />
                            <ErrorMessage name="contact_no" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Vendor Classification */}
                        <div className="mb-3">
                            <label htmlFor="classification">Class</label>
                            <Field as="select" name="classification" className="w-full px-5 py-2 rounded-md border">
                                <option value="">Select Class</option>
                                <option value="Capital">Capital</option>
                                <option value="Consumables">Consumables</option>
                                <option value="Chemical">Chemical</option>
                                <option value="Glassware">Glassware</option>
                                <option value="Books">Books</option>
                                <option value="Others">Others</option>
                            </Field>
                            <ErrorMessage name="classification" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* TAN/PAN Number */}
                        <div className="mb-3">
                            <label htmlFor="tan_pan_no">TAN/PAN Number</label>
                            <Field name="tan_pan_no" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter TAN/PAN Number" />
                            <ErrorMessage name="tan_pan_no" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* GST Number */}
                        <div className="mb-3">
                            <label htmlFor="gst_no">GST Number</label>
                            <Field name="gst_no" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter GST Number" />
                            <ErrorMessage name="gst_no" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Vendor Grading */}
                        <div className="mb-3">
                            <label htmlFor="grading">Grading</label>
                            <Field as="select" name="grading" className="w-full px-5 py-2 rounded-md border">
                                <option value="">Select Grading</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                            </Field>
                            <ErrorMessage name="grading" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Address */}
                        <div className="mb-3">
                            <label htmlFor="address">Address</label>
                            <Field name="address" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Address" />
                            <ErrorMessage name="address" component="p" className="text-red-500 text-sm" />
                        </div>

                        <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Vendor'}
                        </Button>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

VendorModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};

export default VendorModel;
