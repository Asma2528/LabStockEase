import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AIDashboard = () => {
  const [forecast, setForecast] = useState([]);
  const [forecastItemCode, setForecastItemCode] = useState('');
  const [loadingForecast, setLoadingForecast] = useState(false);

  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiryRiskItems, setExpiryRiskItems] = useState([]);
  const [anomaliesItems, setAnomaliesItems] = useState([]);
  const [reorderRecommendations, setReorderRecommendations] = useState([]);


    // For user suggestions
    const [userInputEmail, setUserInputEmail] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);


  useEffect(() => {
    fetchAllInsights();
  }, []);

  const fetchAllInsights = async () => {
    try {
      const riskRes = await axios.get(`http://127.0.0.1:9000/risk-items`);
      const reorderRes = await axios.get(`http://127.0.0.1:9000/reorder-recommendations`);


      setLowStockItems(riskRes.data.low_stock || []);
      setExpiryRiskItems(riskRes.data.expiry_risks || []);
      setAnomaliesItems(riskRes.data.anomalies || []);
      setReorderRecommendations(reorderRes.data.recommendations || []);
 
    } catch (err) {
      console.error("Error fetching AI Insights:", err);
    }
  };

  const fetchForecast = async (itemCode) => {
    if (!itemCode) return;
    setLoadingForecast(true);
    try {
      const res = await axios.get(`http://127.0.0.1:9000/forecast/${itemCode}`);
     setForecast([
  {
    day: "Next Month",
    date: res.data.forecast_month,
    predicted_issued_quantity: res.data.predicted_quantity,
    unit_of_measure: res.data.unit_of_measure,
  },
]);

    } catch (err) {
      console.error(`Error fetching forecast for ${itemCode}:`, err);
      setForecast([]);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleUserSuggestionFetch = async () => {
    if (!userInputEmail) return;
    setLoadingSuggestions(true);
    try {
      const res = await axios.get(`http://127.0.0.1:9000/user-suggestions/${encodeURIComponent(userInputEmail)}`);
      setUserSuggestions(res.data.suggested_items || []);
    } catch (err) {
      console.error("Error fetching user suggestions:", err);
      setUserSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };


  const predictedQuantities = forecast.map(item => item.predicted_issued_quantity);
  const avgPrediction = predictedQuantities.length
    ? (predictedQuantities.reduce((a, b) => a + b, 0) / predictedQuantities.length).toFixed(2)
    : 0;
  const minPrediction = predictedQuantities.length ? Math.min(...predictedQuantities) : 0;
  const maxPrediction = predictedQuantities.length ? Math.max(...predictedQuantities) : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">AI Insights Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ✅ Forecasted Demand Section */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Forecasted Demand</h2>

          <div className="flex items-center mb-4 gap-2">
            <input
              type="text"
              value={forecastItemCode}
              onChange={(e) => setForecastItemCode(e.target.value)}
              placeholder="Enter Item Code (e.g., CHE-1)"
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
            <button
              onClick={() => fetchForecast(forecastItemCode)}
              disabled={loadingForecast || !forecastItemCode}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded"
            >
              {loadingForecast ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                  <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) : 'Forecast'}
            </button>
          </div>

          {forecast.length > 0 ? (
            <>
              {/* ✅ Visual Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded shadow text-center">
                  <h4 className="text-sm font-medium text-gray-600">Average</h4>
                  <p className="text-lg font-semibold text-blue-900">{avgPrediction} units</p>
                </div>
                <div className="bg-green-50 p-4 rounded shadow text-center">
                  <h4 className="text-sm font-medium text-gray-600">Min</h4>
                  <p className="text-lg font-semibold text-green-900">{minPrediction} units</p>
                </div>
                <div className="bg-red-50 p-4 rounded shadow text-center">
                  <h4 className="text-sm font-medium text-gray-600">Max</h4>
                  <p className="text-lg font-semibold text-red-900">{maxPrediction} units</p>
                </div>
              </div>

              {/* ✅ Forecast Table */}
              <div className="overflow-x-auto mb-8">
                <table className="min-w-full border border-gray-300 bg-white rounded-md shadow-sm">
                  <thead>
                    <tr className="bg-blue-700 text-white">
                      <th className="px-4 py-2 text-left">Day</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Predicted Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((item) => (
                      <tr key={item.day} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2">{item.day}</td>
                        <td className="px-4 py-2">{item.date}</td>
                        <td className="px-4 py-2">{item.predicted_issued_quantity} {item.unit_of_measure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ✅ Forecast Line Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted_issued_quantity"
                      stroke="#1e3a8a"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No forecast data available.</p>
          )}
        </div>

        {/* ✅ Stock Risks */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-700">Stock Risks</h2>
          <h3 className="font-semibold text-gray-700">Low Stock</h3>
          <ul className="text-sm mb-4">
            {lowStockItems.map((item) => (
              <li key={item.item_code} className="flex justify-between">
                <span>{item.item_name}</span>
                <span className="text-red-600">{item.current_quantity} {item.unit_of_measure}</span>
              </li>
            ))}
          </ul>

          <h3 className="font-semibold text-gray-700">Expiring Soon</h3>
          <ul className="text-sm">
            {expiryRiskItems.map((item) => (
              <li key={item.item_code} className="flex justify-between">
                <span>{item.item_name}</span>
                <span className="text-yellow-600">Expires in {item.days_to_expiry} days</span>
              </li>
            ))}
          </ul>

          <div className="bg-white rounded shadow p-6">
  <h2 className="text-xl font-semibold mb-4 text-yellow-700">Anomaly Detections</h2>

  {anomaliesItems.length > 0 ? (
    <ul className="text-sm space-y-2">
      {anomaliesItems.map((item) => (
        <li
          key={item.item_code}
          className="flex flex-col sm:flex-row sm:justify-between bg-yellow-50 border border-yellow-200 rounded p-3 hover:bg-yellow-100"
        >
          <div>
            <p className="font-medium">{item.item_name} ({item.item_code})</p>
            <p className="text-xs text-gray-500">Class: {item.class}</p>
          </div>
          
          <div className="text-right mt-2 sm:mt-0">
            <p className="text-yellow-600">Current: {item.current_quantity} {item.unit_of_measure}</p>
            {item.days_to_expiry !== undefined && (
              <p className="text-yellow-600">Expires in {item.days_to_expiry} days</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-500">No anomalies detected.</p>
  )}
</div>

        </div>

        {/* ✅ Reorder Recommendations */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-700">Reorder Recommendations</h2>
          <ul className="space-y-2">
            {reorderRecommendations.map((rec) => (
              <li key={rec.item_code} className="flex justify-between">
                <span>{rec.item_name}</span>
                <span className="text-green-800">{rec.recommended_quantity} {rec.unit_of_measure}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* User Suggestions with Email Input */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-indigo-700">User Suggestions</h2>

          <div className="flex items-center mb-4 gap-2">
            <input
              type="email"
              value={userInputEmail}
              onChange={(e) => setUserInputEmail(e.target.value)}
              placeholder="Enter User Email"
              className="border border-gray-300 rounded px-3 py-2 flex-1"
            />
            <button
              onClick={handleUserSuggestionFetch}
              disabled={loadingSuggestions || !userInputEmail}
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded"
            >
              {loadingSuggestions ? "Fetching..." : "Get Suggestions"}
            </button>
          </div>

          {userSuggestions.length > 0 ? (
  <ul className="text-sm space-y-2">
    {userSuggestions.map((item, index) => (
      <li
        key={index}
        className="bg-indigo-50 border border-indigo-200 rounded px-4 py-2 flex flex-col sm:flex-row sm:justify-between"
      >
        <div>
          <p className="font-medium text-indigo-800">{item.item_name}</p>
          <p className="text-xs text-gray-600">Class: {item.class}</p>
        </div>
        <p className="text-indigo-600 text-sm mt-1 sm:mt-0">
          Requested {item.times_requested} time{item.times_requested > 1 ? 's' : ''}
        </p>
      </li>
    ))}
  </ul>
) : (
  <p className="text-sm text-gray-500">No suggestions available.</p>
)}

        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
