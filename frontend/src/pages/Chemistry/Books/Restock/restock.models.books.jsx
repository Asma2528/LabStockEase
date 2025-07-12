import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Formik, ErrorMessage, Field } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import { useAddRestockItemMutation, useGetAllBooksItemsQuery } from '../../../../provider/queries/Books.query';  
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useGetAllInwardsQuery } from '../../../../provider/queries/Inwards.query'

const RestockModel = ({ visible, setVisible }) => {
    const [addRestockItem, { isLoading }] = useAddRestockItemMutation();
    const [bookOptions, setBookOptions] = useState([]);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

    const [inwardOptions, setInwardOptions] = useState([]);
    const [filteredInwards, setFilteredInwards] = useState([]);
    const [selectedInward, setSelectedInward] = useState(null);

    // Fetch all books initially
    const { data: booksData } = useGetAllBooksItemsQuery({ query: '' });
    const { data: inwardData } = useGetAllInwardsQuery(); 
    console.log(inwardData);
    // Update the bookOptions when data is available
    useEffect(() => {
      
        if (booksData?.items) { // Access the items array
            const options = booksData.items.map(book => ({
                value: book._id,
                label: `${book.item_code} - ${book.item_name}`,
            }));
            setBookOptions(options);
            setFilteredOptions(options); // Initialize filtered options with all options
        }
    }, [booksData]);

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
        book: yup.string().required("Book is required"),
        inward: yup.string().required("Inward entry is required"),
        quantity_purchased: yup.number().required("Quantity purchased is required").positive().integer(),
    });

    const initialValues = {
        book: selectedBook?.value || '', 
        inward: selectedInward?.value || '',
        quantity_purchased: '',
    };

    const onSubmitHandler = async (values, { resetForm }) => {
        try {
     
            const response = await addRestockItem({ 
                ...values, 
                book: selectedBook?.value,
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

    // Handle selection of a book
    const handleBookSelect = (selectedOption) => {
        setSelectedBook(selectedOption);
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
        const filtered = bookOptions.filter(option =>
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
                                onChange={handleBookSelect}
                                placeholder="Search by item code or name"
                                value={selectedBook} // Ensure Select dropdown value is in sync
                            />
                            <ErrorMessage name='book' component={'p'} className='text-red-500 text-sm' />
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
