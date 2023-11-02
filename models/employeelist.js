const mongoose = require('mongoose')

const employeelistSchema = new mongoose.Schema({
    name:String,
    useremail:String,
    vworkid:String,
    phonenumber:String,
    designation:String,
    subdesignation:String,
    shopCode:String,
    area:String,
})

const employelists = mongoose.model('employelists', employeelistSchema)

module.exports = employelists