import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useUpdateVendorMutation } from '../../provider/queries/Vendors.query';

const UpdateVendorModel = ({ visible, setVisible, vendor }) => {
    // Validation schema for vendor fields
    const validationSchema = yup.object({
        name: yup.string().required("Vendor Name is required"),
        email: yup.string().required("Vendor Email is required"),
        contact_person: yup.string().required("Contact Person is required"),
        contact_no: yup.string()
            .required("Contact Number is required")
            .matches(/^\d{10}$/, "Must be a valid 10-digit number"),
        classification: yup.string().required("Class is required"),
        gst_no: yup.string().required("GST Number is required"),
        tan_pan_no: yup.string().required("PAN/TAN Number is required"),
        grading: yup.string().required("Grading is required"),
        address: yup.string().required("Address is required"),
    });

    // Define initial values with reinitialization
    const initialValues = {
        name: vendor?.name || '',
        email: vendor?.email || '',
        contact_person: vendor?.contact_person || '',
        contact_no: vendor?.contact_no || '',
        classification: vendor?.classification || '',
        gst_no: vendor?.gst_no || '',
        tan_pan_no: vendor?.tan_pan_no || '',
        grading: vendor?.grading || '',
        address: vendor?.address || '',
    };

    const [updateVendor, { isLoading }] = useUpdateVendorMutation();

    const handleSubmit = async (values) => {

        try {
            const response = await updateVendor({ id: vendor._id, ...values });
      
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to update vendor');
                return;
            }
            toast.success('Vendor updated successfully');
            setVisible(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Dialog
            header="Update Vendor"
            visible={visible}
            className="w-[90%] mx-auto lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, handleChange }) => (
                    <Form className="w-full">
                        {/* Vendor Name */}

                   

                        <div className="mb-3">
                            <label>Vendor Name</label>
                            <Field name="name" type="text" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="name" component="p" className="text-red-500" />
                        </div>

                        <div className="mb-3">
                            <label>Vendor Email</label>
                            <Field name="email" type="text" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="email" component="p" className="text-red-500" />
                        </div>

                        {/* Contact Person */}
                        <div className="mb-3">
                            <label>Contact Person</label>
                            <Field name="contact_person" type="text" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="contact_person" component="p" className="text-red-500" />
                        </div>

                        {/* Contact Number */}
                        <div className="mb-3">
                            <label>Contact Number</label>
                            <Field name="contact_no" type="text" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="contact_no" component="p" className="text-red-500" />
                        </div>

                        {/* Classification Dropdown */}
                        <div className="mb-3">
                            <label>Class</label>
                            <Field
                                as="select"
                                name="classification"
                                value={values.classification}
                                onChange={handleChange}
                                className="w-full px-5 py-2 rounded-md border"
                            >
                                <option value="">Select Class</option>
                                <option value="Capital">Capital</option>
                                <option value="Consumables">Consumables</option>
                                <option value="Chemicals">Chemicals</option>
                                <option value="Glassware">Glassware</option>
                                <option value="Books">Books</option>
                                <option value="Others">Others</option>
                            </Field>
                            <ErrorMessage name="classification" component="p" className="text-red-500" />
                        </div>

                        {/* GST Number */}
                        <div className="mb-3">
                            <label>GST Number</label>
                            <Field name="gst_no" type="text" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="gst_no" component="p" className="text-red-500" />
                        </div>

                        {/* PAN/TAN Number */}
                        <div className="mb-3">
                            <label>PAN/TAN Number</label>
                            <Field name="tan_pan_no" type="text" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="tan_pan_no" component="p" className="text-red-500" />
                        </div>

                        {/* Grading Dropdown */}
                        <div className="mb-3">
                            <label>Vendor Grading</label>
                            <Field as="select" name="grading" className="w-full px-5 py-2 rounded-md border">
                                <option value="">Select Grading</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                            </Field>
                            <ErrorMessage name="grading" component="p" className="text-red-500" />
                        </div>

                        {/* Address */}
                        <div className="mb-3">
                            <label>Address</label>
                            <Field name="address" type="text" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="address" component="p" className="text-red-500" />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button type="submit" className="bg-blue-900 text-white py-2 px-4 rounded-md" loading={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Vendor'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

UpdateVendorModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    vendor: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        contact_person: PropTypes.string.isRequired,
        contact_no: PropTypes.string.isRequired,
        classification: PropTypes.string.isRequired,
        gst_no: PropTypes.string,
        tan_pan_no: PropTypes.string,
        grading: PropTypes.string,
        address: PropTypes.string,
    }).isRequired,
};

export default UpdateVendorModel;
