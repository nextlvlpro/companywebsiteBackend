const mongoose = require('mongoose')

    const pendingPunchSchema = new mongoose.Schema({
        // retailerName: String,
        // shopCode: String,
        // target: Number,
        // ach: Number,
    })

const pendingpunchs = mongoose.model('pendingpunchs', pendingPunchSchema)
module.exports = pendingpunchs