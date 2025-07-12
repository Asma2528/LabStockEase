import PropTypes from "prop-types";

const DashboardCard = ({ title, bgColor, borderColor, children }) => (
  <div className="card w-60 h-56 rounded-md">
    <h2 className="font-bold text-lg p-1">{title}</h2>
    <div className={`${bgColor} text-black ${borderColor} border-2 h-36 rounded-md p-4`}>
      {children}
    </div>
  </div>
);

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  bgColor: PropTypes.string,
  borderColor: PropTypes.string,
  children: PropTypes.node,
};

export default DashboardCard;
