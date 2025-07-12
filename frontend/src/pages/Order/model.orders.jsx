import { Dialog } from 'primereact/dialog';
import { Formik, Field, FieldArray, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useAddOrderMutation } from '../../provider/queries/Orders.query';
import { useGetAllVendorsQuery } from '../../provider/queries/Vendors.query';
import { Dropdown } from 'primereact/dropdown';
import { useGetAllChemicalsItemsQuery } from '../../provider/queries/Chemicals.query';
import { useGetAllOthersItemsQuery } from '../../provider/queries/Others.query';
import { useGetAllGlasswaresItemsQuery } from '../../provider/queries/Glasswares.query';
import { useGetAllBooksItemsQuery } from '../../provider/queries/Books.query';
import { useGetAllEquipmentsItemsQuery } from '../../provider/queries/Equipments.query';
import { useGetAllConsumablesItemsQuery } from '../../provider/queries/Consumables.query';
import { useEffect, useState } from 'react';
import { useGetAllProjectsQuery } from '../../provider/queries/Projects.query';
import { useGetAllGeneralsQuery } from '../../provider/queries/General.query';
import { useGetAllPracticalsQuery } from '../../provider/queries/Practical.query';
import { useGetAllOthersQuery } from '../../provider/queries/Other.query';


const itemClasses = ['Equipments', 'Consumables', 'Chemicals', 'Glasswares', 'Books', 'Others'];

const OrderModel = ({ visible, setVisible }) => {
    const [addOrder, { isLoading }] = useAddOrderMutation();
    const { data: vendors, isLoading: isVendorsLoading } = useGetAllVendorsQuery();
    const { data: projects } = useGetAllProjectsQuery();
    const { data: practicals } = useGetAllPracticalsQuery();
    const { data: other } = useGetAllOthersQuery();
    const { data: general } = useGetAllGeneralsQuery();

    // Fetch chemical items when required
    const [fetchChemicals, setFetchChemicals] = useState(false);
    const { data: chemicalData } = useGetAllChemicalsItemsQuery({}, { skip: !fetchChemicals });
    const chemicalItems = chemicalData?.items || [];

    // Fetch item data for all categories
    const { data: equipmentData } = useGetAllEquipmentsItemsQuery({});
    const { data: consumablesData } = useGetAllConsumablesItemsQuery({});
    const { data: booksData } = useGetAllBooksItemsQuery({});
    const { data: glasswareData, } = useGetAllGlasswaresItemsQuery({});
    const { data: othersData } = useGetAllOthersItemsQuery({});



    const getItemOptions = (selectedClass) => {
        switch (selectedClass) {
            case 'Chemicals':
                return chemicalItems.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item.item_code }));
            case 'Equipments':
                return equipmentData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item.item_code })) || [];
            case 'Consumables':
                return consumablesData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item.item_code })) || [];
            case 'Books':
                return booksData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item.item_code })) || [];
            case 'Glasswares':
                return glasswareData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item.item_code })) || [];
            case 'Others':
                return othersData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item.item_code })) || [];
            default:
                return [];
        }
    };

    // Validation Schema
    const validationSchema = yup.object({
        categoryType: yup.string().required("Category Type is required"),
        category: yup.string().required("Category is required"),
        vendor: yup.string().required("Vendor is required"),
        orderNumberKey: yup.string(),
        quotationRefNo: yup.string().required("Quotation Reference is required"),
        quotationDate: yup.date().required("Quotation Date is required"),
        items: yup.array().of(
            yup.object({
                entryNo: yup.number().required("Entry number is required"),
                description: yup.string().required("Item description is required"),
                class: yup.string().required("Item class is required"),
                item: yup.string().required("Item code is required"),
                make: yup.string().nullable(),
                quantity: yup.number().required("Quantity is required"),
                rate: yup.number().required("Rate is required"),
                discount: yup.number().min(0).default(0),
                taxGST: yup.number().min(0).default(0),
                cost: yup.number().required("Cost is required"),
            })
        ).min(1, "At least one item is required"),
        notes: yup.string().max(100, "Notes should be less than 100 characters"),
    });

    const initialValues = {
        categoryType: '',
        category: '',
        vendor: '',
        orderNumberKey:'',
        quotationRefNo: '',
        quotationDate: '',
        items: [{
            entryNo: '',
            description: '',
            class: '',
            item: '',
            make: '',
            quantity: '',
            rate: '',
            discount: 0,
            taxGST: 0,
            cost: ''
        }],
        notes: '',
    };
   const onSubmitHandler = async (values, { resetForm }) => {
    try {
        // Calculate item-wise cost using updated formula
        values.items = values.items.map(item => {
            const rate = Number(item.rate) || 0;
            const quantity = Number(item.quantity) || 0;
            const discount = Number(item.discount) || 0;
            const taxGST = Number(item.taxGST) || 0;

            let cost = rate * quantity;
            cost -= cost * (discount / 100); // Apply discount
            cost += cost * (taxGST / 100);   // Apply GST

            return {
                ...item,
                cost: cost.toFixed(2), // Save to 2 decimals
                discount,
                taxGST
            };
        });

        // Sum total cost
        const totalCost = values.items.reduce((sum, item) => sum + parseFloat(item.cost), 0);

        // Parse GST input
        const totalGST = Number(values.totalGST) || 0;

        // New formula: grandTotal = totalCost - totalGST
        const grandTotal = totalCost - totalGST;

        // Store values
        values.totalCost = totalCost.toFixed(2);
        values.totalGST = totalGST.toFixed(2);
        values.grandTotal = grandTotal.toFixed(2);

        // Submit
        const response = await addOrder(values);
        if (response.error) {
            toast.error(response.error.data.message || 'Failed to add order');
            return;
        }

        toast.success("Order Added Successfully");
        resetForm();
        setVisible(false);
    } catch (e) {
        toast.error(e.message || 'An error occurred');
    }
};


    return (
        <Dialog header="Add Order" visible={visible} className="w-full md:w-[98%] lg:w-[95%]" onHide={() => setVisible(false)}>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler} enableReinitialize>
                {({ handleSubmit, values, setFieldValue }) => {
                    useEffect(() => {
                        const hasChemicalClass = values.items.some(item => item.class === 'Chemicals');
                        setFetchChemicals(hasChemicalClass);
                    }, [values.items]);


                    useEffect(() => {
    const updatedItems = values.items.map((item) => {
        const rate = Number(item.rate) || 0;
        const quantity = Number(item.quantity) || 0;
        const discount = Number(item.discount) || 0;
        const taxGST = Number(item.taxGST) || 0;

        let cost = rate * quantity;
        cost -= cost * (discount / 100);
        cost += cost * (taxGST / 100);

        return {
            ...item,
            cost: cost.toFixed(2),
        };
    });
    setFieldValue('items', updatedItems);
}, [values.items, setFieldValue]);

                    return (
                        <form onSubmit={handleSubmit} className="w-full">
                            {/* Basic Order Info */}
                            {['orderNumberKey','quotationRefNo', 'quotationDate'].map((field, index) => (
                                <div className="mb-3" key={index}>
                                    <label htmlFor={field}>{field}</label>
                                    <Field name={field} type={field === 'quotationDate' ? 'date' : 'text'} className="w-full px-5 py-2 rounded-md border" />
                                    <ErrorMessage name={field} component="p" className="text-red-500 text-sm" />
                                </div>
                            ))}

                            {/* Category Type Selection */}
                            <div className="mb-3">
                                <label className="font-medium block mb-1">Category Type</label>
                                <div className="flex gap-4">
                                    {['General', 'Project', 'Practical', 'Other'].map(type => (
                                        <label key={type} className="flex items-center gap-2">
                                            <Field type="radio" name="categoryType" value={type} />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                                <ErrorMessage name="categoryType" component="p" className="text-red-500 text-sm" />
                            </div>

                            {/* Category Code Dropdown (based on categoryType) */}
                            <div className="mb-3">
                                <label>Select Category Code</label>
                                <Dropdown
                                    value={values.category}
                                    options={
                                        values.categoryType === 'General'
                                            ? general.generals?.map(c => ({ label: c.generalCode, value: c._id }))
                                            : values.categoryType === 'Project'
                                                ? projects?.projects?.map(p => ({ label: p.projectCode, value: p._id }))
                                                : values.categoryType === 'Practical'
                                                ? practicals?.practicals?.map(p => ({ label: p.practicalCode, value: p._id }))                                            
                                                    : values.categoryType === 'Other'
                                                        ? other.others?.map(o => ({ label: o.otherCode, value: o._id }))
                                                        : []
                                    }
                                    onChange={(e) => setFieldValue('category', e.value)}
                                    placeholder="Select Code"
                                    className="w-full"
                                    disabled={!values.categoryType}
                                />
                                <ErrorMessage name="category" component="p" className="text-red-500 text-sm" />
                            </div>


                            <div className="mb-3">
                                <label>Vendor</label>
                                <Dropdown
                                    value={values.vendor}
                                    options={vendors?.vendors?.map(vendor => ({ label: vendor.name, value: vendor._id })) || []}
                                    onChange={(e) => setFieldValue('vendor', e.value)}
                                    placeholder="Select Vendor"
                                    className="w-full"
                                    disabled={isVendorsLoading}
                                />
                                <ErrorMessage name="vendor" component="p" className="text-red-500 text-sm" />
                            </div>


                            {/* Items Section */}
                            <FieldArray name="items">
                                {({ push, remove }) => (
                                    <div>
                                        <h4 className="font-bold mb-2">Items</h4>
                                        <table className="w-full border-collapse border border-gray-300">
                                            <thead>
                                                <tr className="bg-gray-100 text-left">
                                                    {['Entry No', 'Description', 'Class', 'Item Code', 'Make', 'Qty', 'Rate', 'Discount', 'GST (%)', 'Cost', 'Actions'].map((header, idx) => (
                                                        <th key={idx} className="border px-3 py-2">{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {values.items.map((item, index) => (
                                                    <tr key={index}>
                                                        {/* Entry No */}
                                                        <td className="border px-2 py-1">
                                                            <Field
                                                                name={`items[${index}].entryNo`}
                                                                type="text"
                                                                placeholder="Entry No"
                                                                className="w-full p-1 border rounded"
                                                            />
                                                            <ErrorMessage name={`items[${index}].entryNo`} component="p" className="text-red-500 text-xs" />
                                                        </td>

                                                        {/* Description */}
                                                        <td className="border px-2 py-1">
                                                            <Field
                                                                name={`items[${index}].description`}
                                                                type="text"
                                                                placeholder="Description"
                                                                className="w-full p-1 border rounded"
                                                            />
                                                            <ErrorMessage name={`items[${index}].description`} component="p" className="text-red-500 text-xs" />
                                                        </td>

                                                        {/* Class Dropdown */}
                                                        <td className="border px-2 py-1">
                                                            <Dropdown
                                                                value={item.class}
                                                                options={itemClasses.map(itemClass => ({ label: itemClass, value: itemClass }))}
                                                                onChange={(e) => {
                                                                    setFieldValue(`items[${index}].class`, e.value);
                                                                    setFieldValue(`items[${index}].item`, ''); // Clear Item Code when class changes
                                                                }}
                                                                placeholder="Select Class"
                                                                className="w-full"
                                                            />
                                                            <ErrorMessage name={`items[${index}].class`} component="p" className="text-red-500 text-xs" />
                                                        </td>

                                                        {/* Item Code Dropdown (Conditional) */}
                                                        {/* Item Code Dropdown (Now Supports All Classes) */}
                                                        <td className="border px-2 py-1">
                                                            <Dropdown
                                                                value={item.item}
                                                                options={getItemOptions(item.class)}
                                                                onChange={(e) => setFieldValue(`items[${index}].item`, e.value)}
                                                                placeholder="Select Item Code"
                                                                className="w-full"
                                                                disabled={!item.class}
                                                            />
                                                            <ErrorMessage name={`items[${index}].item`} component="p" className="text-red-500 text-xs" />
                                                        </td>


                                                        {/* Make */}
                                                        <td className="border px-2 py-1">
                                                            <Field
                                                                name={`items[${index}].make`}
                                                                type="text"
                                                                placeholder="Make"
                                                                className="w-full p-1 border rounded"
                                                            />
                                                            <ErrorMessage name={`items[${index}].make`} component="p" className="text-red-500 text-xs" />
                                                        </td>

                                                        {/* Quantity */}
                                                        <td className="border px-2 py-1">
                                                            <Field
                                                                name={`items[${index}].quantity`}
                                                                type="number"
                                                                placeholder="Qty"
                                                                className="w-full p-1 border rounded"
                                                            />
                                                            <ErrorMessage name={`items[${index}].quantity`} component="p" className="text-red-500 text-xs" />
                                                        </td>

                                                        {/* Rate */}
                                                        <td className="border px-2 py-1">
                                                            <Field
                                                                name={`items[${index}].rate`}
                                                                type="number"
                                                                placeholder="Rate"
                                                                className="w-full p-1 border rounded"
                                                            />
                                                            <ErrorMessage name={`items[${index}].rate`} component="p" className="text-red-500 text-xs" />
                                                        </td>

                                                        {/* Discount */}
                                                      <td className="border px-2 py-1">
    <Field
        name={`items[${index}].discount`}
        type="number"
        placeholder="in (%)"
        className="w-full p-1 border rounded"
    />
    <ErrorMessage name={`items[${index}].discount`} component="p" className="text-red-500 text-xs" />
</td>



                                                        {/* Tax (GST %) */}
                                                     <td className="border px-2 py-1">
    <Field
        name={`items[${index}].taxGST`}
        type="number"
        placeholder="in (%)"
        className="w-full p-1 border rounded"
    />
    <ErrorMessage name={`items[${index}].taxGST`} component="p" className="text-red-500 text-xs" />
</td>


                                                        {/* Cost */}
                                                      <td className="border px-2 py-1">
    <Field
        name={`items[${index}].cost`}
        type="number"
        className="w-full p-1 border rounded bg-gray-100"
        readOnly
    />
    <ErrorMessage name={`items[${index}].cost`} component="p" className="text-red-500 text-xs" />
</td>


                                                        {/* Remove Button */}
                                                        <td className="border px-2 py-1 text-center">
                                                            <Button type="button" className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => remove(index)}>
                                                                Remove
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>


                                        {/* Add Item Button */}
                                        <Button
                                            type="button"
                                            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                                            onClick={() =>
                                                push({
                                                    entryNo: '',
                                                    description: '',
                                                    class: '',
                                                    item: '',
                                                    make: '',
                                                    quantity: '',
                                                    rate: '',
                                                    discount: 0,

                                                    taxGST: 0,
                                                    cost: ''
                                                })
                                            }
                                        >
                                            Add Item
                                        </Button>
                                    </div>
                                )}
                            </FieldArray>


                            <div className="mb-3">
                                <label>Total GST</label>
                                <Field
                                    name="totalGST"
                                    type="number"
                                    placeholder="Enter total GST"
                                    className="w-full px-5 py-2 rounded-md border"
                                    onChange={(e) => setFieldValue('totalGST', e.target.value)}
                                />
                                <ErrorMessage name="totalGST" component="p" className="text-red-500 text-sm" />
                            </div>


                            <div className="m-3">
                                <label>Notes</label>
                                <Field name="notes" as="textarea" className="w-full px-5 py-2 rounded-md border" />
                                <ErrorMessage name="notes" component="p" className="text-red-500 text-sm" />
                            </div>

                            <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                                {isLoading ? 'Adding...' : 'Add Order'}
                            </Button>
                        </form>
                    );
                }}
            </Formik>
        </Dialog>
    );
};

OrderModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};

export default OrderModel;
