const mongoose = require('mongoose')

const areaSchema = new mongoose.Schema({
    amArea:String,
    tsmArea:String
})

const areaList = mongoose.model('areaList', areaSchema)

module.exports = areaList