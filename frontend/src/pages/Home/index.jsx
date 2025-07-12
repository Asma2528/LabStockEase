import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Class',
    items: [
      { name: 'Overview', path: '/chemistry' },
      { name: 'Equipments', path: '/chemistry/equipments' },
      { name: 'Consumables', path: '/chemistry/consumables' },
      { name: 'Chemical', path: '/chemistry/chemicals' },
      { name: 'Glassware', path: '/chemistry/glasswares' },
      { name: 'Books', path: '/chemistry/books' },
      { name: 'Others', path: '/chemistry/others' },
    ],
    color: 'bg-blue-100 border-blue-300',
  },
  {
    title: 'Categories',
    items: [
      { name: 'General', path: '/general' },
      { name: 'Practical', path: '/practical' },
      { name: 'Projects', path: '/projects' },
      { name: 'Others', path: '/others' },
    ],
    color: 'bg-orange-100 border-orange-200',
  },
  {
    title: 'Order Management',
    items: [
      { name: 'Manage Order', path: '/orders' },
      { name: 'Approve Order', path: '/approve-order' },
      { name: 'Manage Vendor', path: '/vendors' },
    ],
    color: 'bg-yellow-100 border-yellow-300',
  },
  {
    title: 'Invoice Management',
    items: [
      { name: 'Invoice / Challans', path: '/manage-invoice' },
      { name: 'Approve Invoice', path: '/approve-invoice' },
      { name: 'Payment Request', path: '/payment-request' },
    ],
    color: 'bg-blue-100 border-blue-300',
  },
  {
    title: 'Stores',
    items: [{ name: 'Inwards', path: '/inwards' }],
    color: 'bg-indigo-100 border-indigo-300',
  },
  {
    title: 'Requisition',
    items: [
      { name: 'Manage Requisition', path: '/manage-requisition' },
      { name: 'Approve Requisition', path: '/approve-requisition' },
      { name: 'View Approved', path: '/view-approved-requisition' },
      { name: 'Return Requisition', path: '/return-requisition' },
      { name: 'View Return Requisition', path: '/view-return-requisition' },
    ],
    color: 'bg-purple-100 border-purple-300',
  },
  {
    title: 'Order Request',
    items: [
      { name: 'Manage', path: '/order-request' },
      { name: 'Approve', path: '/approve-order-request' },
      { name: 'View Approved', path: '/view-approved-order-request' },
    ],
    color: 'bg-red-100 border-red-300',
  },
  {
    title: 'New Indent',
    items: [
      { name: 'New Indent', path: '/new-indent' },
      { name: 'Approve New Indent', path: '/approve-new-indent' },
      { name: 'View Approved', path: '/view-approved-new-indent' },
    ],
    color: 'bg-pink-100 border-pink-300',
  },
  {
    title: 'User Management',
    items: [
      { name: 'Register User', path: '/register' },
      { name: 'Manage User', path: '/user' },
    ],
    color: 'bg-gray-300 border-gray-400',
  },
];

const HomePage = () => {
  return (
    <div className="w-full p-5">
      {sections.map((section) => (
        <div key={section.title} className="w-full flex flex-wrap justify-evenly mt-10">
          <h2 className="font-bold text-xl p-3">{section.title}:</h2>
          <div className="cards w-full flex flex-wrap gap-x-8 ml-10">
            {section.items.map((item) => (
              <Link key={item.path} to={item.path}>
                <div className="card w-80 h-32 rounded-md">
                  <div className={`text-black border-2 shadow-none h-20 rounded-md p-5 ${section.color}`}>
                    <h3 className="m-0">{item.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
