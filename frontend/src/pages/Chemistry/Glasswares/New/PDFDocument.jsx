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
  col1: { width: '6%' },   // Sr. no
  col2: { width: '10%' },  // Item Code
  col3: { width: '12%' },  // Name
  col4: { width: '10%' },  // Company
  col5: { width: '10%' },  // Purpose
  col6: { width: '12%' },  // Total Qty
  col7: { width: '8%' },   // Current Qty
  col8: { width: '8%' },   // Min Stock
  col9: { width: '8%' },   // Status
  col10: { width: '8%' },  // Unit of Measure
  col11: { width: '10%' }, // Description
});


const PDFDocument = ({ glasswares }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Chemistry Glassware List</Text>

      <View style={styles.table}>
        {/* Header Row */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, styles.col1]}>Sr. no</Text>
          <Text style={[styles.tableCol, styles.col2]}>Item Code</Text>
          <Text style={[styles.tableCol, styles.col3]}>Name</Text>
          <Text style={[styles.tableCol, styles.col4]}>Company</Text>
          <Text style={[styles.tableCol, styles.col5]}>Purpose</Text>
          <Text style={[styles.tableCol, styles.col6]}>Total Qty</Text>
          <Text style={[styles.tableCol, styles.col7]}>Current Qty</Text>
          <Text style={[styles.tableCol, styles.col8]}>Min Stock</Text>
          <Text style={[styles.tableCol, styles.col9]}>Status</Text>
          <Text style={[styles.tableCol, styles.col10]}>Unit of Measure</Text>
          <Text style={[styles.tableCol, styles.col11]}>Description</Text>
        </View>

        {/* Data Rows */}
        {glasswares.map((glassware, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.col1]}>{index + 1}</Text>
            <Text style={[styles.tableCol, styles.col2]}>{glassware.item_code}</Text>
            <Text style={[styles.tableCol, styles.col3]}>{glassware.item_name}</Text>
            <Text style={[styles.tableCol, styles.col4]}>{glassware.company}</Text>
            <Text style={[styles.tableCol, styles.col5]}>{glassware.purpose || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col6]}>{glassware.total_quantity}</Text>
            <Text style={[styles.tableCol, styles.col7]}>{glassware.current_quantity}</Text>
            <Text style={[styles.tableCol, styles.col8]}>{glassware.min_stock_level}</Text>
            <Text style={[styles.tableCol, styles.col9]}>{glassware.status}</Text>
            <Text style={[styles.tableCol, styles.col10]}>{glassware.unit_of_measure}</Text>
            <Text style={[styles.tableCol, styles.col11]}>{glassware.description || 'N/A'}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);


PDFDocument.propTypes = {
  glasswares: PropTypes.arrayOf(
    PropTypes.shape({
      item_code: PropTypes.string.isRequired,
      item_name: PropTypes.string.isRequired,
      company: PropTypes.string,
      purpose: PropTypes.string,
      total_quantity: PropTypes.number.isRequired,
      current_quantity: PropTypes.number.isRequired,
      min_stock_level: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
            unit_of_measure: PropTypes.string.isRequired,
      
      description: PropTypes.string,
    })
  ).isRequired,
};

export default PDFDocument;
