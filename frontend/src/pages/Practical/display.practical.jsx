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

const ViewPractical = ({ visible, setVisible, practical }) => {
    console.log(practical);

    const createdByName = typeof practical.createdBy === 'object' ? practical.createdBy?.name : practical.createdBy;

    return (
        <Dialog
            header="View Practical"
            position="top"
            visible={visible}
            className="w-full md:w-[70%] lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full">
                {/* Practical Code */}
                <div className="mb-3">
                    <label htmlFor="practicalCode">Practical Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={practical.practicalCode || 'N/A'} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="description">Description</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={practical.description || 'N/A'} disabled />
                </div>


                {/* Practical Date */}
                <div className="mb-3">
                    <label htmlFor="practicalDate">Practical Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(practical.practicalDate)} disabled />
                </div>

                {/* Sanction Date */}
                <div className="mb-3">
                    <label htmlFor="sanctionDate">Sanction Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(practical.sanctionDate)} disabled />
                </div>

                {/* Practical Period */}
                <div className="mb-3">
                    <label htmlFor="practicalPeriod">Practical Period</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={practical.practicalPeriod || 'N/A'} disabled />
                </div>

                {/* Funding Agency */}
                <div className="mb-3">
                    <label htmlFor="fundingAgency">Funding Agency</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={practical.fundingAgency || 'N/A'} disabled />
                </div>

                {/* Practical Cost */}
                <div className="mb-3">
                    <label htmlFor="practicalCost">Practical Cost</label>
                    <input
                        type="text"
                        className="w-full px-5 py-2 rounded-md border"
                        value={typeof practical.practicalCost === 'number' ? practical.practicalCost.toFixed(2) : 'N/A'}
                        disabled
                    />
                </div>

                {/* Fund Status */}
                <div className="mb-3">
                    <label htmlFor="fundStatus">Fund Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={practical.fundStatus || 'N/A'} disabled />
                </div>

                {/* Practical In-Charge */}
                <div className="mb-3">
                    <label htmlFor="practicalInCharge">Practical In-Charge</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={practical.practicalInCharge || 'N/A'} disabled />
                </div>

                {/* Created By */}
                <div className="mb-3">
                    <label htmlFor="createdBy">Created By</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={createdByName || 'N/A'} disabled />
                </div>

                {/* Practical Status */}
                <div className="mb-3">
                    <label htmlFor="practicalStatus">Practical Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={practical.practicalStatus || 'N/A'} disabled />
                </div>

                {/* Practical Procurements */}
                <div className="mb-3">
                    <label>Practical Procurements:</label>
                    <p className="text-base"> Order Numbers - </p>
                    {Array.isArray(practical.practicalProcurements) && practical.practicalProcurements.length > 0 ? (
                        practical.practicalProcurements.map((procurement, index) => (
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
ViewPractical.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    practical: PropTypes.shape({
        practicalCode: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        practicalDate: PropTypes.string.isRequired,
        sanctionDate: PropTypes.string.isRequired,
        practicalPeriod: PropTypes.string.isRequired,
        fundingAgency: PropTypes.string.isRequired,
        practicalCost: PropTypes.number,
        fundStatus: PropTypes.string.isRequired,
        practicalInCharge: PropTypes.string.isRequired,
        practicalStatus: PropTypes.string.isRequired,
        practicalProcurements: PropTypes.arrayOf(PropTypes.string),
        createdBy: PropTypes.shape({
            name: PropTypes.string,
        }),
    }),
};

export default ViewPractical;
