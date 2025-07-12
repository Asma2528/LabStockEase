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

const ViewProject = ({ visible, setVisible, project }) => {
    console.log(project);

    const createdByName = typeof project.createdBy === 'object' ? project.createdBy?.name : project.createdBy;

    return (
        <Dialog
            header="View Project"
            position="top"
            visible={visible}
            className="w-full md:w-[70%] lg:w-1/2"
            onHide={() => setVisible(false)}
            draggable={false}
        >
            <div className="w-full">
                {/* Project Code */}
                <div className="mb-3">
                    <label htmlFor="projectCode">Project Code</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={project.projectCode || 'N/A'} disabled />
                </div>

                <div className="mb-3">
                    <label htmlFor="description">Description</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={project.description || 'N/A'} disabled />
                </div>

                {/* Project Date */}
                <div className="mb-3">
                    <label htmlFor="projectDate">Project Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(project.projectDate)} disabled />
                </div>

                {/* Sanction Date */}
                <div className="mb-3">
                    <label htmlFor="sanctionDate">Sanction Date</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={formatDate(project.sanctionDate)} disabled />
                </div>

                {/* Project Period */}
                <div className="mb-3">
                    <label htmlFor="projectPeriod">Project Period</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={project.projectPeriod || 'N/A'} disabled />
                </div>

                {/* Funding Agency */}
                <div className="mb-3">
                    <label htmlFor="fundingAgency">Funding Agency</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={project.fundingAgency || 'N/A'} disabled />
                </div>

                {/* Project Cost */}
                <div className="mb-3">
                    <label htmlFor="projectCost">Project Cost</label>
                    <input
                        type="text"
                        className="w-full px-5 py-2 rounded-md border"
                        value={typeof project.projectCost === 'number' ? project.projectCost.toFixed(2) : 'N/A'}
                        disabled
                    />
                </div>

                {/* Fund Status */}
                <div className="mb-3">
                    <label htmlFor="fundStatus">Fund Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={project.fundStatus || 'N/A'} disabled />
                </div>

                {/* Project In-Charge */}
                <div className="mb-3">
                    <label htmlFor="projectInCharge">Project In-Charge</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={project.projectInCharge || 'N/A'} disabled />
                </div>

                {/* Created By */}
                <div className="mb-3">
                    <label htmlFor="createdBy">Created By</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={createdByName || 'N/A'} disabled />
                </div>

                {/* Project Status */}
                <div className="mb-3">
                    <label htmlFor="projectStatus">Project Status</label>
                    <input type="text" className="w-full px-5 py-2 rounded-md border" value={project.projectStatus || 'N/A'} disabled />
                </div>

                {/* Project Procurements */}
                <div className="mb-3">
                    <label>Project Procurements:</label>
                    <p className="text-base"> Order Numbers - </p>
                    {Array.isArray(project.projectProcurements) && project.projectProcurements.length > 0 ? (
                        project.projectProcurements.map((procurement, index) => (
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
ViewProject.propTypes = {
    visible: PropTypes.bool.isRequired,
    setVisible: PropTypes.func.isRequired,
    project: PropTypes.shape({
        projectCode: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        projectDate: PropTypes.string.isRequired,
        sanctionDate: PropTypes.string.isRequired,
        projectPeriod: PropTypes.string.isRequired,
        fundingAgency: PropTypes.string.isRequired,
        projectCost: PropTypes.number,
        fundStatus: PropTypes.string.isRequired,
        projectInCharge: PropTypes.string.isRequired,
        projectStatus: PropTypes.string.isRequired,
        projectProcurements: PropTypes.arrayOf(PropTypes.string),
        createdBy: PropTypes.shape({
            name: PropTypes.string,
        }),
    }),
};

export default ViewProject;
