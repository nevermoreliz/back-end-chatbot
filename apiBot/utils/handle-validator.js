const { validationResult } = require('express-validator')

const validateResult = (req, res, next) => {
    try {
        validationResult(req).throw()
        return next()
    } catch (error) {
        // res.status(403)
        // res.send({ error: error.array() })

        res.status(400).json({
            ok: false,
            errors: error.mapped()
        })

    }
}

module.exports = validateResult