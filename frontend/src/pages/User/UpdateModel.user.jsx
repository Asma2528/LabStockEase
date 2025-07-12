import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage, Form } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useUpdateUserMutation } from '../../provider/queries/Auth.query';

const UpdateUserModal = ({ visible, setVisible, item }) => {
    const [updateUser, { isLoading }] = useUpdateUserMutation();

    console.log("User Item:", item); // Debugging

    // Validation Schema
    const validationSchema = yup.object({
        name: yup.string().required('Name is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
        roles: yup.array().min(1, 'At least one role is required'),
    });

    // Initial Values (Pre-filled with existing user data)
    const initialValues = {
        name: item?.name || '',
        email: item?.email || '',
        roles: item?.roles || [],
    };

    // Available roles
    const roleOptions = [
        { label: 'Admin', value: 'admin' },
        { label: 'Lab Assistant', value: 'lab-assistant' },
        { label: 'Faculty', value: 'faculty' },
        { label: 'Manager', value: 'manager' },
        { label: 'Stores', value: 'stores' },
        { label: 'Accountant', value: 'accountant' },
    ];

    const handleSubmit = async (values) => {
        if (!item?._id) {
            toast.error("User ID is missing. Cannot update user.");
            return;
        }

        try {
            console.log("Updating User ID:", item._id);
            console.log(values);
            
            const response = await updateUser({ userId: item._id, userData:values });

            if (response.error) {
                toast.error(response.error.data.message || 'Failed to update user');
                return;
            }
            toast.success('User updated successfully');
            setVisible(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Dialog
            header="Update User"
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
                {({ values, setFieldValue }) => (
                    <Form className="w-full">
                        {/* Name Field */}
                        <div className="mb-3">
                            <label>Name</label>
                            <Field
                                name="name"
                                type="text"
                                className="w-full px-5 py-2 rounded-md border"
                            />
                            <ErrorMessage name="name" component="p" className="text-red-500" />
                        </div>

                        {/* Email Field */}
                        <div className="mb-3">
                            <label>Email</label>
                            <Field
                                name="email"
                                type="text"
                                className="w-full px-5 py-2 rounded-md border"
                            />
                            <ErrorMessage name="email" component="p" className="text-red-500" />
                        </div>

                        {/* Roles MultiSelect */}
                        <div className="mb-3">
                            <label>Roles</label>
                            <MultiSelect
                                name="roles"
                                value={values.roles}
                                options={roleOptions}
                                onChange={(e) => setFieldValue('roles', e.value)}
                                optionLabel="label"
                                className="w-full border p-2 rounded-md"
                                placeholder="Select roles"
                            />
                            <ErrorMessage name="roles" component="p" className="text-red-500" />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="bg-blue-900 text-white py-2 px-4 rounded-md"
                                loading={isLoading}
                            >
                                {isLoading ? 'Updating...' : 'Update User'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

UpdateUserModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    item: PropTypes.shape({
        _id: PropTypes.string.isRequired,  // ✅ FIX: Use _id instead of id
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        roles: PropTypes.array.isRequired,
    })
};

export default UpdateUserModal;
