const mongoose = require('mongoose')

const regModel = new mongoose.Schema({
    userName:String,
    email:String,
    password:String,
    vworkid:String,
    shopCode:String,
    designation:String,
})

const regUser = mongoose.model('regUser', regModel)

module.exports = regUser