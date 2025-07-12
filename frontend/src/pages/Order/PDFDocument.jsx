import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

// Format date
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        lineHeight: 1.5,
    },
    centeredHeader: {
        textAlign: 'center',
        marginBottom: 10,
    },
    collegeName: {
        fontSize: 12,
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: 4,
    },
    addressLine: {
        fontSize: 10,
        fontWeight: 'normal',
    },
    section: {
        marginVertical: 10,
    },
    heading: {
        fontSize: 11,
        fontWeight: 'bold',
        textDecoration: 'underline',
        marginBottom: 5,
    },
    label: {
        fontWeight: 'bold',
    },
    detailText: {
        marginBottom: 2,
    },
    table: {
        display: 'table',
        width: '100%',
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeaderCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        padding: 4,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        padding: 4,
        textAlign: 'center',
    },
    // widths for each column
    colEntryNo: { width: '8%' },
    colDescription: { width: '14%' },
    colClass: { width: '12%' },
    colItemCode: { width: '12%' },
    colMake: { width: '10%' },
    colQty: { width: '8%' },
    colRate: { width: '8%' },
    colDiscount: { width: '8%' },
    colGST: { width: '8%' },
    colCost: { width: '12%' },
});

// Main component
const PDFDocument = ({ order }) => {
    const createdByName = typeof order.createdBy === 'object' ? order.createdBy?.name : order.createdBy;
    const approvedByName = typeof order.approvedBy === 'object' ? order.approvedBy?.name : 'N/A';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Centered Heading Block */}
                <View style={styles.centeredHeader}>
                    <Text style={styles.collegeName}>ORDER</Text>
                    <Text style={styles.addressLine}>JAI HIND COLLEGE, BASANTSINGH INSTITUTE OF SCIENCE & J.T. LALVANI COLLEGE OF COMMERCE,</Text>
                    <Text style={styles.addressLine}>23-24, BACKBAY RECLAMATION, ‘A’ ROAD, CHURCHGATE, MUMBAI 400 020.</Text>
                    <Text style={styles.addressLine}>CHEMISTRY DEPARTMENT</Text>
                    <Text style={styles.addressLine}>DEGREE COLLEGE ORDER - STAR DBT SCHEME</Text>
                </View>

                {/* Order Details */}
                <View style={styles.section}>
                    <Text style={styles.heading}>Order Details</Text>
                    {[
                        ['Order Number', order.orderNumber],
                        ['PO Number', order.poNumber],
                        ['Category Type', order.categoryType || 'N/A'],
                        ['Category Code', order.categoryCode || 'N/A'],
                        ['Vendor', order.vendor ? `${order.vendor.code} - ${order.vendor.name}` : 'Unknown Vendor'],
                        ['Quotation Ref No', order.quotationRefNo],
                        ['Quotation Date', formatDate(order.quotationDate)],
                        ['Status', order.status],
                        ['Created By', createdByName || 'N/A'],
                        ['Approved/Rejected By', approvedByName],
                        ['Remark', order.remark],
                        ['Created At', formatDate(order.createdAt)],
                        ['Updated At', formatDate(order.updatedAt)],
                        ['Notes', order.notes || 'N/A'],
                    ].map(([label, value], i) => (
                        <Text key={i} style={styles.detailText}><Text style={styles.label}>{label}:</Text> {value}</Text>
                    ))}
                </View>

             <View style={styles.section}>
    <Text style={styles.heading}>Items</Text>
    <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
            <Text style={[styles.tableHeaderCol, styles.colEntryNo]}>Entry No</Text>
            <Text style={[styles.tableHeaderCol, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCol, styles.colClass]}>Class</Text>
            <Text style={[styles.tableHeaderCol, styles.colItemCode]}>Item Code</Text>
            <Text style={[styles.tableHeaderCol, styles.colMake]}>Make</Text>
            <Text style={[styles.tableHeaderCol, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCol, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderCol, styles.colDiscount]}>Discount (%)</Text>
            <Text style={[styles.tableHeaderCol, styles.colGST]}>GST (%)</Text>
            <Text style={[styles.tableHeaderCol, styles.colCost]}>Cost</Text>
        </View>

        {/* Table Rows */}
        {order.items?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCol, styles.colEntryNo]}>{item.entryNo}</Text>
                <Text style={[styles.tableCol, styles.colDescription]}>{item.description}</Text>
                <Text style={[styles.tableCol, styles.colClass]}>{item.class}</Text>
                <Text style={[styles.tableCol, styles.colItemCode]}>{item.item?.item_code || 'N/A'}</Text>
                <Text style={[styles.tableCol, styles.colMake]}>{item.make || 'N/A'}</Text>
                <Text style={[styles.tableCol, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCol, styles.colRate]}>{item.rate}</Text>
                <Text style={[styles.tableCol, styles.colDiscount]}>{item.discount}</Text>
                <Text style={[styles.tableCol, styles.colGST]}>{item.taxGST}</Text>
                <Text style={[styles.tableCol, styles.colCost]}>Rs - {item.cost.toFixed(2)}</Text>
            </View>
        ))}
    </View>
</View>

                {/* Totals Section */}
                <View style={styles.section}>
                    <Text style={styles.heading}>Totals</Text>
                    <Text><Text style={styles.label}>Total Cost:</Text> Rs - {order.totalCost?.toFixed(2) || '0.00'}</Text>
                    <Text><Text style={styles.label}>Total GST:</Text> Rs - {order.totalGST?.toFixed(2) || '0.00'}</Text>
                    <Text><Text style={styles.label}>Grand Total:</Text> Rs - {order.grandTotal?.toFixed(2) || '0.00'}</Text>
                </View>
            </Page>
        </Document>
    );
};

PDFDocument.propTypes = {
    order: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        orderNumber: PropTypes.string.isRequired,
        poNumber: PropTypes.string.isRequired,
        categoryType: PropTypes.string,
        categoryCode: PropTypes.string,
        vendor: PropTypes.shape({
            code: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }).isRequired,
        quotationRefNo: PropTypes.string.isRequired,
        quotationDate: PropTypes.string,
        status: PropTypes.string.isRequired,
        createdBy: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({ name: PropTypes.string }),
        ]),
        approvedBy: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({ name: PropTypes.string }),
        ]),
        remark: PropTypes.string,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string,
        notes: PropTypes.string,
        items: PropTypes.arrayOf(
            PropTypes.shape({
                entryNo: PropTypes.number.isRequired,
                description: PropTypes.string.isRequired,
                class: PropTypes.string,
                item: PropTypes.shape({
                    item_code: PropTypes.string,
                }),
                make: PropTypes.string,
                quantity: PropTypes.number.isRequired,
                rate: PropTypes.number.isRequired,
                discount: PropTypes.number,
                taxGST: PropTypes.number,
                cost: PropTypes.number.isRequired,
            })
        ).isRequired,
        totalCost: PropTypes.number,
        totalGST: PropTypes.number,
        grandTotal: PropTypes.number,
    }).isRequired,
};

export default PDFDocument;
