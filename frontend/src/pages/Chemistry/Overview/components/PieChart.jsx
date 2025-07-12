import { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { useGetDashboardDataQuery } from '../../../../provider/queries/Chemistry.dashboard.query';
import { toast } from 'sonner';

export default function PieChartDemo() {
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
                    data: [
                        chemicalsSummary.totalCount || 0, 
                        consumablesSummary.totalCount || 0, 
                        glasswaresSummary.totalCount || 0, 
                        equipmentsSummary.totalCount || 0, 
                        booksSummary.totalCount || 0, 
                        othersSummary.totalCount || 0
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',  // Chemicals
                        'rgba(54, 162, 235, 0.5)',  // Consumables
                        'rgba(255, 224, 86, 0.5)',  // Glasswares
                        'rgba(15, 272, 192, 0.5)',  // Equipments
                        'rgba(153, 102, 255, 0.5)', // Books
                        'rgba(255, 119, 64, 0.5)'   // Others
                    ],
                    hoverBackgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ]
                }
            ]
        };

        const options = {
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
    }, [dashboardData]);

    if (isLoading) return <div>Loading...</div>;
    if (error) {
        toast.error("Error fetching dashboard data");
        console.error(error);
        return <div>Error fetching data</div>;
    }

    return (
        <Chart type="pie" data={chartData} options={chartOptions} className="w-full lg:w-1/3" />
    );
}
