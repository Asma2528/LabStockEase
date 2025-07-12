// This file is for handling asynchronous error 


const CatchAsync = (func) => (req, res, next) => {
    return Promise.resolve(func(req, res, next)).catch((err) => {
        // Detailed error logging
        console.error("An error occurred:");
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("Request method:", req.method);
        console.error("Request URL:", req.originalUrl);
        console.error("Request headers:", req.headers);
        console.error("Request body:", req.body);
        
        // Pass the error to the next middleware
        next(err);
    });
};

module.exports = CatchAsync;