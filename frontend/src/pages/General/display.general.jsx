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

const ViewGeneral = ({ visible, setVisible, general }) => {
    console.log(general);

    const createdByName = typeof general.createdBy === 'object' ? general.createdBy?.name : general.createdBy;

    return (
        <Dialog
            header="View General"
            position="top"
            visible={visible}
            className="w-full md:w-[70%] lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full">
                {/* General Code */}
                <div className="mb-3">
                    <label htmlFor="generalCode">General Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={general.generalCode || 'N/A'} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="description">Description</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={general.description || 'N/A'} disabled />
                </div>


                {/* General Date */}
                <div className="mb-3">
                    <label htmlFor="generalDate">General Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(general.generalDate)} disabled />
                </div>

                {/* Sanction Date */}
                <div className="mb-3">
                    <label htmlFor="sanctionDate">Sanction Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(general.sanctionDate)} disabled />
                </div>

                {/* General Period */}
                <div className="mb-3">
                    <label htmlFor="generalPeriod">General Period</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={general.generalPeriod || 'N/A'} disabled />
                </div>

                {/* Funding Agency */}
                <div className="mb-3">
                    <label htmlFor="fundingAgency">Funding Agency</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={general.fundingAgency || 'N/A'} disabled />
                </div>

                {/* General Cost */}
                <div className="mb-3">
                    <label htmlFor="generalCost">General Cost</label>
                    <input
                        type="text"
                        className="w-full px-5 py-2 rounded-md border"
                        value={typeof general.generalCost === 'number' ? general.generalCost.toFixed(2) : 'N/A'}
                        disabled
                    />
                </div>

                {/* Fund Status */}
                <div className="mb-3">
                    <label htmlFor="fundStatus">Fund Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={general.fundStatus || 'N/A'} disabled />
                </div>

                {/* General In-Charge */}
                <div className="mb-3">
                    <label htmlFor="generalInCharge">General In-Charge</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={general.generalInCharge || 'N/A'} disabled />
                </div>

                {/* Created By */}
                <div className="mb-3">
                    <label htmlFor="createdBy">Created By</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={createdByName || 'N/A'} disabled />
                </div>

                {/* General Status */}
                <div className="mb-3">
                    <label htmlFor="generalStatus">General Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={general.generalStatus || 'N/A'} disabled />
                </div>

                {/* General Procurements */}
                <div className="mb-3">
                    <label>General Procurements:</label>
                    <p className="text-base"> Order Numbers - </p>
                    {Array.isArray(general.generalProcurements) && general.generalProcurements.length > 0 ? (
                        general.generalProcurements.map((procurement, index) => (
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
ViewGeneral.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    general: PropTypes.shape({
        generalCode: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        generalDate: PropTypes.string.isRequired,
        sanctionDate: PropTypes.string.isRequired,
        generalPeriod: PropTypes.string.isRequired,
        fundingAgency: PropTypes.string.isRequired,
        generalCost: PropTypes.number,
        fundStatus: PropTypes.string.isRequired,
        generalInCharge: PropTypes.string.isRequired,
        generalStatus: PropTypes.string.isRequired,
        generalProcurements: PropTypes.arrayOf(PropTypes.string),
        createdBy: PropTypes.shape({
            name: PropTypes.string,
        }),
    }),
};

export default ViewGeneral;
