import { Dialog } from "primereact/dialog";
import { Formik, ErrorMessage, Field } from "formik";
import * as yup from "yup";
import { Button } from "primereact/button";
import { toast } from "sonner";
import PropTypes from "prop-types";
import { useReturnLogMutation } from "../../../../provider/queries/Glasswares.query";
import {useState} from 'react';

const ReturnModel = ({ visible, setVisible ,log}) => {
  const today = new Date();



  const [returnGlasswaresLog] = useReturnLogMutation(); 

  const [logRegistered, setLogRegistered] = useState(false);

  
  // Validation schema with additional fields for request type & code.
  const validationSchema = yup.object({
    returned_quantity: yup
      .number()
      .required("Returned quantity is required")
      .integer("Quantity must be an integer")
      .test(
        "is-less-than-current",
        "Returned quantity cannot be more than the issued quantity",
        function (value) {
          if (this.parent.issued_quantity == null) return false;
          return value <= this.parent.issued_quantity;
        }
      ),
      lost_or_damaged_quantity: yup
      .number()
      .integer("Quantity must be an integer")
      .test(
        "is-less-than-current",
        "Lost/ Damaged quantity cannot be more than the issued quantity",
        function (value) {
          if (this.parent.issued_quantity == null) return false;
          return value <= this.parent.issued_quantity;
        }
      ),
    date_returned: yup.date().required("Date returned is required"),
  });

  // Initial values: note that requestType and requestId come from our state
  const initialValues = {
    returned_quantity: log?.returned_quantity || 0,
    date_returned: log?.date_returned || today.toISOString().split("T")[0],
    lost_or_damaged_quantity: log?.lost_or_damaged_quantity || 0,
    issued_quantity: log.issued_quantity || 0, 
  };

 
  const onSubmitHandler = async (values) => {
    try {

        const formattedValues = {
            ...values,
        };

  console.log(log._id);
          const response = await returnGlasswaresLog({
            logId: log._id.trim(),  // Ensure this is correct
            logData: formattedValues,  // This should contain the formatted values
        });


        if (response.error) {
            toast.error(response.error.data.message || 'Return failed');
            return;
        }

        toast.success('Log returned successfully');
        setLogRegistered(true);
        setVisible(false);

    } catch (error) {
        toast.error('An unexpected error occurred');
    }
};
 
  return (
    <Dialog
      header="Return Quantity"
      position="top"
      visible={visible}
      className="w-full md:w-[70%] lg:w-1/2"
      onHide={() => setVisible(false)}
      draggable={false}
    >
      <Formik
        onSubmit={onSubmitHandler}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="w-full">
             

            {/*returned_quantity */}
            <div className="mb-3">
              <label htmlFor="returned_quantity">
              Returned Quantity <span className="text-red-500 text-sm">*</span>
              </label>
              <Field
                name="returned_quantity"
                id="returned_quantity"
                type="number"
                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              />
              <ErrorMessage name="returned_quantity" component="p" className="text-red-500 text-sm" />
            </div>

            <div className="mb-3">
              <label htmlFor="lost_or_damaged_quantity">
             Lost/ Damaged Quantity 
              </label>
              <Field
                name="lost_or_damaged_quantity"
                id="lost_or_damaged_quantity"
                type="number"
                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              />
              <ErrorMessage name="lost_or_damaged_quantity" component="p" className="text-red-500 text-sm" />
            </div>

            {/* Date Issued */}
            <div className="mb-3">
              <label htmlFor="date_returned">
                Date Returned <span className="text-red-500 text-sm">*</span>
              </label>
              <Field
                name="date_returned"
                id="date_returned"
                type="date"
                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              />
              <ErrorMessage name="date_returned" component="p" className="text-red-500 text-sm" />
            </div>

         


            <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={logRegistered} 
                                className="px-4 rounded-md py-2 bg-blue-900 text-white inline-flex items-center gap-x-2">
                               Return Log
                            </Button>
                        </div>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

// PropTypes validation
ReturnModel.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    log: PropTypes.shape({
        _id: PropTypes.string.isRequired,
                issued_quantity: PropTypes.number,
                returned_quantity: PropTypes.number,
                lost_or_damaged_quantity: PropTypes.number,
                 date_returned: PropTypes.string,
    }).isRequired,
};
export default ReturnModel;
