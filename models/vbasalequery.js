const mongoose = require('mongoose')

    const vbasaledataSchema = new mongoose.Schema({
        // retailerName: String,
        // shopCode: String,
        // target: Number,
        // ach: Number,
    })

const vbasaledatas = mongoose.model('vbasaledatas', vbasaledataSchema)
module.exports = vbasaledatas