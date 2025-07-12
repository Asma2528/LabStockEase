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
  // Fixed width for each column (adjust as needed)
  col1: { width: '4%' },
  col2: { width: '11%' },
  col3: { width: '11%' },
  col4: { width: '11%' },
  col5: { width: '10%' },
  col6: { width: '10%' },
  col7: { width: '8%' },
  col8: { width: '8%' },
  col9: { width: '8%' },
  col10: { width: '6%' },
  col11: { width: '6%' },
    col12: { width: '6%' },

  col13: { width: '15%' },
});

const PDFDocument = ({ consumables }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Chemistry Consumables List</Text>

      <View style={styles.table}>
        {/* Header Row */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, styles.col1]}>Sr. no</Text>
          <Text style={[styles.tableCol, styles.col2]}>Item Code</Text>
          <Text style={[styles.tableCol, styles.col3]}>Name</Text>
          <Text style={[styles.tableCol, styles.col4]}>CAS No</Text>
          <Text style={[styles.tableCol, styles.col5]}>MSDS</Text>
          <Text style={[styles.tableCol, styles.col6]}>Company</Text>
          <Text style={[styles.tableCol, styles.col7]}>Purpose</Text>
          <Text style={[styles.tableCol, styles.col8]}>Total Qty</Text>
          <Text style={[styles.tableCol, styles.col9]}>Current Qty</Text>
          <Text style={[styles.tableCol, styles.col10]}>Min Stock</Text>
          <Text style={[styles.tableCol, styles.col11]}>Status</Text>
                    <Text style={[styles.tableCol, styles.col12]}>Unit of Measure</Text>

          <Text style={[styles.tableCol, styles.col13]}>Description</Text>
        </View>

        {/* Data Rows */}
        {consumables.map((consumable, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.col1]}>{index + 1}</Text>
            <Text style={[styles.tableCol, styles.col2]}>{consumable.item_code}</Text>
            <Text style={[styles.tableCol, styles.col3]}>{consumable.item_name}</Text>
            <Text style={[styles.tableCol, styles.col4]}>{consumable.casNo}</Text>
            <Text style={[styles.tableCol, styles.col5]}>{consumable.msds}</Text>
            <Text style={[styles.tableCol, styles.col6]}>{consumable.company}</Text>
            <Text style={[styles.tableCol, styles.col7]}>{consumable.purpose || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col8]}>{consumable.total_quantity}</Text>
            <Text style={[styles.tableCol, styles.col9]}>{consumable.current_quantity}</Text>
            <Text style={[styles.tableCol, styles.col10]}>{consumable.min_stock_level}</Text>
            <Text style={[styles.tableCol, styles.col11]}>{consumable.status}</Text>
                        <Text style={[styles.tableCol, styles.col12]}>{consumable.unit_of_measure}</Text>

            <Text style={[styles.tableCol, styles.col13]}>{consumable.description || 'N/A'}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

PDFDocument.propTypes = {
  consumables: PropTypes.arrayOf(
    PropTypes.shape({
      item_code: PropTypes.string.isRequired,
      item_name: PropTypes.string.isRequired,
      casNo: PropTypes.string.isRequired,
      msds: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
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
