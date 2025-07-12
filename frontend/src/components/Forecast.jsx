import { useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ForecastPage = () => {
  const [itemCode, setItemCode] = useState('');
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch forecast from backend
  const fetchForecast = async () => {
    setLoading(true);
    setError('');
    setForecastData([]);

    try {
        const res = await axios.get(`http://127.0.0.1:9000/forecast/${itemCode}`);
        console.log("API Response:", res.data);
      
        if (res.data && res.data.forecast && Array.isArray(res.data.forecast)) {
          setForecastData(res.data.forecast);
        } else {
          setError('No forecast data found for the given item code.');
        }
      } catch (err) {
        console.error(err);
        setError('Forecast failed. Please check item code or server connection.');
      }
      

    setLoading(false);
  };

  // Calculating Stats only when data exists
  const predictedQuantities = forecastData.length > 0
    ? forecastData.map(item => item.predicted_issued_quantity)
    : [];

  const avgPrediction = predictedQuantities.length > 0
    ? (predictedQuantities.reduce((a, b) => a + b, 0) / predictedQuantities.length).toFixed(2)
    : '-';

  const minPrediction = predictedQuantities.length > 0
    ? Math.min(...predictedQuantities).toFixed(2)
    : '-';

  const maxPrediction = predictedQuantities.length > 0
    ? Math.max(...predictedQuantities).toFixed(2)
    : '-';

  return (
    <div className="min-h-screen bg-blue-100 py-10 px-4 flex flex-col items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
          Inventory Demand Forecast
        </h2>

        {/* Item Code Input */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter Item Code (e.g., C-1)"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 w-2/3"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
          />
          <button
            className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-6 rounded-lg"
            onClick={fetchForecast}
            disabled={!itemCode || loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              'Forecast'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-center font-medium mb-4">{error}</div>
        )}

        {/* Forecast Results */}
        {forecastData.length > 0 && (
          <>
            <h3 className="text-xl font-semibold mb-2 text-gray-700">
              Forecast Results for next 30 days: <span className="text-indigo-600">{itemCode}</span>
            </h3>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded shadow text-center">
                <h4 className="text-sm font-medium text-gray-600">Average Quantity</h4>
                <p className="text-lg font-semibold text-blue-900">{avgPrediction}</p>
              </div>
              <div className="bg-green-50 p-4 rounded shadow text-center">
                <h4 className="text-sm font-medium text-gray-600">Min Quantity</h4>
                <p className="text-lg font-semibold text-green-900">{minPrediction}</p>
              </div>
              <div className="bg-red-50 p-4 rounded shadow text-center">
                <h4 className="text-sm font-medium text-gray-600">Max Quantity</h4>
                <p className="text-lg font-semibold text-red-900">{maxPrediction}</p>
              </div>
            </div>

            {/* Day Range */}
            <p className="text-sm text-gray-500 mb-4">
              From day {forecastData[0]?.day} to day {forecastData[forecastData.length - 1]?.day}
            </p>

            {/* Forecast Table */}
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border border-gray-300 bg-white rounded-md shadow-sm">
                <thead>
                  <tr className="bg-blue-700 text-white text-left">
                    <th className="px-4 py-2">Day</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Predicted Issued Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((item) => (
                    <tr
                      key={item.day}
                      className="border-t border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{item.day}</td>
                      <td className="px-4 py-2">{item.date}</td>
                      <td className="px-4 py-2">
                        {item.predicted_issued_quantity} {item.unit_of_measure}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Forecast Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
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
        )}
      </div>
    </div>
  );
};

export default ForecastPage;
