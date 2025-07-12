import { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { useGetDashboardDataQuery } from '../../../../provider/queries/Chemistry.dashboard.query';
import { toast } from 'sonner';

export default function BasicChart() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    const { data: dashboardData = {}, error, isLoading } = useGetDashboardDataQuery();

    // Extract inventory category summaries
    const chemicalsSummary = dashboardData.chemicalsSummary || {};
    const consumablesSummary = dashboardData.consumablesSummary || {};
    const glasswaresSummary = dashboardData.glasswaresSummary || {};
    const equipmentsSummary = dashboardData.equipmentsSummary || {};
    const booksSummary = dashboardData.booksSummary || {};
    const othersSummary = dashboardData.othersSummary || {};

    useEffect(() => {
        const data = {
            labels: ['Chemicals', 'Consumables', 'Glasswares', 'Equipments', 'Books', 'Others'],
            datasets: [
                {
                    label: 'Total Quantity',
                    data: [
                        chemicalsSummary.totalQuantity || 0, 
                        consumablesSummary.totalQuantity || 0, 
                        glasswaresSummary.totalQuantity || 0, 
                        equipmentsSummary.totalQuantity || 0, 
                        booksSummary.totalQuantity || 0, 
                        othersSummary.totalQuantity || 0
                    ],
                    backgroundColor: [
                        'rgba(252, 246, 96, 0.3)',   // Chemicals
                        'rgba(136, 132, 255, 0.2)',  // Consumables
                        'rgba(215, 188, 232, 0.2)',  // Glasswares
                        'rgba(198, 235, 190, 0.2)',  // Equipments
                        'rgba(255, 159, 64, 0.2)',   // Books
                        'rgba(255, 99, 132, 0.2)'    // Others
                    ],
                    borderColor: [
                        'rgb(252, 246, 97)',
                        'rgb(136, 109, 255)',
                        'rgb(215, 151, 232)',
                        'rgb(156, 235, 190)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 99, 132)'
                    ],
                    borderWidth: 1
                }
            ]
        };

        const options = {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true
                    }
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    }, [
        chemicalsSummary.totalQuantity, 
        consumablesSummary.totalQuantity, 
        glasswaresSummary.totalQuantity, 
        equipmentsSummary.totalQuantity, 
        booksSummary.totalQuantity, 
        othersSummary.totalQuantity
    ]);

    if (isLoading) return <div>Loading...</div>;
    if (error) {
        toast.error("Error fetching dashboard data");
        console.error(error);
        return <div>Error fetching data</div>;
    }

    return (
        <Chart type="bar" className="w-full lg:w-1/2" data={chartData} options={chartOptions} />
    );
}
