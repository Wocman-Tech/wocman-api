exports.errorResponse = (err, req, res) => {
    logger.error(`${err.code} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.statusCode || 500).json({
        status: false,
        message: err.message,
        statusCode: err.statusCode,
        data: err.data || [],
    });
};