import { useState, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useGetAllInvoicesQuery, useApproveInvoiceMutation } from '../../provider/queries/Invoice.query';
import Loader from '../../components/Loader';
import { toast } from 'sonner';
import { Button } from 'primereact/button';
import { FaRegEdit } from 'react-icons/fa';
import { LuView } from 'react-icons/lu';
import { Dialog } from 'primereact/dialog';
import React from 'react';
import { Dropdown } from 'primereact/dropdown';

const ApproveInvoicePage = () => {
  const [searchParams, setSearchParams] = useState({
    orderNumber: "",
    poNumber: "",
    billNo: "",
    billDate: "",
    status: "",
  });

  const { isLoading, data, refetch } = useGetAllInvoicesQuery(searchParams);
  const [approveInvoice] = useApproveInvoiceMutation();

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusValue, setStatusValue] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
   const [remark, setRemark] = useState('');

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    refetch();
  };

  const onSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value.trim(),
    }));
  };

  const handleStatusChange = (invoice) => {
    setSelectedInvoice(invoice);
    setStatusValue(invoice.status || 'Pending');
    setIsDialogVisible(true);
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const invoiceStatuses = ["Approved", "Rejected", "On hold"];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDialogConfirm = async () => {
    try {
      if (!statusValue || !["Approved", "Rejected", "On hold"].includes(statusValue)) {
        toast.error("Invalid status value.");
        return;
      }

      console.log("Approving invoice with:", { id: selectedInvoice._id, status: statusValue });

     
      await approveInvoice({
        id: selectedInvoice._id,
        status: statusValue.trim(),
        remark:remark
      }).unwrap();

      toast.success(`Invoice status updated to ${statusValue}`);
      setIsDialogVisible(false);
      refetch();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to update invoice');
    }
  };

  return (
    <div className="w-full flex flex-wrap justify-evenly mt-10">
      <BreadCrumbs PageLink='/approve-invoice' PageName='Approve Invoices' />

      <Dialog 
        visible={isDialogVisible} 
        onHide={() => setIsDialogVisible(false)} 
        header="Update Invoice Status"
        className="w-[400px]"
      >
        <div className="flex flex-col gap-4">
          <label>Status:</label>
          <Dropdown
            value={statusValue}
            options={invoiceStatuses.map(status => ({ label: status, value: status }))}
            onChange={(e) => setStatusValue(e.value)}
            placeholder="Select Status"
            className="w-full"
          />
      
          <div className="mb-3">
            <label htmlFor="remark">Requisition Remarks</label>
            <textarea
              id="remark"
              className="w-full p-2 border rounded"
              rows="3"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button label="Cancel" className=" py-2 px-4 rounded-md bg-red-500 text-white" onClick={() => setIsDialogVisible(false)} />
            <Button 
    label="Confirm" 
    className="py-2 px-4 rounded-md bg-green-600 text-white" 
    onClick={handleDialogConfirm}  
    
/>
          </div>
        </div>
      </Dialog>

      {/* Search Bar */}
      <div className="mt-10 flex justify-center w-full mx-auto flex-col">
        <label className="my-3 ml-7" htmlFor="Search">Search By:</label>
        <form onSubmit={handleSearchSubmit} className="mb-3 flex justify-end w-[95%] mx-auto gap-x-4">
          <input name="orderNumber" placeholder="Enter Order Number" className="w-1/2 p-2 rounded" onChange={onSearchChange} value={searchParams.orderNumber} />
          <input name="poNumber" placeholder="PO Number" className="w-1/2 p-2 rounded" onChange={onSearchChange} value={searchParams.poNumber} />
          <input name="billNo" placeholder="Bill No" className="w-1/2 p-2 rounded" onChange={onSearchChange} value={searchParams.billNo} />
          <input name="billDate" placeholder="Bill Date" type="text" className="w-1/2 p-2 rounded" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} onChange={onSearchChange} value={searchParams.billDate} />
          <select name="status" value={searchParams.status} onChange={onSearchChange} className="w-1/3 p-2 rounded text-gray-500">
            <option value="">Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="On hold">On Hold</option>
          </select>
        </form>
      </div>

      {/* Invoices Table */}
      <div className="w-full pt-10">
        {isLoading ? <Loader /> : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Bill Number</th>
                <th className="px-4 py-2">Bill Date</th>
                <th className="px-4 py-2">Invoice Amount</th>
                <th className="px-4 py-2">Approved By / Rejected By</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
  {data?.invoices?.length > 0 ? (
    data.invoices.map((invoice) => (
      <React.Fragment key={invoice._id}>
        <tr>
          <td className="px-4 py-2">{invoice.order?.orderNumber || 'N/A'} / {invoice.order?.poNumber || 'N/A'}</td>
          <td className="px-4 py-2">{invoice.billNo || 'N/A'}</td>
          <td className="px-4 py-2">{formatDate(invoice.billDate)}</td>
          <td className="px-4 py-2">{invoice.invoiceAmount || 'N/A'}</td>
          <td className="px-4 py-2">{invoice.approvedBy?.name || 'N/A'}</td>
          <td className="px-4 py-2">{invoice.status || 'N/A'}</td>
          <td className="px-4 py-2">
            <Button className="p-3 bg-indigo-500 text-white rounded-sm mx-2" title="View" onClick={() => toggleExpandRow(invoice._id)}>
              <LuView className="text-xl" />
            </Button>
            <Button className="p-3 bg-lime-400 text-white rounded-sm" title="Approve/Reject" onClick={() => handleStatusChange(invoice)} disabled={invoice.status !== 'Pending'}>
              <FaRegEdit className="text-xl" />
            </Button>
          </td>
        </tr>
        {expandedRow === invoice._id && (
          <tr key={`${invoice._id}-expanded`}>
            <td colSpan="7" className="p-4 bg-gray-100">
              <p><strong>Order:</strong> {invoice.order?.orderNumber || 'N/A'} / {invoice.order?.poNumber || 'N/A'}</p>
              <p><strong>Bill Number:</strong> {invoice.billNo || 'N/A'}</p>
              <p><strong>Bill Date:</strong> {formatDate(invoice.billDate)}</p>
              <p><strong>Invoice Amount:</strong> {invoice.invoiceAmount || 'N/A'}</p>
              <p><strong>Status:</strong> {invoice.status || 'N/A'}</p>
              <p><strong>Approved By / Rejected By:</strong> {invoice.approvedBy?.name || 'N/A'}</p>
                                     <p><strong>Remark:</strong> {invoice.remark || 'N/A'}</p>

              <p><strong>Approved At / Rejected At:</strong> {formatDate(invoice.approved_at)}</p>
              <p><strong>Created By:</strong> {invoice.createdBy?.name || 'Unknown'}</p>
              <p><strong>Created At:</strong> {formatDate(invoice.createdAt)}</p>
              <p><strong>Comment:</strong> {invoice.comment || 'No comments'}</p>
            </td>
          </tr>
        )}
      </React.Fragment>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="text-center">No invoices found</td>
    </tr>
  )}
</tbody>


          </table>
        )}
      </div>
    </div>
  );
};

export default ApproveInvoicePage;
