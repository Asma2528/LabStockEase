import { Dialog } from "primereact/dialog";
import { Formik, ErrorMessage, Field } from "formik";
import * as yup from "yup";
import { Button } from "primereact/button";
import { toast } from "sonner";
import PropTypes from "prop-types";
import { useLogIssuedQuantityMutation, useGetAllOthersItemsQuery } from "../../../../provider/queries/Others.query";
import { useGetApprovedRequisitionsQuery} from "../../../../provider/queries/Requisition.query";
import { useGetApprovedOrderRequestsQuery } from "../../../../provider/queries/Order.Request.query";
import { useGetApprovedRequestsQuery } from "../../../../provider/queries/New.Indent.query";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const Model = ({ visible, setVisible }) => {
  const { data: othersData, isLoading: isOthersLoading } = useGetAllOthersItemsQuery({ query: '' });
  const [logIssuedQuantity, { isLoading }] = useLogIssuedQuantityMutation();
  const user = useSelector((state) => state.user);
  const today = new Date();

  // State for the request type and request code dropdown
  const [selectedRequestType, setSelectedRequestType] = useState("");
  const [requestOptions, setRequestOptions] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Query hooks for each module
  const { data: requisitionsData } = useGetApprovedRequisitionsQuery();
  const { data: orderRequestsData } =  useGetApprovedOrderRequestsQuery();
  const { data: newIndentsData } = useGetApprovedRequestsQuery();


  // When the selected request type changes, update the requestOptions
  useEffect(() => {
    if (selectedRequestType === "requisition") {
      const options =
        requisitionsData?.requisitions?.map((req) => ({
          value: req._id,
          label: req.requisition_code,
        })) || [];
      setRequestOptions(options);
    } else if (selectedRequestType === "order_request") {
      const options =
        orderRequestsData?.orderRequests?.map((req) => ({
          value: req._id,
          label: req.orderRequest_code,
        })) || [];
      setRequestOptions(options);
    } else if (selectedRequestType === "new_indent") {
      const options =
        newIndentsData?.newIndents?.map((ni) => ({
          value: ni._id,
          label: ni.newindent_code,
        })) || [];
      setRequestOptions(options);
    } else {
      setRequestOptions([]);
    }
    // Reset the selected request when type changes
    setSelectedRequest(null);
  }, [selectedRequestType, requisitionsData, orderRequestsData, newIndentsData]);


  
  // Validation schema with additional fields for request type & code.
  const validationSchema = yup.object({
    item_code: yup.string().required("Item code is required"),
    issued_quantity: yup
      .number()
      .required("Issued quantity is required")
      .positive("Quantity must be positive")
      .integer("Quantity must be an integer")
      .test(
        "is-less-than-current",
        "Issued quantity cannot be more than the current quantity",
        function (value) {
          if (this.parent.current_quantity == null) return false;
          return value <= this.parent.current_quantity;
        }
      ),
    date_issued: yup.date().required("Date issued is required"),
    requestType: yup.string().required("Please select a request type"),
    requestId: yup.string().required("Please select a request code"),
  });

  // Initial values: note that requestType and requestId come from our state
  const initialValues = {
    item_code: "",
    item_name: "",
    issued_quantity: 0,
    date_issued: today.toISOString().split("T")[0],
    current_quantity: 0,
    item_id: "",
    requestType: selectedRequestType,
    requestId: selectedRequest ? selectedRequest.value : "",
  };

  const handleItemCodeChange = (e, setFieldValue) => {
    const selectedItem = othersData?.items?.find(item => item.item_code === e.target.value);
    if (selectedItem) {
      setFieldValue("item_code", e.target.value);
      setFieldValue("item_name", selectedItem.item_name || "");
      setFieldValue("current_quantity", selectedItem.current_quantity || 0);
      setFieldValue("item_id", selectedItem._id);
    }
  };
  

  const onSubmitHandler = async (values, { resetForm }) => {
    try {
      const { error } = await logIssuedQuantity({
        item_id: values.item_id,
        request_model: values.requestType,
        request: values.requestId,
        issued_quantity: values.issued_quantity,
        date_issued: values.date_issued,
        user_email: user.email,
      });
  
      if (error) throw new Error(error.data?.message || "Failed to log issued quantity");
  
      toast.success("Issued Quantity Logged Successfully");
      resetForm();
      setVisible(false);
    } catch (e) {
      toast.error(e.message || "An error occurred");
    }
  };
  

  return (
    <Dialog
      header="Log Issued Quantity"
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
        {({ handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="w-full">
               {/* Request Type Radio Group */}
               <div className="mb-3">
              <label className="block mb-2">
                Select Request Type <span className="text-red-500 text-sm">*</span>
              </label>
              <div className="flex gap-x-4">
                <label>
                  <Field
                    type="radio"
                    name="requestType"
                    value="requisition"
                    onClick={() => {
                      setSelectedRequestType("requisition");
                      setFieldValue("requestType", "requisition");
                    }}
                  />
                  Requisition
                </label>
                <label>
                <Field
  type="radio"
  name="requestType"
  value="order_request"
  onChange={() => {
    setSelectedRequestType("order_request");
    setFieldValue("requestType", "order_request");
  }}
/>

                   Order Request
                </label>
                <label>
                  <Field
                    type="radio"
                    name="requestType"
                    value="new_indent"
                    onClick={() => {
                      setSelectedRequestType("new_indent");
                      setFieldValue("requestType", "new_indent");
                    }}
                  />
                  New Indent
                </label>
              </div>
              <ErrorMessage name="requestType" component="p" className="text-red-500 text-sm" />
            </div>

            {/* Request Code Dropdown */}
            {selectedRequestType && (
              <div className="mb-3">
                <label htmlFor="requestId">
                  Select {selectedRequestType.replace("_", " ").toUpperCase()} Code <span className="text-red-500 text-sm">*</span>
                </label>
                <Field
                  as="select"
                  name="requestId"
                  id="requestId"
                  className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    const selectedOption = requestOptions.find(opt => opt.value === selectedValue);
                    setSelectedRequest(selectedOption);
                    setFieldValue("requestId", selectedValue);
                  }}
                >
                  <option value="">Select a code</option>
                  {requestOptions.map((req) => (
                    <option key={req.value} value={req.value}>
                      {req.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="requestId" component="p" className="text-red-500 text-sm" />
              </div>
            )}

            {/* Item Code Dropdown */}
            <div className="mb-3">
              <label htmlFor="item_code">
                Item Code <span className="text-red-500 text-sm">*</span>
              </label>
              <Field
                as="select"
                name="item_code"
                id="item_code"
                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                onChange={(e) => {
                  handleItemCodeChange(e, setFieldValue);
                }}
              >
                <option value="" disabled>
                  Select Item Code
                </option>
                {isOthersLoading ? (
                  <option disabled>Loading items...</option>
                ) : (
                  othersData?.items?.map((item) => ( 
                    <option key={item._id} value={item.item_code}>
                      {item.item_code}
                    </option>
                  ))
                )}
              </Field>
              <ErrorMessage name="item_code" component="p" className="text-red-500 text-sm" />
            </div>

            {/* Read-only Item Name & Current Quantity */}
            <div className="mb-3">
              <label htmlFor="item_name">Item Name</label>
              <Field
                name="item_name"
                id="item_name"
                type="text"
                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="current_quantity">Current Quantity</label>
              <Field
                name="current_quantity"
                id="current_quantity"
                type="number"
                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
                readOnly
              />
            </div>

            {/* Issued Quantity */}
            <div className="mb-3">
              <label htmlFor="issued_quantity">
                Issued Quantity <span className="text-red-500 text-sm">*</span>
              </label>
              <Field
                name="issued_quantity"
                id="issued_quantity"
                type="number"
                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              />
              <ErrorMessage name="issued_quantity" component="p" className="text-red-500 text-sm" />
            </div>

            {/* Date Issued */}
            <div className="mb-3">
              <label htmlFor="date_issued">
                Date Issued <span className="text-red-500 text-sm">*</span>
              </label>
              <Field
                name="date_issued"
                id="date_issued"
                type="date"
                className="w-full px-5 py-2 rounded-md outline-none border-1 border"
              />
              <ErrorMessage name="date_issued" component="p" className="text-red-500 text-sm" />
            </div>

         

   

            <Button
              type="submit"
              className="w-full bg-blue-900 text-center text-white py-3 flex items-center justify-center"
              disabled={isLoading || isOthersLoading}
            >
              {isLoading ? "Logging..." : "Add Log"}
            </Button>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

Model.propTypes = {
  visible: PropTypes.bool.isRequired,
  setVisible: PropTypes.func.isRequired,
};

export default Model;
