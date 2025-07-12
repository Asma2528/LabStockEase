import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useUpdateProjectMutation } from '../../provider/queries/Projects.query';

const UpdateProjectModel = ({ visible, setVisible, project }) => {
    const [updateProject, { isLoading }] = useUpdateProjectMutation();

    // Validation schema for project fields
    const validationSchema = yup.object({
        projectDate: yup.date().required("Project Date is required"),
        sanctionDate: yup.date().required("Sanction Date is required"),
        projectPeriod: yup.string().required("Project Period is required"),
        fundingAgency: yup.string().required("Funding Agency is required"),
        projectCost: yup.number().required("Project Cost is required").positive(),
        fundStatus: yup.string().required("Fund Status is required").oneOf(['Pending', 'Approved', 'Released', 'Completed']),
        projectInCharge: yup.string().required("Project In-Charge is required"),
        projectStatus: yup.string().required("Project Status is required").oneOf(['Ongoing', 'Completed', 'On Hold', 'Cancelled']),
    });

    // Define initial values with reinitialization
    const initialValues = {
       description: project?.description || '',
        projectDate: project?.projectDate || '',
        sanctionDate: project?.sanctionDate || '',
        projectPeriod: project?.projectPeriod || '',
        fundingAgency: project?.fundingAgency || '',
        projectCost: project?.projectCost || '',
        fundStatus: project?.fundStatus || '',
        projectInCharge: project?.projectInCharge || '',
        projectStatus: project?.projectStatus || '',
    };

    // Form submission handler
    const onSubmitHandler = async (values) => {
        try {
            const response = await updateProject({ id: project._id, ...values });

            // Handle error response
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to update project');
                return;
            }

            // Success feedback
            toast.success("Project Updated Successfully");
            setVisible(false);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'An error occurred');
        }
    };

    return (
        <Dialog
            header="Update Project"
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


                        {/* Project Date */}
                        <div className="mb-3">
                            <label htmlFor="projectDate">Project Date</label>
                            <Field name="projectDate" type="date" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="projectDate" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Sanction Date */}
                        <div className="mb-3">
                            <label htmlFor="sanctionDate">Sanction Date</label>
                            <Field name="sanctionDate" type="date" className="w-full px-5 py-2 rounded-md border" />
                            <ErrorMessage name="sanctionDate" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Project Period */}
                        <div className="mb-3">
                            <label htmlFor="projectPeriod">Project Period</label>
                            <Field name="projectPeriod" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Project Period" />
                            <ErrorMessage name="projectPeriod" component="p" className="text-red-500 text-sm" />
                        </div>

                

                        {/* Funding Agency */}
                        <div className="mb-3">
                            <label htmlFor="fundingAgency">Funding Agency</label>
                            <Field name="fundingAgency" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Funding Agency" />
                            <ErrorMessage name="fundingAgency" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Project Cost */}
                        <div className="mb-3">
                            <label htmlFor="projectCost">Project Cost</label>
                            <Field name="projectCost" type="number" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Project Cost" />
                            <ErrorMessage name="projectCost" component="p" className="text-red-500 text-sm" />
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

                        {/* Project In-Charge */}
                        <div className="mb-3">
                            <label htmlFor="projectInCharge">Project In-Charge</label>
                            <Field name="projectInCharge" type="text" className="w-full px-5 py-2 rounded-md border" placeholder="Enter Project In-Charge" />
                            <ErrorMessage name="projectInCharge" component="p" className="text-red-500 text-sm" />
                        </div>

                        {/* Project Status */}
                        <div className="mb-3">
                            <label htmlFor="projectStatus">Project Status</label>
                            <Field as="select" name="projectStatus" className="w-full px-5 py-2 rounded-md border">
                                <option value="">Select Project Status</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Cancelled">Cancelled</option>
                            </Field>
                            <ErrorMessage name="projectStatus" component="p" className="text-red-500 text-sm" />
                        </div>

                        <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Project'}
                        </Button>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

UpdateProjectModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    project: PropTypes.object.isRequired,
};

export default UpdateProjectModel;
