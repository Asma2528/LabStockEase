import { pdf } from '@react-pdf/renderer';
import PDFDocument from './PDFDocument';
import PropTypes from 'prop-types';

const ReportButton = ({ data }) => {
  const handleGeneratePDF = async () => {
    if (!data?.items?.length) return;

    const blob = await pdf(<PDFDocument books={data.items} />).toBlob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  return (
    <button
      className="px-4 py-2 bg-gray-300 rounded-md"
      onClick={handleGeneratePDF}
    >
      Generate PDF
    </button>
  );
};

ReportButton.propTypes = {
  data: PropTypes.shape({
    items: PropTypes.array.isRequired,
  }).isRequired,
};

export default ReportButton;
