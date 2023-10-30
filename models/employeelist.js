const mongoose = require('mongoose')

const employeelistSchema = new mongoose.Schema({
    name:String,
    useremail:String,
    vworkid:String,
    phonenumber:String,
    designation:String,
    shopCode:String,
})

const employelists = mongoose.model('employelists', employeelistSchema)

module.exports = employelists