import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

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
  // Adjusted column widths
  col1: { width: '4%' },
  col2: { width: '10%' },
  col3: { width: '10%' },
  col4: { width: '10%' },
  col5: { width: '10%' },
  col6: { width: '10%' },
  col7: { width: '8%' },
  col8: { width: '8%' },
  col9: { width: '8%' },
  col10: { width: '8%' },
  col11: { width: '8%' },
  col12: { width: '10%' }, // New column for Unit of Measure
});


const PDFDocument = ({ others }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Chemistry Other Items List</Text>

      <View style={styles.table}>
        {/* Header Row */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, styles.col1]}>Sr. no</Text>
          <Text style={[styles.tableCol, styles.col2]}>Item Code</Text>
          <Text style={[styles.tableCol, styles.col3]}>Name</Text>
          <Text style={[styles.tableCol, styles.col4]}>Category</Text>
          <Text style={[styles.tableCol, styles.col5]}>Company</Text>
          <Text style={[styles.tableCol, styles.col6]}>Purpose</Text>
          <Text style={[styles.tableCol, styles.col7]}>Total Qty</Text>
          <Text style={[styles.tableCol, styles.col8]}>Current Qty</Text>
          <Text style={[styles.tableCol, styles.col9]}>Min Stock</Text>
          <Text style={[styles.tableCol, styles.col10]}>Status</Text>
          <Text style={[styles.tableCol, styles.col11]}>Description</Text>
          <Text style={[styles.tableCol, styles.col12]}>Unit of Measure</Text> {/* New column */}
        </View>

        {/* Data Rows */}
        {others.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.col1]}>{index + 1}</Text>
            <Text style={[styles.tableCol, styles.col2]}>{item.item_code}</Text>
            <Text style={[styles.tableCol, styles.col3]}>{item.item_name}</Text>
            <Text style={[styles.tableCol, styles.col4]}>{item.category || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col5]}>{item.company || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col6]}>{item.purpose || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col7]}>{item.total_quantity}</Text>
            <Text style={[styles.tableCol, styles.col8]}>{item.current_quantity}</Text>
            <Text style={[styles.tableCol, styles.col9]}>{item.min_stock_level}</Text>
            <Text style={[styles.tableCol, styles.col10]}>{item.status}</Text>
            <Text style={[styles.tableCol, styles.col11]}>{item.description || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col12]}>{item.unit_of_measure || 'N/A'}</Text> {/* New column */}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);


PDFDocument.propTypes = {
  others: PropTypes.arrayOf(
    PropTypes.shape({
      item_code: PropTypes.string.isRequired,
      item_name: PropTypes.string.isRequired,
      category: PropTypes.string,
      company: PropTypes.string,
      purpose: PropTypes.string,
      total_quantity: PropTypes.number.isRequired,
      current_quantity: PropTypes.number.isRequired,
      min_stock_level: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
};

export default PDFDocument;
