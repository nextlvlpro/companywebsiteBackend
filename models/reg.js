const mongoose = require('mongoose')

const regModel = new mongoose.Schema({
    userName:String,
    email:String,
    password:String,
    shopCode:String,
})

const regUser = mongoose.model('regUser', regModel)

module.exports = regUser