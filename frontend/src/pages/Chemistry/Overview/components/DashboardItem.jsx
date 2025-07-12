import PropTypes from "prop-types";

const DashboardItem = ({ label, value }) => (
  <div className="mb-1">
    <h3 className="m-0">{label}:</h3>
    <p className="m-0 font-semibold">{value}</p>
  </div>
);

DashboardItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DashboardItem;
