const handleHttpError = (res, message = 'Algo Sucedio', code = 500) => {
    res.status(code).json({
        ok: false,
        error: message
    });
}

module.exports = { handleHttpError }