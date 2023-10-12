const mongoose = require('mongoose')

    const saleModel = new mongoose.Schema({
        // retailerName: String,
        // shopCode: String,
        // target: Number,
        // ach: Number,
    })

const salesdata = mongoose.model('salesdata', saleModel)
module.exports = salesdata