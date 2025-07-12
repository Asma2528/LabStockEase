import { useState, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import {useGetAllInvoicesQuery} from '../../provider/queries/Invoice.query';
import Loader from '../../components/Loader';
import { Button } from 'primereact/button';
import { LuView } from 'react-icons/lu';
import React from 'react';

const PaymentRequestPage = () => {
  const [searchParams, setSearchParams] = useState({
    orderNumber: "",
    poNumber: "",
    billNo: "",
    billDate: "",
    status:"Approved",
   vendorName: ""
  });

  const { isLoading, data, refetch } = useGetAllInvoicesQuery(searchParams);


  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    refetch();
  }, [refetch]); 
  
  const onSearchChange = (e) => {
    const { name, value } = e.target;
    
    setSearchParams((prev) => {
      const updatedParams = { ...prev, [name]: value };
  
      // Remove empty values to prevent sending unnecessary query parameters
      Object.keys(updatedParams).forEach((key) => {
        if (updatedParams[key] === "") {
          delete updatedParams[key];
        }
      });
  
      return updatedParams;
    });
  };
  

 

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

 

  return (
    <div className="w-full flex flex-wrap justify-evenly mt-10">
      <BreadCrumbs PageLink='/approve-invoice' PageName='Approve Invoices' />

   

      {/* Search Bar */}
      <div className="mt-10 flex justify-center w-full mx-auto flex-col">
        <label className="my-3 ml-7" htmlFor="Search">Search By:</label>
        <form className="mb-3 flex justify-end w-[95%] mx-auto gap-x-4">
          <input name="orderNumber" placeholder="Enter Order Number" className="w-1/2 p-2 border rounded" onChange={onSearchChange} value={searchParams.orderNumber} />
          <input name="poNumber" placeholder="PO Number" className="w-1/2 p-2 border rounded" onChange={onSearchChange} value={searchParams.poNumber} />
          <input name="billNo" placeholder="Bill No" className="w-1/2 p-2 border rounded" onChange={onSearchChange} value={searchParams.billNo} />
          <input name="billDate" placeholder="Bill Date" type="text" className="w-1/2 p-2 border rounded" onFocus={(e) => (e.target.type = "date")} onBlur={(e) => (e.target.type = "text")} onChange={onSearchChange} value={searchParams.billDate} />
          <input name="vendorName" placeholder="Vendor" className="w-1/2 p-2 border rounded" onChange={onSearchChange} value={searchParams.vendor} />

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

export default PaymentRequestPage;
