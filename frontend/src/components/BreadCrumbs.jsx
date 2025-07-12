import React from 'react'; 
import { Link, useLocation } from 'react-router-dom';

const breadcrumbMap = {
  '/': 'Dashboard',
  '/chemistry': 'Chemistry',
  '/vendors': 'Vendors',
  '/orders': 'Orders',
  '/approve-order':'Approve Order',
  '/projects': 'Projects',
  '/other': 'Other',
  '/practical': 'Practical',
  '/general': 'General',
  '/manage-requisition':'Manage Requisition',
  '/approve-requisition':'Approve Requisition',
  '/issue-requisition':'Issue Requisition',
  '/return-requisition':'Return Requisition',
  '/view-return-requisition':'View Returned Requisition',
  '/order-request':'Manage Order Request',
  '/approve-order-request':'Approve Order Request',
  '/view-approved-order-request':'View Approved Order Request',
  '/new-indent':'New Indent',
  '/approve-new-indent':'Approve New Indent',
  '/view-approved-new-indent':'View Approved New Indent',
  '/chemistry/chemicals': 'Chemicals',
  '/chemistry/chemicals/restock': 'Chemicals Restock',
  '/chemistry/chemicals/logs': 'Chemical Logs',
  '/chemistry/consumables': 'Consumables',
  '/chemistry/consumables/restock': 'Consumables Restock',
  '/chemistry/consumables/logs': 'Consumables Logs',
  '/chemistry/equipments/logs': 'Equipment Logs',
  '/chemistry/equipments': 'Equipments',
  '/chemistry/equipments/restock': 'Equipments Restock',
  '/chemistry/others/logs': 'Other Logs',
  '/chemistry/others': 'Others',
  '/chemistry/others/restock': 'Others Restock',
  '/chemistry/glasswares/logs': 'Glassware Logs',
  '/chemistry/glasswares': 'Glasswares',
  '/chemistry/glasswares/restock': 'Glasswares Restock',
  '/chemistry/books/logs': 'Book Logs',
  '/chemistry/books': 'Books',
  '/chemistry/books/restock': 'Books Restock',
  '/manage-invoice':'Manage Invoice',
  '/approve-invoice':'Approve Invoice',
  '/payment-request':'Payment Request',
  '/inwards':'Manage Inwards',
  '/user':'Manage Users',
};

const BreadCrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  const breadcrumbItems = pathnames.map((_, index) => {
    const pathname = `/${pathnames.slice(0, index + 1).join('/')}`;
    return {
      name: breadcrumbMap[pathname] || 'Unknown',
      link: pathname
    };
  });

  return (
    <div className="w-[86%] lg:w-[93%] mx-10 mt-2 mb-10 flex md:items-center md:justify-between flex-col md:flex-row">
      <h1 className='text-2xl font-semibold leading-tight'>{breadcrumbItems[breadcrumbItems.length - 1].name}</h1>
      <ul className="flex items-center gap-x-2 text-blue-500" aria-label="breadcrumb">
        <li><Link to="/">Dashboard</Link></li>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <li><span>/</span></li>
            <li>
              {index === breadcrumbItems.length - 1
                ? <span>{item.name}</span>
                : <Link to={item.link}>{item.name}</Link>}
            </li>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default BreadCrumbs;
