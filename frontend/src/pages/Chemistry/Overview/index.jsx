import { useGetDashboardDataQuery } from '../../../provider/queries/Chemistry.dashboard.query';
import BreadCrumbs from '../../../components/BreadCrumbs';
import ReportButton from './components/ReportButton';
import DashboardCard from './components/DashboardCard';
import DashboardItem from './components/DashboardItem';
import { toast } from 'sonner';
import { useEffect, useMemo, lazy, Suspense } from 'react';

// Lazy load charts and tables to boost initial render
const BarChart = lazy(() => import('./components/BarChart'));
const PieChart = lazy(() => import('./components/PieChart'));
const InventoryTable = lazy(() => import('./components/InventoryTable'));
const InventoryExpTable = lazy(() => import('./components/InventoryExpTable'));

const HomePage = () => {
  const { data: dashboardData = {}, error, isLoading } = useGetDashboardDataQuery();

  useEffect(() => {
    if (error) {
      toast.error("Error fetching dashboard data");
      console.error(error);
    }
  }, [error]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const {
    chemicalsSummary = {}, consumablesSummary = {}, glasswaresSummary = {},
    equipmentsSummary = {}, othersSummary = {}, booksSummary = {},
    lowStockCount = 'N/A', nearExpiryCount = 'N/A', zeroStockCount = 'N/A',
    expiredItemsCount = 'N/A', inStockCount = 'N/A',
    lowStockItems = [], nearExpiryItems = [], outOfStockItems = [], expiredItems = []
  } = dashboardData;

  const totalItemsCount = useMemo(() => (
    (chemicalsSummary?.totalCount || 0) +
    (consumablesSummary?.totalCount || 0) +
    (glasswaresSummary?.totalCount || 0) +
    (equipmentsSummary?.totalCount || 0) +
    (booksSummary?.totalCount || 0) +
    (othersSummary?.totalCount || 0)
  ), [chemicalsSummary, consumablesSummary, glasswaresSummary, equipmentsSummary, booksSummary, othersSummary]);

  const totalItemsQuantity = useMemo(() => (
    (chemicalsSummary?.totalQuantity || 0) +
    (consumablesSummary?.totalQuantity || 0) +
    (glasswaresSummary?.totalQuantity || 0) +
    (equipmentsSummary?.totalQuantity || 0) +
    (booksSummary?.totalQuantity || 0) +
    (othersSummary?.totalQuantity || 0)
  ), [chemicalsSummary, consumablesSummary, glasswaresSummary, equipmentsSummary, booksSummary, othersSummary]);

  if (isLoading) return <div className="text-center p-5">Loading Dashboard...</div>;

  return (
    <div className="px-5 py-10">
      <BreadCrumbs PageLink='/Chemicals' PageName='Chemicals' />
      <div className="flex justify-end mb-6">
        <ReportButton />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard title="Urgent Actions" bgColor="bg-yellow-100" borderColor="border-yellow-300">
          <DashboardItem label="Low Stock Quantity" value={lowStockCount} />
          <DashboardItem label="Near Expiry Quantity" value={nearExpiryCount} />
        </DashboardCard>

        <DashboardCard title="Stock Details" bgColor="bg-blue-100" borderColor="border-blue-300">
          <DashboardItem label="Zero Stock Products" value={zeroStockCount} />
          <DashboardItem label="In Stock Products" value={inStockCount} />
        </DashboardCard>

        <DashboardCard title="Item Details" bgColor="bg-emerald-50" borderColor="border-emerald-200">
          <DashboardItem label="Total Count of All Items" value={totalItemsCount} />
          <DashboardItem label="Total Quantity of All Items" value={totalItemsQuantity} />
        </DashboardCard>

        <DashboardCard title="Expiration Overview" bgColor="bg-rose-100" borderColor="border-rose-300">
          <DashboardItem label="Out of Stock Items" value={zeroStockCount} />
          <DashboardItem label="Expired Items" value={expiredItemsCount} />
        </DashboardCard>
      </div>

      {/* Charts */}
      <div className="mt-10">
        <Suspense fallback={<div className="text-center">Loading charts...</div>}>
          <h2 className="font-bold text-lg mb-2">Item Quantity by Category</h2>
          <BarChart />
          <h2 className="font-bold text-lg mt-10 mb-2">Item Count by Category</h2>
          <PieChart />
        </Suspense>
      </div>

      {/* Inventory Tables: fetch top 20 by default */}
      <Suspense fallback={<div className="text-center mt-10">Loading inventory tables...</div>}>
        <InventoryTable title="Low Stock Items (Top 20)" items={lowStockItems.slice(0, 20)} showExpiry={false} />
        <InventoryTable title="Out Of Stock Items (Top 20)" items={outOfStockItems.slice(0, 20)} showExpiry={false} />
        <InventoryExpTable title="Near Expiry Items (Top 20)" items={nearExpiryItems.slice(0, 20)} showExpiry={true} formatDate={formatDate} />
        <InventoryExpTable title="Expired Items (Top 20)" items={expiredItems.slice(0, 20)} showExpiry={true} formatDate={formatDate} />
      </Suspense>

     
    </div>
  );
};

export default HomePage;
