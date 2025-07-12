import { Dialog } from 'primereact/dialog';
import PropTypes from 'prop-types';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const ViewOther = ({ visible, setVisible, other }) => {
    console.log(other);

    const createdByName = typeof other.createdBy === 'object' ? other.createdBy?.name : other.createdBy;

    return (
        <Dialog
            header="View Other"
            position="top"
            visible={visible}
            className="w-full md:w-[70%] lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full">
                {/* Other Code */}
                <div className="mb-3">
                    <label htmlFor="otherCode">Other Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={other.otherCode || 'N/A'} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="description">Description</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={other.description || 'N/A'} disabled />
                </div>


                {/* Other Date */}
                <div className="mb-3">
                    <label htmlFor="otherDate">Other Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(other.otherDate)} disabled />
                </div>

                {/* Sanction Date */}
                <div className="mb-3">
                    <label htmlFor="sanctionDate">Sanction Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(other.sanctionDate)} disabled />
                </div>

                {/* Other Period */}
                <div className="mb-3">
                    <label htmlFor="otherPeriod">Other Period</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={other.otherPeriod || 'N/A'} disabled />
                </div>

                {/* Funding Agency */}
                <div className="mb-3">
                    <label htmlFor="fundingAgency">Funding Agency</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={other.fundingAgency || 'N/A'} disabled />
                </div>

                {/* Other Cost */}
                <div className="mb-3">
                    <label htmlFor="otherCost">Other Cost</label>
                    <input
                        type="text"
                        className="w-full px-5 py-2 rounded-md border"
                        value={typeof other.otherCost === 'number' ? other.otherCost.toFixed(2) : 'N/A'}
                        disabled
                    />
                </div>

                {/* Fund Status */}
                <div className="mb-3">
                    <label htmlFor="fundStatus">Fund Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={other.fundStatus || 'N/A'} disabled />
                </div>

                {/* Other In-Charge */}
                <div className="mb-3">
                    <label htmlFor="otherInCharge">Other In-Charge</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={other.otherInCharge || 'N/A'} disabled />
                </div>

                {/* Created By */}
                <div className="mb-3">
                    <label htmlFor="createdBy">Created By</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={createdByName || 'N/A'} disabled />
                </div>

                {/* Other Status */}
                <div className="mb-3">
                    <label htmlFor="otherStatus">Other Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={other.otherStatus || 'N/A'} disabled />
                </div>

                {/* Other Procurements */}
                <div className="mb-3">
                    <label>Other Procurements:</label>
                    <p className="text-base"> Order Numbers - </p>
                    {Array.isArray(other.otherProcurements) && other.otherProcurements.length > 0 ? (
                        other.otherProcurements.map((procurement, index) => (
                            <div key={index} className="border p-2 rounded-md">
                                <p>{procurement || '-'}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No procurements available</p>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

// PropTypes validation
ViewOther.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    other: PropTypes.shape({
        otherCode: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        otherDate: PropTypes.string.isRequired,
        sanctionDate: PropTypes.string.isRequired,
        otherPeriod: PropTypes.string.isRequired,
        fundingAgency: PropTypes.string.isRequired,
        otherCost: PropTypes.number,
        fundStatus: PropTypes.string.isRequired,
        otherInCharge: PropTypes.string.isRequired,
        otherStatus: PropTypes.string.isRequired,
        otherProcurements: PropTypes.arrayOf(PropTypes.string),
        createdBy: PropTypes.shape({
            name: PropTypes.string,
        }),
    }),
};

export default ViewOther;
