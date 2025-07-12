import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useAddInvoiceMutation } from '../../provider/queries/Invoice.query';
import { useGetAllOrdersQuery } from '../../provider/queries/Orders.query';
import { Dropdown } from 'primereact/dropdown';

const InvoiceModel = ({ visible, setVisible }) => {
    const [addInvoice, { isLoading }] = useAddInvoiceMutation();
    const { data: orders, isLoading: isOrderLoading } = useGetAllOrdersQuery();

    // Validation Schema
    const validationSchema = yup.object({
        billNo: yup.number().required("Bill Number is required").positive().integer().min(1),
        billDate: yup.date().required("Bill Date is required"),
        invoiceAmount: yup.number().required("Invoice Amount is required").positive(),
        comment: yup.string().max(100, "Comment should be less than 100 characters"),
    });

    const initialValues = {
        order: '', // Will hold selected order ID
        billNo: '',
        billDate: '',
        invoiceAmount: '',
        comment: '',
    };

    const onSubmitHandler = async (values, { resetForm }) => {
        try {
            const response = await addInvoice(values);
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to add invoice');
                return;
            }
            toast.success("Invoice Added Successfully");
            resetForm();
            setVisible(false);
        } catch (e) {
            console.error('Error occurred:', e);
            toast.error(e.message || 'An error occurred');
        }
    };
    

    return (
        <Dialog header="Add Invoice" visible={visible} className="w-full md:w-[60%] lg:w-[60%]" onHide={() => setVisible(false)}>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler} enableReinitialize>
                {({ handleSubmit, values, setFieldValue }) => {
                    return (
                        <form onSubmit={handleSubmit} className="w-full">
                            <div className="mb-3">
                                <label>Order</label>
                                <Dropdown
                                    value={values.order}
                                    options={orders?.orders?.map(order => ({
                                        label: `${order.orderNumber} / ${order.poNumber}`, // Display both Order Number and PO Number
                                        value: order._id
                                    })) || []}
                                    onChange={(e) => setFieldValue('order', e.value)}
                                    placeholder="Select Order"
                                    className="w-full"
                                    disabled={isOrderLoading}
                                />
                                <ErrorMessage name="order" component="p" className="text-red-500 text-sm" />
                            </div>

                    
                            <div className="mb-3">
                                <label>Bill Number</label>
                                <Field name="billNo" type="number" className="w-full p-3 border border-gray-300 rounded-md" />
                                <ErrorMessage name="billNo" component="p" className="text-red-500 text-sm" />
                            </div>

                            <div className="mb-3">
                                <label>Bill Date</label>
                                <Field name="billDate" type="date" className="w-full p-3 border border-gray-300 rounded-md" />
                                <ErrorMessage name="billDate" component="p" className="text-red-500 text-sm" />
                            </div>

                            <div className="mb-3">
                                <label>Invoice Amount</label>
                                <Field name="invoiceAmount" type="number" className="w-full p-3 border border-gray-300 rounded-md" />
                                <ErrorMessage name="invoiceAmount" component="p" className="text-red-500 text-sm" />
                            </div>

                        

                            <div className="mb-3">
                                <label>Comment</label>
                                <Field name="comment" as="textarea" className="w-full px-5 py-2 rounded-md border border-gray-300" />
                                <ErrorMessage name="comment" component="p" className="text-red-500 text-sm" />
                            </div>

                            <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                                {isLoading ? 'Adding...' : 'Add Invoice'}
                            </Button>
                        </form>
                    );
                }}
            </Formik>
        </Dialog>
    );
};

InvoiceModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};

export default InvoiceModel;
