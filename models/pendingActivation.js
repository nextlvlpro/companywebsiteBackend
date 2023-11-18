const mongoose = require('mongoose')

    const pendingActivationSchema = new mongoose.Schema({
        // retailerName: String,
        // shopCode: String,
        // target: Number,
        // ach: Number,
    })

const pendingactivations = mongoose.model('pendingactivations', pendingActivationSchema)
module.exports = pendingactivations