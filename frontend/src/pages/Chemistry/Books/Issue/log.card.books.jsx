import PropTypes from "prop-types";
// import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { useState } from 'react';
// import { Button } from 'primereact/button';
import UpdateModel from './log.updatelog.books';

// const BooksLogCard = ({ data, onDelete }) => {
    const BooksLogCard = ({ data}) => {
console.log("BooksLogCard data:", data); // Log the data prop to check its structure
const [updateVisible, updateSetVisible] = useState(false); 

    // const handleUpdateClick = () => {
    //     updateSetVisible(true);
    // };

 const formatDate = (dateString) => {
    if (!dateString) return "Not Returned Yet"; // ✅ check for null/undefined

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "Invalid Date";
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};


    return (
        <>
            <tr className="bg-white border-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
            <td className="px-4 py-2 font-medium">
  {data.request || "Unknown Request"}
</td>

                {/* Check if the item exists, otherwise display "Unknown Item" */}
                <td className="px-4 py-2 font-medium">
                    {data.item?.item_code || "Unknown Item"} -  {data.item?.item_name || "Deleted Item"}
                </td>
                <td className="px-4 py-2">{data.issued_quantity}</td>
                <td className="px-4 py-2">{data.user_email}</td>
                <td className="px-4 py-2">
                    {formatDate(data.date_issued)}
                </td>
                <td className="px-4 py-2 font-medium">
                    {formatDate(data.date_return) ||  "Not Returned Yet"}
                </td>
                {/* <td className="px-4 py-2">
                    <div className="flex items-center"> */}
                        {/* <Button
                            onClick={handleUpdateClick}
                            title="Edit"
                            className="p-3 bg-lime-400 text-white rounded-sm mx-2"
                        >
                            <FaRegEdit className="text-xl" />
                        </Button> */}
                        {/* <Button 
                            onClick={onDelete} 
                            title="Delete" 
                            className="p-3 bg-red-500 text-white rounded-sm mx-2"
                        >
                            <FaRegTrashAlt className="text-xl" />
                        </Button> */}
                    {/* </div>
                </td> */}
            </tr>
            <UpdateModel 
                visible={updateVisible} 
                setVisible={updateSetVisible} 
                log={data}  // Pass the correct prop here
            />
        </>
    );
};

// Define PropTypes
BooksLogCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        item: PropTypes.shape({
            item_code: PropTypes.string,
            item_name: PropTypes.string,
        }),
        issued_quantity: PropTypes.number.isRequired,
        request: PropTypes.string.isRequired,
        date_issued: PropTypes.string.isRequired,
        date_return: PropTypes.string,
        user_email: PropTypes.string.isRequired,
    }).isRequired,
    // onDelete: PropTypes.func.isRequired
};

export default BooksLogCard;
