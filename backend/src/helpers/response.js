class ResponseHandler {
    static success(res, data = {}, statusCode = 200, message = 'Success') {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    static error(res, error, statusCode = 400) {
        const message = error?.message || 'An unknown error occurred';
        const code = error?.statusCode || statusCode;

        return res.status(code).json({
            success: false,
            error: {
                message,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
            },
        });
    }
}

module.exports = ResponseHandler;
