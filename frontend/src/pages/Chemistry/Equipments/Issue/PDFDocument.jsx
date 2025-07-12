import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textDecoration: 'underline',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 3,
    textAlign: 'left',
    wordBreak: 'break-word',
    flexWrap: 'wrap',
  },
  col1: { width: '14%' },
  col2: { width: '16%' },
  col3: { width: '14%' },
  col4: { width: '14%' },
  col5: { width: '14%' },
  col6: { width: '14%' },
  col7: { width: '14%' },
});

// Component
const PDFDocument = ({ records }) => {
  const filtered = records.filter(r => r.lost_or_damaged_quantity > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Equipment Loss/Damage Report</Text>

        <View style={styles.table}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCol, styles.col1]}>Request</Text>
            <Text style={[styles.tableCol, styles.col2]}>Item</Text>
            <Text style={[styles.tableCol, styles.col3]}>Issued Qty</Text>
            <Text style={[styles.tableCol, styles.col4]}>Date Issued</Text>
            <Text style={[styles.tableCol, styles.col5]}>Returned Qty</Text>
            <Text style={[styles.tableCol, styles.col6]}>Lost/Damaged Qty</Text>
            <Text style={[styles.tableCol, styles.col7]}>Date Returned</Text>
          </View>

          {/* Rows */}
          {filtered.map((entry, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.col1]}>{entry.request}</Text>
              <Text style={[styles.tableCol, styles.col2]}>{entry.item?.item_name || 'N/A'}</Text>
              <Text style={[styles.tableCol, styles.col3]}>{entry.issued_quantity}</Text>
              <Text style={[styles.tableCol, styles.col4]}>{entry.date_issued?.split('T')[0]}</Text>
              <Text style={[styles.tableCol, styles.col5]}>{entry.returned_quantity}</Text>
              <Text style={[styles.tableCol, styles.col6]}>{entry.lost_or_damaged_quantity}</Text>
              <Text style={[styles.tableCol, styles.col7]}>
                {entry.date_returned ? entry.date_returned.split('T')[0] : 'N/A'}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// PropTypes
PDFDocument.propTypes = {
  records: PropTypes.arrayOf(
    PropTypes.shape({
      request: PropTypes.string.isRequired,
      item: PropTypes.shape({
        item_name: PropTypes.string,
      }).isRequired,
      issued_quantity: PropTypes.number.isRequired,
      date_issued: PropTypes.string.isRequired,
      returned_quantity: PropTypes.number.isRequired,
      lost_or_damaged_quantity: PropTypes.number.isRequired,
      date_returned: PropTypes.string,
    })
  ).isRequired,
};

export default PDFDocument;
