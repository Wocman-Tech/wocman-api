exports.errorResponse = (err, req, res) => {
    logger.error(`${err.code} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.code || 500).json({
        status: false,
        message: err.message,
        code: err.code,
        data: err.data || [],
    });
};