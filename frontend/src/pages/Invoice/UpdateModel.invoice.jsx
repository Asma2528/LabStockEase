import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useUpdateInvoiceMutation } from '../../provider/queries/Invoice.query';
import { useGetAllOrdersQuery } from '../../provider/queries/Orders.query';
import { Dropdown } from 'primereact/dropdown';


const UpdateInvoiceModel = ({ visible, setVisible, invoice }) => {
    const [updateInvoice, { isLoading }] = useUpdateInvoiceMutation();
    const { data: orders, isLoading: isOrdersLoading } = useGetAllOrdersQuery();


    // Validation Schema for update
    const validationSchema = yup.object({
        order: yup.string().required("Order is required"),
        billNo: yup.number().required("Bill Number is required").positive().integer().min(1),
        billDate: yup.date().required("Bill Date is required"),
        invoiceAmount: yup.number().required("Invoice Amount is required").positive(),
        comment: yup.string().max(100, "Comment should be less than 100 characters"),
    });

    const initialValues = {
        order: invoice?.order?._id || '', // Set selected order from the invoice object
        billNo: invoice?.billNo || '',
        billDate: invoice?.billDate ? new Date(invoice.billDate).toISOString().split('T')[0] : '',
        invoiceAmount: invoice?.invoiceAmount || '',
        comment: invoice?.comment || '',
        status: invoice?.status || 'Pending',
    };

    const onSubmitHandler = async (values, { resetForm }) => {
        try {
            const response = await updateInvoice({ id: invoice._id, ...values });
    
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to update invoice');
                return;
            }
    
            toast.success("Invoice Updated Successfully");
            resetForm();
            setVisible(false);
        } catch (e) {
            toast.error(e.message || 'An error occurred');
        }
    };

    return (
        <Dialog header="Update Invoice" visible={visible} className="w-full md:w-[70%] lg:w-[75%]" onHide={() => setVisible(false)}>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler} enableReinitialize>
                {({ handleSubmit, values, setFieldValue }) => {
                    return (
                        <form onSubmit={handleSubmit} className="w-full">


<div className="mb-3">
    <label>Order</label>
    <Dropdown
        value={values.order}  // Set the vendor ID as value
        options={orders?.orders?.map(order => ({
            label: `${order.orderNumber} / ${order.poNumber}`, // Display the vendor name in the dropdown
            value: order._id  // Use _id for the value
        })) || []}
        onChange={(e) => setFieldValue('order', e.value)}  // Update the value (vendor ID)
        placeholder="Select Order"
        className="w-full border"
        disabled={isOrdersLoading}
    />
    <ErrorMessage name="order" component="p" className="text-red-500 text-sm" />
</div>
                          

                            {/* Bill Number */}
                            <div className="mb-3">
                                <label>Bill Number</label>
                                <Field name="billNo" type="number" className="w-full p-3 border border-gray-300 rounded-md" />
                                <ErrorMessage name="billNo" component="p" className="text-red-500 text-sm" />
                            </div>

                            {/* Bill Date */}
                            <div className="mb-3">
                                <label>Bill Date</label>
                                <Field name="billDate" type="date" className="w-full p-3 border border-gray-300 rounded-md" />
                                <ErrorMessage name="billDate" component="p" className="text-red-500 text-sm" />
                            </div>

                            {/* Invoice Amount */}
                            <div className="mb-3">
                                <label>Invoice Amount</label>
                                <Field name="invoiceAmount" type="number" className="w-full p-3 border border-gray-300 rounded-md" />
                                <ErrorMessage name="invoiceAmount" component="p" className="text-red-500 text-sm" />
                            </div>

                            {/* Comment */}
                            <div className="mb-3">
                                <label>Comment</label>
                                <Field name="comment" as="textarea" className="w-full px-5 py-2 rounded-md border border-gray-300" />
                                <ErrorMessage name="comment" component="p" className="text-red-500 text-sm" />
                            </div>

                            {/* Status Dropdown */}
                            <div className="mb-3">
                                <label>Status</label>
                                <Field as="select" name="status" className="w-full px-5 py-2 rounded-md" disabled={['Pending', 'Rejected'].includes(values.status)}>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="On hold">On hold</option>
                                </Field>
                                <ErrorMessage name="status" component="p" className="text-red-500 text-sm" />
                            </div>

                            <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Invoice'}
                            </Button>
                        </form>
                    );
                }}
            </Formik>
        </Dialog>
    );
};

UpdateInvoiceModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    invoice: PropTypes.object.isRequired,
};

export default UpdateInvoiceModel;
