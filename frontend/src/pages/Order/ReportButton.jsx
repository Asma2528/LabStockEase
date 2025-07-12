import { pdf } from '@react-pdf/renderer';
import PDFDocument from './PDFDocument'; // This remains the actual document structure
import PropTypes from 'prop-types';

const ReportButton = ({ order }) => {
    const handleGeneratePDF = async () => {
        const blob = await pdf(<PDFDocument order={order} />).toBlob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
    };

    return (
        <button
            className="px-4 py-2 bg-gray-300 rounded-md"
            onClick={handleGeneratePDF}
        >
            Generate Report
        </button>
    );
};

ReportButton.propTypes = {
    order: PropTypes.object.isRequired,
};

export default ReportButton;
