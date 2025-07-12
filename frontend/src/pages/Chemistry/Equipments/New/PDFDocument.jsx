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
  col3: { width: '10%' },
  col4: { width: '10%' },
  col5: { width: '10%' },
  col6: { width: '10%' },
  col7: { width: '8%' },
  col8: { width: '8%' },
  col9: { width: '8%' },
  col10: { width: '6%' },
  col11: { width: '6%' },
   col12: { width: '6%' },
  col13: { width: '6%' },
   col14: { width: '15%' },
});

const PDFDocument = ({ equipments }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Chemistry Equipments List</Text>

      <View style={styles.table}>
        {/* Header Row */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, styles.col1]}>Sr. no</Text>
          <Text style={[styles.tableCol, styles.col2]}>Item Code</Text>
          <Text style={[styles.tableCol, styles.col3]}>Name</Text>
          <Text style={[styles.tableCol, styles.col4]}>Manual</Text>
          <Text style={[styles.tableCol, styles.col5]}>Model No</Text>
          <Text style={[styles.tableCol, styles.col6]}>Serial No</Text>
          <Text style={[styles.tableCol, styles.col7]}>Company</Text>
          <Text style={[styles.tableCol, styles.col8]}>Purpose</Text>
          <Text style={[styles.tableCol, styles.col9]}>Total Qty</Text>
          <Text style={[styles.tableCol, styles.col10]}>Current Qty</Text>
          <Text style={[styles.tableCol, styles.col11]}>Min Stock</Text>
          <Text style={[styles.tableCol, styles.col12]}>Status</Text>
                    <Text style={[styles.tableCol, styles.col13]}>Unit of Measure</Text>
          <Text style={[styles.tableCol, styles.col14]}>Description</Text>
        </View>

        {/* Data Rows */}
        {equipments.map((equipment, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.col1]}>{index + 1}</Text>
            <Text style={[styles.tableCol, styles.col2]}>{equipment.item_code}</Text>
            <Text style={[styles.tableCol, styles.col3]}>{equipment.item_name}</Text>
            <Text style={[styles.tableCol, styles.col4]}>{equipment.manual}</Text>
            <Text style={[styles.tableCol, styles.col5]}>{equipment.model_number || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col6]}>{equipment.serial_number || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col7]}>{equipment.company}</Text>
            <Text style={[styles.tableCol, styles.col8]}>{equipment.purpose || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col9]}>{equipment.total_quantity}</Text>
            <Text style={[styles.tableCol, styles.col10]}>{equipment.current_quantity}</Text>
            <Text style={[styles.tableCol, styles.col11]}>{equipment.min_stock_level}</Text>
            <Text style={[styles.tableCol, styles.col12]}>{equipment.status}</Text>
                        <Text style={[styles.tableCol, styles.col13]}>{equipment.unit_of_measure}</Text>

            <Text style={[styles.tableCol, styles.col14]}>{equipment.description || 'N/A'}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

PDFDocument.propTypes = {
  equipments: PropTypes.arrayOf(
    PropTypes.shape({
      item_code: PropTypes.string.isRequired,
      item_name: PropTypes.string.isRequired,
      manual: PropTypes.string.isRequired,
      model_number: PropTypes.string,
      serial_number: PropTypes.string,
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
