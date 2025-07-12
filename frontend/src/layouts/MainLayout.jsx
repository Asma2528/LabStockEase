import PropTypes from 'prop-types';
import  { useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
// import { SlChemistry } from 'react-icons/sl';
import { useDispatch, useSelector } from 'react-redux';
import '../index.css';
import { SidebarSlicePath, toggleSidebar } from '../provider/slice/Sidebar.slice';
import { Link } from 'react-router-dom';
import { IoIosArrowDropright, IoIosArrowDropleft } from 'react-icons/io';
import { fetchUserData } from '../provider/slice/user.slice'; 
import { MdAppRegistration } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";

const MainLayout = ({ children }) => {
  const selector = useSelector(SidebarSlicePath) || { collapsed: false, toggle: false };
  const user = useSelector((state) => state.user); // Access user data from Redux
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);


  const roleMenus = {
  admin: [
 
  <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " key="ai-dashboard" component={<Link to="/ai-dashboard" />} icon={<MdOutlineSpaceDashboard className="text-2xl" />}>
      Dashboard
</MenuItem>,
     <SubMenu className="bg-gray-300  " key="admin-class" label="Class">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry" />}>Overview</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/equipments" />}>Equipments</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/consumables" />}>Consumables</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/chemicals" />}>Chemical</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/glasswares" />}>Glassware</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/books" />}>Books</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/others" />}>Others</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="admin-categories" label="Categories">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/general" />}>General</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/practical" />}>Practical</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/projects" />}>Projects</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/other" />}>Others</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="admin-orders" label="Order Management">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/orders" />}>Manage Order</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/approve-order" />}>Approve Order</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/vendors" />}>Manage Vendor</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="admin-invoice" label="Invoice Management">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/manage-invoice" />}>Invoice / Challans</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/approve-invoice" />}>Approve Invoice</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/payment-request" />}>Payment Request</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="admin-stores" label="Stores">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/inwards" />}>Inwards</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="admin-requisition" label="Requisition">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/manage-requisition" />}>Manage Requisition</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/approve-requisition" />}>Approve Requisition</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/issue-requisition" />}>Issue Approved</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/return-requisition" />}>Return Requisition</MenuItem>
      {/* <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/view-return-requisition" />}>View Return Requisition</MenuItem> */}
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="admin-order-request" label="Order Request">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/order-request" />}>Manage</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/approve-order-request" />}>Approve</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/view-approved-order-request" />}>View Approved</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="admin-new-indent" label="New Indent">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/new-indent" />}>New Indent</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/approve-new-indent" />}>Approve New Indent</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/view-approved-new-indent" />}>View Approved</MenuItem>
    </SubMenu>,

    <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " key="admin-register-user" icon={<MdAppRegistration className="text-2xl" />} component={<Link to="/register" />}>
      Register User
    </MenuItem>,

    <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " key="admin-manage-user" icon={<FaRegUser className="text-xl" />} component={<Link to="/user" />}>
      Manage User
    </MenuItem>
  ],

  "lab-assistant": [
     <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " key="ai-dashboard" component={<Link to="/ai-dashboard" />} icon={<MdOutlineSpaceDashboard className="text-2xl" />}>
      Dashboard
</MenuItem>,

     <SubMenu className="bg-gray-300  " key="lab-class" label="Class">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry" />}>Overview</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/equipments" />}>Equipments</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/consumables" />}>Consumables</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/chemicals" />}>Chemical</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/glasswares" />}>Glassware</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/books" />}>Books</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/chemistry/others" />}>Others</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="lab-categories" label="Categories">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/general" />}>General</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/practical" />}>Practical</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/projects" />}>Projects</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/other" />}>Others</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="lab-stores" label="Stores">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/inwards" />}>Inwards</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="lab-requisition" label="Requisition">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/manage-requisition" />}>Manage Requisition</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/issue-requisition" />}>Issue Approved</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/return-requisition" />}>Return Requisition</MenuItem>
      {/* <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/view-return-requisition" />}>View Return Requisition</MenuItem> */}
    </SubMenu>
  ],

  stores: [
     <SubMenu className="bg-gray-300  " key="stores-order" label="Order Management">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/orders" />}>Manage Order</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/vendors" />}>Manage Vendor</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="stores-invoice" label="Invoice Management">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/manage-invoice" />}>Invoice / Challans</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="stores-inwards" label="Stores">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/inwards" />}>Inwards</MenuItem>
    </SubMenu>,

 <SubMenu className="bg-gray-300  " key="admin-categories" label="Categories">
<MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/general" />}>General</MenuItem>
<MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/practical" />}>Practical</MenuItem>
<MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/projects" />}>Projects</MenuItem>
<MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/other" />}>Others</MenuItem>
</SubMenu>,
  ],

  manager: [
    <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " key="ai-dashboard" component={<Link to="/ai-dashboard" />}>
    AI Dashboard
   </MenuItem>,

     <SubMenu className="bg-gray-300  " key="manager-order" label="Order Management">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/approve-order" />}>Approve Order</MenuItem>
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/vendors" />}>Manage Vendor</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="manager-invoice" label="Invoice Management">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/approve-invoice" />}>Approve Invoice</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="manager-stores" label="Stores">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/inwards" />}>Inwards</MenuItem>
    </SubMenu>
  ],

  accountant: [
     <SubMenu className="bg-gray-300  " key="accountant-invoice" label="Invoice Management">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/payment-request" />}>Payment Request</MenuItem>
    </SubMenu>,

    
 <SubMenu className="bg-gray-300  " key="accountant-orders" label="Order Management">
<MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/orders" />}>Manage Order</MenuItem>
<MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/vendors" />}>Manage Vendor</MenuItem>
</SubMenu>,
  ],

  faculty: [
     <SubMenu className="bg-gray-300  " key="admin-categories" label="Categories">
    <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/general" />}>General</MenuItem>
    <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/practical" />}>Practical</MenuItem>
    <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/projects" />}>Projects</MenuItem>
    <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/other" />}>Others</MenuItem>
  </SubMenu>,
     <SubMenu className="bg-gray-300  " key="faculty-requisition" label="Requisition">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/manage-requisition" />}>Manage Requisition</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="faculty-order-request" label="Order Request">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/order-request" />}>Manage</MenuItem>
    </SubMenu>,

     <SubMenu className="bg-gray-300  " key="faculty-new-indent" label="New Indent">
      <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " component={<Link to="/new-indent" />}>Manage</MenuItem>
    </SubMenu>
  ]
};

  const renderMenuItems = () => {

    if (!user || !user.roles || user.roles.length === 0) {
      return <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300    " key="no-role">No Role Assigned</MenuItem>;
    }
  
    // Merge all role menus into one array
    const mergedMenuItems = user.roles.flatMap(role => roleMenus[role] || []);
  
    return mergedMenuItems;

    };

  return (
<div className="flex min-h-screen bg-gray-500">
      <Sidebar   collapsed={selector.collapsed} breakPoint="lg" toggled={selector.toggle}>
        <Menu className="">
          <MenuItem
  className="!bg-gray-300 !text-black hover:!bg-gray-300   lg:hidden " onClick={() => dispatch(toggleSidebar())}>
            {selector.toggle ? <IoIosArrowDropright className="text-2xl" /> : <IoIosArrowDropleft className="text-2xl" />}
          </MenuItem>
          {renderMenuItems()}
        </Menu>
      </Sidebar>

      <div className="w-full bg-white">
        {children}
      </div>
    </div>
  );
};

// Define prop types
MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
