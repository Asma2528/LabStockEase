import { Dialog } from 'primereact/dialog';
import { Formik, Field, ErrorMessage, FieldArray } from 'formik';
import * as yup from 'yup';
import { Button } from 'primereact/button';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useCreateNewIndentMutation } from '../../provider/queries/New.Indent.query';
import { Dropdown } from 'primereact/dropdown';
import { useGetAllProjectsQuery } from '../../provider/queries/Projects.query';
import { useGetAllGeneralsQuery } from '../../provider/queries/General.query';
import { useGetAllPracticalsQuery } from '../../provider/queries/Practical.query';
import { useGetAllOthersQuery } from '../../provider/queries/Other.query';import { useGetAllChemicalsItemsQuery } from '../../provider/queries/Chemicals.query';


const Modal = ({ visible, setVisible }) => {
  const [createNewIndent, { isLoading }] = useCreateNewIndentMutation();
   const { data: projects } = useGetAllProjectsQuery();
     const { data: practicals } = useGetAllPracticalsQuery();
     const { data: other } = useGetAllOthersQuery();
     const { data: general } = useGetAllGeneralsQuery();
  
  // Validation Schema for Requisition
  const validationSchema = yup.object({
        categoryType: yup.string().required("Category Type is required"),
        category: yup.string().required("Category is required"),
    date_of_requirement: yup.date().required("Date of requirement is required"),
    items: yup.array().of(
      yup.object({
        class: yup.string().required("Class is required"),
        item: yup.string().required("Item is required"),
        unit_of_measure: yup.string().required("Unit of Measure is required"),
        quantity_required: yup
          .number()
          .required("Quantity is required")
          .positive("Quantity must be a positive number")
          .integer("Quantity must be an integer"),
        description: yup.string(),
        technical_details: yup.string(),

      })
    ).required("At least one item is required"),
  });

  const initialValues = {
       categoryType: '',
        category: '',
    date_of_requirement: '',
    items: [
      {
        class: '',
        item: '',
        unit_of_measure: '',
        quantity_required: '',
        description: '',
        technical_details: '',
        current_quantity: 0, 
      },
    ],
  };

  const onSubmitHandler = async (values, { resetForm }) => {
    try {
      const currentUser = { _id: 'currentUserId' }; // Replace with actual current user ID or context value

      // Prepare requisition data
      const newIndentData = {
 categoryType: values.categoryType,
        category: values.category,        date_of_requirement: values.date_of_requirement,
        items: values.items.map((item) => ({
          ...item,
        })),
        requested_by: currentUser._id,
        approved_by: null,
        issued_by: null,
        approved_at: null,
        issued_at: null,
        status: 'Pending',
        remark: '', // Optional remarks
      };

      const response = await createNewIndent(newIndentData);

      if (response.error) {
        toast.error(response.error.data.message || 'Failed to create new indent');
        return;
      }

      toast.success("New Indent Created Successfully");
      resetForm();
      setVisible(false);
    } catch (e) {
      toast.error(e.message || 'An error occurred');
    }
  };




  return (
    <Dialog
      header="Create New Indent"
      visible={visible}
      onHide={() => setVisible(false)}
      className="w-full md:w-[98%] "
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmitHandler}
      >
        {({ handleSubmit, values, setFieldValue }) => {


          return (
            <form onSubmit={handleSubmit} className="w-full">
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

              {/* Date of Requirement Field */}
              <div className="mb-4">
                <label htmlFor="date_of_requirement" className="font-medium">
                  Date of Requirement <span className="text-red-500">*</span>
                </label>
                <Field
                  name="date_of_requirement"
                  type="date"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage name="date_of_requirement" component="p" className="text-red-500 text-sm mt-1" />
              </div>

              <div className="overflow-x-auto bg-white rounded-lg shadow-md">
  <table className="min-w-full table-auto">
    <thead>
      <tr className="px-4 py-2 bg-gray-100 text-left text-sm font-semibold text-gray-700">
        <th className="px-4 py-2 border-b">Class</th>
        <th className="px-4 py-2 border-b">Item</th>
        <th className="px-4 py-2 border-b">Unit of Measure</th>
        <th className="px-4 py-2 border-b">Quantity Required</th>
        <th className="px-4 py-2 border-b">Description</th>
        <th className="px-4 py-2 border-b">Technical Details</th>
        <th className="px-4 py-2 border-b">Actions</th>
      </tr>
    </thead>
    <tbody>
      <FieldArray name="items">
        {({ push, remove }) => (
          <>
            {values.items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">
                  <Field as="select" name={`items[${index}].class`} className="w-full p-2 border rounded">
                    <option value="">Select Class</option>
                    <option value="Capital">Capital</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Chemical">Chemical</option>
                    <option value="Glassware">Glassware</option>
                    <option value="Books">Books</option>
                    <option value="Others">Others</option>
                  </Field>
                  <ErrorMessage name={`items[${index}].class`} component="p" className="text-red-500 text-sm mt-1" />
                </td>

                <td className="px-4 py-2 border-b">
                  <Field
                    name={`items[${index}].item`}
                    type="text"
                    placeholder="Enter Item Name"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name={`items[${index}].item`} component="p" className="text-red-500 text-sm mt-1" />
                </td>

                <td className="px-4 py-2 border-b">
                  <Field as="select" name={`items[${index}].unit_of_measure`} className="w-full p-2 border rounded">
                    <option value="">Select Unit</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="l">Liter (l)</option>
                    <option value="g">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="m^3">Cubic Meter (m³)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="sets">Sets</option>
                    <option value="boxes">Boxes</option>
                    <option value="packs">Packs</option>
                    <option value="meters">Meters (m)</option>
                  </Field>
                  <ErrorMessage name={`items[${index}].unit_of_measure`} component="p" className="text-red-500 text-sm mt-1" />
                </td>

                <td className="px-4 py-2 border-b">
                  <Field
                    name={`items[${index}].quantity_required`}
                    type="number"
                    placeholder="Enter Quantity"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name={`items[${index}].quantity_required`} component="p" className="text-red-500 text-sm mt-1" />
                </td>

                <td className="px-4 py-2 border-b">
                  <Field
                    as="textarea"
                    name={`items[${index}].description`}
                    placeholder="Enter Description"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name={`items[${index}].description`} component="p" className="text-red-500 text-sm mt-1" />
                </td>

<td>
                <Field
                    as="textarea"
                    name={`items[${index}].technical_details`}
                    placeholder="Enter Technical Details"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage name={`items[${index}].technical_details`} component="p" className="text-red-500 text-sm mt-1" />
                </td>


                <td className="px-4 py-2 border-b text-center">
                  <Button type="button" className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="6">
                <Button
                  type="button"
                  onClick={() => push({
                    class: '',
                    item: '',
                    unit_of_measure: '',
                    quantity_required: '',
                    description: '',
                    technical_details: '',
                  })}
                  className="m-4 bg-green-600 text-white px-6 py-2 rounded"
                >
                  Add Item
                </Button>
              </td>
            </tr>
          </>
        )}
      </FieldArray>
    </tbody>
  </table>
</div>

              <Button
                type="submit"
                className="w-full bg-blue-900 text-white py-3 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create New Indent'}
              </Button>
            </form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

Modal.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
};

export default Modal;
