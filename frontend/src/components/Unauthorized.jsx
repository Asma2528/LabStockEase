const Unauthorized = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-2">403 - Forbidden</h1>
            <p className="text-lg">You do not have permission to view this page!</p>
        </div>
    );
};

export default Unauthorized;
