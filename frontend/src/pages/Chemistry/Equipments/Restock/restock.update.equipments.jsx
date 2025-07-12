import PropTypes from 'prop-types';
import * as yup from 'yup';
import { ErrorMessage, Field, Formik } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import { useUpdateRestockItemMutation } from '../../../../provider/queries/Equipments.query';
import { useGetAllInwardsQuery } from '../../../../provider/queries/Inwards.query'
import Select from 'react-select';
import { useState,useEffect } from 'react';

const UpdateRestockModel = ({ visible, setVisible, item }) => {
    const [selectedInward, setSelectedInward] = useState();
    const validationSchema = yup.object({
                inward: yup.string().required("Inward entry is required"),
        
        quantity_purchased: yup.number().required("Quantity purchased is required").positive().integer(),
        expiration_date: yup.date().nullable(),
        location: yup.string(),
        maintenance_date: yup.date().nullable(),
        maintenance_details: yup.string(),
        inward_code: yup.string().nullable(),
    });

    const initialValues = {
        inward: selectedInward ? selectedInward.value : item?.inward?.inward_code || '',
        quantity_purchased: item?.quantity_purchased || 0,
    expiration_date: item?.expiration_date ? new Date(item.expiration_date).toISOString().slice(0, 10) : '',
        location: item?.location || '',
        maintenance_date: item?.maintenance_date ? new Date(item.maintenance_date).toISOString().slice(0, 10) : '',
        maintenance_details: item?.maintenance_details || '',

    };

    const [updateRestockItem, updateRestockResponse] = useUpdateRestockItemMutation();

    
        const [inwardOptions, setInwardOptions] = useState([]);
        const [filteredInwards, setFilteredInwards] = useState([]);
    
        const { data: inwardData } = useGetAllInwardsQuery(); 

        useEffect(() => {
            if (inwardData?.inwards) {
                const options = inwardData.inwards.map(inward => ({
                    value: inward._id,
                    label: inward.inward_code,
                }));
                setInwardOptions(options);
                setFilteredInwards(options);
        
                // Set the existing inward value (if editing)
                if (item?.inward) {
                    const existingInward = options.find(opt => opt.value === item.inward);
                    setSelectedInward(existingInward || null);
                }
            }
        }, [inwardData, item]);  // Depend on 'item' to update when modal opens
        

            const handleInwardSelect = (selectedOption) => {
                setSelectedInward(selectedOption);
            };
        
            const handleSearchInputChangeInward = (inputValue) => {
                const filtered = inwardOptions.filter(option =>
                    option.label.toLowerCase().includes(inputValue.toLowerCase())
                );
                setFilteredInwards(filtered);
            };

    const onSubmitHandler = async (values) => {

        try {
            const response = await updateRestockItem({
                data: values,
                id: item._id,
            });

            if (response.error) {
                toast.error(response.error.data.message || 'Update failed');
                return;
            }

            toast.success('Restock item updated successfully');
            setVisible(false);
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <Dialog header="Update Restock Item" draggable={false} visible={visible} className='w-[90%] mx-auto lg:mx-0 lg:w-1/2' onHide={() => setVisible(false)}>
            <Formik onSubmit={onSubmitHandler} initialValues={initialValues} validationSchema={validationSchema}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="w-full">
                        
                        <div className="mb-3">
                            <label htmlFor="inward">Search by Inward Code</label>
                            <Select
    options={filteredInwards}  // ✅ Correct state for inward dropdown
    onInputChange={handleSearchInputChangeInward}
    onChange={handleInwardSelect}
    placeholder="Search by inward"
    value={selectedInward} 
/>

                            <ErrorMessage name='inward' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        {/* Quantity Purchased */}
                        <div className="mb-3">
                            <label htmlFor="quantity_purchased">Quantity Purchased <span className="text-red-500 text-sm">*</span></label>
                            <Field name="quantity_purchased" id="quantity_purchased" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Quantity Purchased" />
                            <ErrorMessage name='quantity_purchased' component={'p'} className='text-red-500 text-sm' />
                        </div>

                 
                      

                        <div className="mb-3">
                            <label htmlFor="expiration_date">Expiration Date</label>
                            <Field name="expiration_date" id="expiration_date" type="date" className="w-full px-5 py-2 rounded-md outline-none border-1 border" />
                            <ErrorMessage name='expiration_date' component={'p'} className='text-red-500 text-sm' />
                        </div>

                     

                        <div className="mb-3">
                            <label htmlFor="location">Location</label>
                            <Field name="location" id="location" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Location" />
                            <ErrorMessage name='location' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="maintenance_date">Maintenance Date </label>
                            <Field name="maintenance_date" id="maintenance_date" type="date" className="w-full px-5 py-2 rounded-md outline-none border-1 border" />
                            <ErrorMessage name='maintenance_date' component={'p'} className='text-red-500 text-sm' />
                        </div>

                     

                        <div className="mb-3">
                            <label htmlFor="maintenance_details">Maintenance Details</label>
                            <Field name="maintenance_details" id="maintenance_details" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Maintenance Details" />
                            <ErrorMessage name='maintenance_details' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" loading={updateRestockResponse.isLoading} className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2">
                                Update Restock Item
                            </Button>
                        </div>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

// PropTypes validation
UpdateRestockModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    item: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        inward:PropTypes.string,
        quantity_purchased: PropTypes.number,
        purchase_date: PropTypes.string,
        expiration_date: PropTypes.string,
        maintenance_date: PropTypes.string,
        maintenance_details: PropTypes.string,
     
        location: PropTypes.string,
    }).isRequired,
};

export default UpdateRestockModel;
