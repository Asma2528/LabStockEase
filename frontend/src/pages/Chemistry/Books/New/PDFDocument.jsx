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
  col10: { width: '8%' },
  col11: { width: '8%' },
  col12: { width: '15%' },
});

const PDFDocument = ({ books }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Chemistry Books List</Text>

      <View style={styles.table}>
        {/* Header Row */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCol, styles.col1]}>Sr. no</Text>
          <Text style={[styles.tableCol, styles.col2]}>Item Code</Text>
          <Text style={[styles.tableCol, styles.col3]}>Name</Text>
          <Text style={[styles.tableCol, styles.col4]}>Author</Text>
          <Text style={[styles.tableCol, styles.col5]}>Publisher</Text>
          <Text style={[styles.tableCol, styles.col6]}>Edition</Text>
          <Text style={[styles.tableCol, styles.col7]}>Total Qty</Text>
          <Text style={[styles.tableCol, styles.col8]}>Current Qty</Text>
          <Text style={[styles.tableCol, styles.col9]}>Min Stock</Text>
          <Text style={[styles.tableCol, styles.col10]}>Location</Text>
          <Text style={[styles.tableCol, styles.col11]}>Status</Text>
          <Text style={[styles.tableCol, styles.col12]}>Description</Text>
        </View>

        {/* Data Rows */}
        {books.map((book, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.col1]}>{index + 1}</Text>
            <Text style={[styles.tableCol, styles.col2]}>{book.item_code}</Text>
            <Text style={[styles.tableCol, styles.col3]}>{book.item_name}</Text>
            <Text style={[styles.tableCol, styles.col4]}>{book.author}</Text>
            <Text style={[styles.tableCol, styles.col5]}>{book.publisher}</Text>
            <Text style={[styles.tableCol, styles.col6]}>{book.edition || 'N/A'}</Text>
            <Text style={[styles.tableCol, styles.col7]}>{book.total_quantity}</Text>
            <Text style={[styles.tableCol, styles.col8]}>{book.current_quantity}</Text>
            <Text style={[styles.tableCol, styles.col9]}>{book.min_stock_level}</Text>
            <Text style={[styles.tableCol, styles.col10]}>{book.location}</Text>
            <Text style={[styles.tableCol, styles.col11]}>{book.status}</Text>
            <Text style={[styles.tableCol, styles.col12]}>{book.description || 'N/A'}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

PDFDocument.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      item_code: PropTypes.string.isRequired,
      item_name: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      publisher: PropTypes.string.isRequired,
      edition: PropTypes.string,
      total_quantity: PropTypes.number.isRequired,
      current_quantity: PropTypes.number.isRequired,
      min_stock_level: PropTypes.number.isRequired,
      location: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
};

export default PDFDocument;
