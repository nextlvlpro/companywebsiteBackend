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
//MongoDB connection
mongoose.connect(process.env.DATABASEURL).then(() => { console.log("mongoose is connected") }, err => { console.log("mongoose not connected", err); })

//MidleWare
app.use(express.json());
app.use(cors({
    credentials:true,
    origin: 'https://medplfrontend.onrender.com',
}))

app.use(cookieParser())


///JWTKEY
const jwtKey = process.env.JWTSECUREKEY


//register
app.post('/register', async (req, res) => {
    const alreadyUser = await regUser.findOne({email:req.body.email})
    const isEmployee = await employelists.findOne({useremail:req.body.email})

    if(alreadyUser) {
        return res.status(200).json('user already Exists')
    }
    if(isEmployee) {
        console.log(isEmployee);

        const newUser = await regUser.create({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
            vworkid: isEmployee.vworkid,
            shopCode: isEmployee.shopCode,
            designation: isEmployee.designation,
        })

        return res.json('registration done')
    } else {
        res.json('failed')
    }
    

})  
//Login 
app.post('/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const loginUser = await regUser.findOne({ email })
    
    if (loginUser) {
        if (password == loginUser.password) {
            jwt.sign({email: loginUser.email, objectId:loginUser._id}, jwtKey, {}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token, {sameSite:'none', secure:true}).json(loginUser)
            })
        } else {
            res.json("password incorrect")
        }
    } else if(!loginUser){
        res.json('user Does not exist')
    }
})

//logout 
app.post('/logout', (req, res) => {
    res.cookie('token', '',{sameSite:'none', secure:true}).json(true)
})

//profile validatr
app.get('/profile', (req,res) => {
    const{token} = req.cookies;

    if(token) {
        jwt.verify(token, jwtKey, {}, async (err,userData)=> {
            if(err) throw err;
            const userDoc = await regUser.findOne({email:userData.email})
            console.log(userDoc);
        })
    } else {
        res.json(null)
    }
})


app.post('/salequery', async (req, res) => {
    const shopCode = req.body.shopCode
    if (shopCode) {
      
        const docs = await salesdata.findOne({shopCode: shopCode.toUpperCase()})
        if (docs) {
            res.json(docs)
        } else {
            res.json(null)
        }
    }else{
        res.json(null)
    }
})

app.post('/vbasalequery', async (req,res) => {
    
    const {vbavworkid} = req.body

    console.log(vbavworkid);
    const vbaSales = await vbasaledatas.findOne({vworkid:vbavworkid});

    res.json(vbaSales)
})







app.post('/delete', (req, res) => {
    salesdata.deleteMany({}).then((done) => { res.json("deleted") })
})

app.listen(PORT, () => console.log(`App is listning at ${PORT}`))
