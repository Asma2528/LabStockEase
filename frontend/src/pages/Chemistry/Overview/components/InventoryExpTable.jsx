import PropTypes from "prop-types";

const InventoryExpTable = ({ title, items, showExpiry = true, formatDate }) => (
  <div className="w-full flex flex-col my-10 gap-y-2">
    <h1 className="font-bold">{title}:</h1>
    <div className="relative overflow-x-auto shadow">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-black border-b uppercase bg-gray-50">
          <tr className="border-b">
            <th className="px-4 py-2">Item Code</th>
            <th className="px-4 py-2">Item Name</th>
            <th className="px-4 py-2">Total Quantity</th>
            <th className="px-4 py-2">Current Quantity</th>
            <th className="px-4 py-2">Minimum Stock Level</th>
            {showExpiry && <th className="px-4 py-2">Expiration Date</th>}
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => {
              const itemData = item.chemical || item.consumable || item.other || item.equipment || {};
              return (
                <tr key={item._id}>
                  <td className="px-4 py-2">{itemData.item_code || "N/A"}</td>
                  <td className="px-4 py-2">{itemData.item_name || "N/A"}</td>
                  <td className="px-4 py-2">{itemData.total_quantity || 0}</td>
                  <td className="px-4 py-2">{itemData.current_quantity || 0}</td>
                  <td className="px-4 py-2">{itemData.min_stock_level || "N/A"}</td>
                  {showExpiry && (
                    <td className="px-4 py-2">{formatDate(item.expiration_date)}</td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={showExpiry ? 6 : 5} className="px-4 py-2 text-center">
                No Data Available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

InventoryExpTable.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  showExpiry: PropTypes.bool,
  formatDate: PropTypes.func.isRequired,
};

export default InventoryExpTable;
