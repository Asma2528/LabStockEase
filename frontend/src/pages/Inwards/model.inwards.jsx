import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import {useAddInwardMutation} from '../../provider/queries/Inwards.query';
import { useGetAllVendorsQuery } from '../../provider/queries/Vendors.query';
import { useGetAllInvoicesQuery } from '../../provider/queries/Invoice.query';
import { useGetAllChemicalsItemsQuery } from '../../provider/queries/Chemicals.query';
import { useGetAllOthersItemsQuery } from '../../provider/queries/Others.query';
import { useGetAllGlasswaresItemsQuery } from '../../provider/queries/Glasswares.query';
import { useGetAllBooksItemsQuery } from '../../provider/queries/Books.query';
import { useGetAllEquipmentsItemsQuery } from '../../provider/queries/Equipments.query';
import { useGetAllConsumablesItemsQuery } from '../../provider/queries/Consumables.query';
import { Dropdown } from 'primereact/dropdown';
// import { useState,useEffect } from 'react';

const itemClasses = ['Equipments', 'Consumables', 'Chemicals', 'Glasswares', 'Books', 'Others'];

const InwardModel = ({ visible, setVisible }) => {
    const [addInward, { isLoading }] = useAddInwardMutation();
    const { data: vendors, isLoading: isVendorsLoading } = useGetAllVendorsQuery();
    const { data: invoices, isLoading: isInvoicesLoading } = useGetAllInvoicesQuery();
    
    // Fetch chemical items when required
    // const [fetchChemicals, setFetchChemicals] = useState(false);
    
    // Fetch item data for all categories
    const { data: equipmentData } = useGetAllEquipmentsItemsQuery({});
    const { data: consumablesData } = useGetAllConsumablesItemsQuery({});
    const { data: chemicalsData, } = useGetAllChemicalsItemsQuery({});
    const { data: booksData } = useGetAllBooksItemsQuery({});
    const { data: glasswareData, } = useGetAllGlasswaresItemsQuery({});
    const { data: othersData } = useGetAllOthersItemsQuery({});
    
    
    
    
    const getItemOptions = (selectedClass) => {
        switch (selectedClass) {
            case 'Chemicals':
                return chemicalsData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item._id })) || [];
            case 'Equipments':
                return equipmentData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item._id })) || [];
            case 'Consumables':
                return consumablesData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item._id })) || [];
            case 'Books':
                return booksData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item._id })) || [];
            case 'Glasswares':
                return glasswareData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item._id })) || [];
            case 'Others':
                return othersData?.items?.map(item => ({ label: `${item.item_code} - ${item.item_name}`, value: item._id })) || [];
            default:
                return [];
        }
    };
    

    // Validation Schema
    const validationSchema = yup.object({
        class: yup.string().required("Item class is required"),
        item: yup.string().required('Item Code is required'),
        description: yup.string().required('Description is required'),
        grade: yup.string().required('Grade is required'),
        unit: yup.string().required('Unit is required'),
        thClass: yup.string().required('TH Class is required'),
        casNo: yup.string(),
        quantity: yup.number().typeError('Quantity must be a number').required('Quantity is required'),
        vendor: yup.string().required('Vendor is required'),
        invoice: yup.string().required('Invoice is required'),
    });

    const initialValues = {
        class: '',
        item: '',
        description: '',
        grade: '',
        unit: '',
        thClass: '',
        casNo: '',
        quantity: '',
        vendor: '',
        invoice: '',
    };

    const onSubmitHandler = async (values, { resetForm }) => {
        try {
        
            
            const response = await addInward(values);
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to add inward');
                return;
            }
            toast.success("Inward Added Successfully");
            resetForm();
            setVisible(false);
        } catch (e) {
            toast.error(e.message || 'An error occurred');
        }
    };

    return (
        <Dialog header="Add Inward" visible={visible} className="w-full md:w-[50%]" onHide={() => setVisible(false)}>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmitHandler} enableReinitialize>
            {({ handleSubmit, values, setFieldValue }) => {
                    // useEffect(() => {
                    //     const hasChemicalClass = values.class === 'Chemical';
                    //     setFetchChemicals(hasChemicalClass);
                    // }, [values.class]);
                    
                    return (
                    <form onSubmit={handleSubmit} className="w-full">
                       <div className="mb-3">
                <label>Class</label>
                <Dropdown
                    value={values.class}
                    options={itemClasses.map(cls => ({ label: cls, value: cls }))}
                    onChange={(e) => setFieldValue('class', e.value)}
                    placeholder="Select Class"
                    className="w-full"
                />
                <ErrorMessage name="class" component="p" className="text-red-500 text-sm" />
            </div>

            <div className="mb-3">
                <label>Item</label>
                <Dropdown
                    value={values.item}
                    options={getItemOptions(values.class)}
                    onChange={(e) => setFieldValue('item', e.value)}
                    placeholder="Select Item"
                    className="w-full"
                   
                />
                <ErrorMessage name="item" component="p" className="text-red-500 text-sm" />
            </div>
                        
                        <div className="mb-3">
                            <label>Description</label>
                            <Field as="textarea" name="description" className="w-full p-2 border rounded" placeholder="Enter Description" />
                            <ErrorMessage name="description" component="p" className="text-red-500 text-sm" />
                        </div>
                        
                        <div className="mb-3">
                            <label>Grade</label>
                            <Dropdown name="grade" value={values.grade} options={["AR", "LR", "GR", "COM", "HPLC"].map(grade => ({ label: grade, value: grade }))} onChange={(e) => setFieldValue('grade', e.value)} placeholder="Select Grade" className="w-full" />
                            <ErrorMessage name="grade" component="p" className="text-red-500 text-sm" />
                        </div>

                        <div className="mb-3">
                            <label>Unit</label>
                            <Dropdown name="unit" value={values.unit} options={["Nos", "ml", "L", "kg", "g", "Box"].map(unit => ({ label: unit, value: unit }))} onChange={(e) => setFieldValue('unit', e.value)} placeholder="Select Unit" className="w-full" />
                            <ErrorMessage name="unit" component="p" className="text-red-500 text-sm" />
                        </div>
                        
                        <div className="mb-3">
                            <label>TH Class</label>
                            <Dropdown name="thClass" value={values.thClass} options={[  "E - Explosive",
                    "O - Oxidizing",
                    "F - Flammable",
                    "F+ - Extremely Flammable",
                    "T - Toxic",
                    "T+ - Very Toxic",
                    "Xn - Harmful",
                    "Xi - Irritant",
                    "C - Carcinogen",
                    "Ter - Teratogen",
                    "Mut - Mutagen"].map(cls => ({ label: cls, value: cls }))} onChange={(e) => setFieldValue('thClass', e.value)} placeholder="Select TH Class" className="w-full" />
                            <ErrorMessage name="thClass" component="p" className="text-red-500 text-sm" />
                        </div>

                        <div className="mb-3">
                            <label>CAS No</label>
                            <Field name="casNo" type="text" className="w-full p-2 border rounded" placeholder="Enter CAS No" />
                            <ErrorMessage name="casNo" component="p" className="text-red-500 text-sm" />
                        </div>

                        <div className="mb-3">
                            <label>Quantity</label>
                            <Field name="quantity" type="number" className="w-full p-2 border rounded" placeholder="Enter Quantity" />
                            <ErrorMessage name="quantity" component="p" className="text-red-500 text-sm" />
                        </div>

                        <div className="mb-3">
                            <label>Vendor</label>
                            <Dropdown
                                value={values.vendor}
                                options={vendors?.vendors?.map(vendor => ({ label: `${vendor.code} : ${vendor.name}`, value: vendor._id })) || []}
                                onChange={(e) => setFieldValue('vendor', e.value)}
                                placeholder="Select Vendor"
                                className="w-full"
                                disabled={isVendorsLoading}
                            />
                            <ErrorMessage name="vendor" component="p" className="text-red-500 text-sm" />
                        </div>

                        <div className="mb-3">
                            <label>Invoice</label>
                            <Dropdown
                                value={values.invoice}
                                options={invoices?.invoices?.map(invoice => ({ label: `${invoice.billNo} `, value: invoice._id })) || []}
                                onChange={(e) => setFieldValue('invoice', e.value)}
                                placeholder="Select Invoice"
                                className="w-full"
                                disabled={isInvoicesLoading}
                            />
                            <ErrorMessage name="vendor" component="p" className="text-red-500 text-sm" />
                        </div>

                        <Button type="submit" className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Inward'}
                        </Button>
                    </form>
                );
            }}
            </Formik>
        </Dialog>
    );
};

InwardModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};

export default InwardModel;
