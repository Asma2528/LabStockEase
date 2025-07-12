import PropTypes from 'prop-types';
import * as yup from 'yup';
import { ErrorMessage, Field, Formik } from 'formik';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import { useUpdateRestockItemMutation } from '../../../../provider/queries/Books.query';
import { useGetAllInwardsQuery } from '../../../../provider/queries/Inwards.query'
import Select from 'react-select';
import { useState,useEffect } from 'react';

const UpdateRestockModel = ({ visible, setVisible, item }) => {
    const [selectedInward, setSelectedInward] = useState();
    const validationSchema = yup.object({
                inward: yup.string().required("Inward entry is required"),
        quantity_purchased: yup.number().required("Quantity purchased is required").positive().integer(),
        inward_code: yup.string().nullable(),
    });

    const initialValues = {
        inward: selectedInward ? selectedInward.value : item?.inward?.inward_code || '',
        quantity_purchased: item?.quantity_purchased || 0,
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
    value={selectedInward}  // Should store the selected inward object (not just the code)
    getOptionLabel={(option) => option.label}  // Ensure it's showing the inward_code in the dropdown
    getOptionValue={(option) => option.value}  // Ensure the value is inward_code
/>

                            <ErrorMessage name='inward' component={'p'} className='text-red-500 text-sm' />
                        </div>

                        {/* Quantity Purchased */}
                        <div className="mb-3">
                            <label htmlFor="quantity_purchased">Quantity Purchased <span className="text-red-500 text-sm">*</span></label>
                            <Field name="quantity_purchased" id="quantity_purchased" type="number" className="w-full px-5 py-2 rounded-md outline-none border-1 border" placeholder="Enter Quantity Purchased" />
                            <ErrorMessage name='quantity_purchased' component={'p'} className='text-red-500 text-sm' />
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
           inward: PropTypes.shape({
                   inward_code: PropTypes.string,
               }),
        quantity_purchased: PropTypes.number,
   
    }).isRequired,
};

export default UpdateRestockModel;
