import  { useState } from 'react';
import PDFContent from '../PDFContent'; // Adjust the path as needed

const ReportButton = () => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="w-full flex justify-end mb-10 mr-10 font-normal">
                <button
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setVisible(true)}
                >
                    Generate Report
                </button>

                    <PDFContent setVisible={setVisible} visible={visible} />

            </div>
    );
};

export default ReportButton;
