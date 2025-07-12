import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Formik, ErrorMessage, Field } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import { useAddRestockItemMutation, useGetAllConsumablesItemsQuery } from '../../../../provider/queries/Consumables.query';  
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useGetAllInwardsQuery } from '../../../../provider/queries/Inwards.query'

const RestockModel = ({ visible, setVisible }) => {
    const [addRestockItem, { isLoading }] = useAddRestockItemMutation();
    const [consumableOptions, setConsumableOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [selectedConsumable, setSelectedConsumable] = useState(null);

    const [inwardOptions, setInwardOptions] = useState([]);
    const [filteredInwards, setFilteredInwards] = useState([]);
    const [selectedInward, setSelectedInward] = useState(null);

    // Fetch all consumables initially
    const { data: consumablesData } = useGetAllConsumablesItemsQuery({ query: '' });
    const { data: inwardData } = useGetAllInwardsQuery(); 
    console.log(inwardData);
    // Update the consumableOptions when data is available
    useEffect(() => {
      
        if (consumablesData?.items) { // Access the items array
            const options = consumablesData.items.map(consumable => ({
                value: consumable._id,
                label: `${consumable.item_code} - ${consumable.item_name}`,
            }));
            setConsumableOptions(options);
            setFilteredOptions(options); // Initialize filtered options with all options
        }
    }, [consumablesData]);

    useEffect(() => {
        if (inwardData?.inwards) {  // ✅ Adjusted to match actual API response
            const options = inwardData.inwards.map(inward => ({
                value: inward._id,
                label: inward.inward_code , // Handle cases where inward_code is missing
            }));
            setInwardOptions(options);
            setFilteredInwards(options);
        }
    }, [inwardData]);
    

    // Validation schema for form inputs
    const validationSchema = yup.object({
        consumable: yup.string().required("Consumable is required"),
        inward: yup.string().required("Inward entry is required"),
        quantity_purchased: yup.number().required("Quantity purchased is required").positive().integer(),
        expiration_date: yup.date().required("Expiration date is required"),
        location: yup.string(),
    });

    const initialValues = {
        consumable: selectedConsumable?.value || '', 
        inward: selectedInward?.value || '',
        quantity_purchased: '',
        expiration_date: '',
        location: '',
    };

    const onSubmitHandler = async (values, { resetForm }) => {
        try {
     
            const response = await addRestockItem({ 
                ...values, 
                consumable: selectedConsumable?.value,
            });
            if (response.error) {
                toast.error(response.error.data.message || 'Failed to add restock item');
                return;
            }
            toast.success("Restock Item Added Successfully");
            resetForm();
            setVisible(false);
        } catch (e) {
            toast.error(e.message || 'An error occurred');
        }
    };

    // Handle selection of a consumable
    const handleConsumableSelect = (selectedOption) => {
        setSelectedConsumable(selectedOption);
    };

    const handleInwardSelect = (selectedOption) => {
        setSelectedInward(selectedOption);
    };

    const handleSearchInputChangeInward = (inputValue) => {
        const filtered = inwardOptions.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredInwards(filtered);
    };

    // Handle search term filtering
    const handleSearchInputChange = (inputValue) => {
        const filtered = consumableOptions.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredOptions(filtered);
    };

    return (
        <Dialog header="Add Restock Item" position='top' visible={visible} className="w-full md:w-[70%] lg:w-1/2" onHide={() => setVisible(false)} draggable={false}>
            <Formik
                onSubmit={onSubmitHandler}
                initialValues={initialValues}
                validationSchema={validationSchema}
                enableReinitialize={true} // Allow form to reset when values change
            >
                {({ handleSubmit  }) => (
                    <form onSubmit={handleSubmit} className="w-full">
                        {/* Item Code / Name Dropdown */}
                        <div className="mb-3">
                            <label htmlFor="item_code">Search by Item Code / Name</label>
                            <Select
                                options={filteredOptions}
                                onInputChange={handleSearchInputChange}
                                onChange={handleConsumableSelect}
                                placeholder="Search by item code or name"
                                value={selectedConsumable} // Ensure Select dropdown value is in sync
                            />
                            <ErrorMessage name='consumable' component={'p'} className='text-red-500 text-sm' />
                        </div>

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

                      

                        {/* Expiration Date */}
                        <div className="mb-3">
                            <label htmlFor="expiration_date">Expiration Date <span className="text-red-500 text-sm">*</span></label>
                            <Field 
                                name="expiration_date" 
                                id="expiration_date" 
                                type="date" 
                                className="w-full px-5 py-2 rounded-md outline-none border-1 border" 
                            />
                            <ErrorMessage name='expiration_date' component={'p'} className='text-red-500 text-sm' />
                        </div>

                      
                        <div className="mb-3">
                            <label htmlFor="location">Location</label>
                            <Field name="location" id="location" type="text" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Location" />
                            <ErrorMessage name='location' component={'p'} className='text-red-500 text-sm' />
                        </div>

                      

                        <Button type="submit" className='w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center' disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Restock Item'}
                        </Button>
                    </form>
                )}
            </Formik>
        </Dialog>
    );
};

// PropTypes validation
RestockModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
};

export default RestockModel;
