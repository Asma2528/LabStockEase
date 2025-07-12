import PropTypes from "prop-types";

const ChemicalsLogCard = ({ data }) => {
 

    const formatDate = (dateString) => {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            console.error("Invalid date:", dateString); // Log if date parsing fails
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
                    {data.item?.item_code || "Unknown Item"} -
                    {data.item?.item_name || "Deleted Item"}
                </td>
                <td className="px-4 py-2">{data.issued_quantity}</td>
                <td className="px-4 py-2">
                    {formatDate(data.date_issued)}
                </td>
                <td className="px-4 py-2">{data.user_email}</td>
               
            </tr>
         
        </>
    );
};

// Define PropTypes
ChemicalsLogCard.propTypes = {
    data: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        item: PropTypes.shape({
            item_code: PropTypes.string,
            item_name: PropTypes.string,
        }),
        issued_quantity: PropTypes.number.isRequired,
        request: PropTypes.string.isRequired,
        date_issued: PropTypes.string.isRequired,
        user_email: PropTypes.string.isRequired,
    }).isRequired,
};

export default ChemicalsLogCard;
