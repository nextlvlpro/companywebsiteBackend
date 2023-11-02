const PORT = 4000
const express = require("express")
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cors = require('cors')
require('dotenv').config();
const salesdata = require("./models/salesmodel.js")
const regUser = require("./models/reg.js")
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const employelists = require("./models/employeelist.js")
const vbasaledatas = require("./models/vbasalequery.js")
const areaList = require("./models/areas.js")
//MongoDB connection
mongoose.connect(process.env.DATABASEURL).then(() => { console.log("mongoose is connected") }, err => { console.log("mongoose not connected", err); })

//MidleWare
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'https://medplfrontend.onrender.com',
}))

app.use(cookieParser())


///JWTKEY
const jwtKey = process.env.JWTSECUREKEY


//register
app.post('/register', async (req, res) => {
    
    const alreadyUser = await regUser.findOne({ email: req.body.email });
    const isEmployee = await employelists.findOne({ useremail: req.body.email });


    if (alreadyUser) {
        return res.status(200).json('user already Exists')
    }
    if (isEmployee) {

        const newUser = await regUser.create({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
            vworkid: isEmployee.vworkid,
            shopCode: isEmployee.shopCode,
            designation: isEmployee.designation,
            subdesignation: isEmployee.subdesignation,
            area: isEmployee.area,
        })
        return res.json('registration done')

    } else {
        res.json('This Email is not registerd with company')
    }


})
//Login 
app.post('/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const loginUser = await regUser.findOne({ email })

    if (loginUser) {
        if (password == loginUser.password) {
            jwt.sign({ email: loginUser.email, objectId: loginUser._id }, jwtKey, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { sameSite: 'none', secure: true,maxAge:'900000000'  }).json(loginUser)
            })
        } else {
            res.json("password incorrect")
        }
    } else if (!loginUser) {
        res.json('user Does not exist')
    }
})

//logout 
app.post('/logout', (req, res) => {
    res.cookie('token', '', { sameSite: 'none', secure: true }).json(true)
})

//profile validatr
app.get('/profile', (req, res) => {
    const { token } = req.cookies;

    if (token) {
        jwt.verify(token, jwtKey, {}, async (err, userData) => {
            if (err) throw err;
            const userDoc = await regUser.findOne({ email: userData.email })
            res.json(userDoc);
        })
    } else {
        res.json(null)
    }
})

//Shopecode query
app.post('/salequery', async (req, res) => {
    const shopCode = req.body.shopCode
    if (shopCode) {

        const docs = await salesdata.findOne({ shopCode: shopCode.toUpperCase() })
        if (docs) {
            res.json(docs)
        } else {
            res.json(null)
        }
    } else {
        res.json(null)
    }
})

//VBA Sale Query
app.post('/vbasalequery', async (req, res) => {

    const { vbavworkid } = req.body

    const vbaSales = await vbasaledatas.findOne({ vworkid: vbavworkid });

    res.json(vbaSales)
})

//ASM Sale Query
app.post('/asmareaquery', async (req, res) => {
    const vworkid = req.body

    const data = await employelists.findOne(vworkid)

    if (data.designation == 'saleteam') {
        if (data.subdesignation == 'asm') {
            const tsmareas = await areaList.find({ asmArea: (data.area).toUpperCase() })
            res.json(tsmareas);
        }
    } else {
        res.json('failed')
    }
})

app.post('/officetsmareaquery', async (req,res) => {
    const {asmarea} = req.body
    
    if(asmarea) {
        const tsmareas = await areaList.find({asmArea:(asmarea).toUpperCase()})
        return res.json(tsmareas)
    } else {
        res.json('notfound')
    }
})

app.post('/tsmsalequery', async (req, res) => {
    let tsmArea = req.body;
    if (tsmArea) {
        const shopsaledata = await salesdata.find({ tmArea: tsmArea.tsmarea });
        return res.json(shopsaledata);
    }
})

app.post('/tsmareavbasalequery',async (req,res) => {
    const tsmArea = req.body
    
    const vbasales = await vbasaledatas.find({tsmArea:(tsmArea.tsmarea).toUpperCase()})
    res.json(vbasales)
})





app.post('/delete', (req, res) => {
    salesdata.deleteMany({}).then((done) => { res.json("deleted") })
})

app.post('/deleteemplyeeinfo', (req, res) => {
    employelists.deleteMany({}).then((done) => { res.json("deleted") })
})

app.post('/deletevbasales', (req, res) => {
    vbasaledatas.deleteMany({}).then((done) => { res.json("deleted") })
})
app.listen(PORT, () => console.log(`App is listning at ${PORT}`))
