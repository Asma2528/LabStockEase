import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Button } from 'primereact/button';
import ViewItem from './display.new.indent';
import UpdateModel from './update.new.indent';

const NewIndentCard = ({ data ,onDelete}) => {
  const [visible, setVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);


  if (!data) return null; // Ensure data exists

  const formattedDate = data.date_of_requirement
    ? new Date(data.date_of_requirement).toLocaleDateString()
    : "N/A";

 

  return (
    <>
      <tr className="bg-white border-b hover:bg-gray-50 text-gray-900 whitespace-nowrap">
      <td className="px-4 py-2">{data.newindent_code || "N/A"}</td>
        <td className="px-4 py-2 font-medium">{data.categoryType|| "N/A"}</td>
               <td className="px-4 py-2 font-medium">{data.categoryCode|| "N/A"}</td>
        <td className="px-4 py-2">{formattedDate}</td>
        <td className="px-4 py-2">{data.requested_by?.name || "N/A"}</td>
        <td className="px-4 py-2">{data.status || "N/A"}</td>
        <td className="px-4 py-2 flex space-x-2">
          <Button onClick={() => setVisible(true)} title="View" className="p-3 bg-indigo-500 text-white rounded-sm mx-2">
            <LuView />
          </Button>
          <Button onClick={() => setUpdateVisible(true)} title="Edit"  className="p-3 bg-lime-400 text-white rounded-sm mx-2">
            <FaRegEdit />
          </Button>
          <Button onClick={onDelete} title="Delete" className="p-3 bg-red-500 text-white rounded-sm mx-2">
            <FaRegTrashAlt />
          </Button>
        </td>
        
      </tr>

      {/* Modals */}
      <ViewItem visible={visible} setVisible={setVisible} newIndent={data} />
      <UpdateModel visible={updateVisible} setVisible={setUpdateVisible} newIndent={data} />
    </>
  );
};


NewIndentCard.propTypes = {
  data: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    newindent_code: PropTypes.string.isRequired,
        categoryType: PropTypes.string.isRequired,
        categoryCode: PropTypes.string.isRequired,
    
   
    date_of_requirement: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    requested_by: PropTypes.shape({
      name: PropTypes.string,
    }),
    approved_by: PropTypes.shape({
      name: PropTypes.string,
    }),
    ordered_by: PropTypes.shape({
      name: PropTypes.string,
    }),
    approved_at: PropTypes.string,
    ordered_at: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default NewIndentCard;
