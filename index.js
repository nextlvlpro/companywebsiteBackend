const PORT = process.env.PORT || 4257
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
    if(alreadyUser) {
        res.status(200).json('user already Exists')
    } else {
        const newUser = await regUser.create({
            userName: req.body.userName,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)) ,
            shopCode: req.body.shopCode,
        })
        res.status(200).json("registration done")
    }
    
})

//Login 
app.post('/login', async (req, res) => {
    email = req.body.email
    password = req.body.password
    const loginUser = await regUser.findOne({ email })
    
    if (loginUser) {
        const passCompare = bcrypt.compareSync(password, loginUser.password)
        if (passCompare) {
            jwt.sign({emai: loginUser.email, objectId:loginUser._id}, jwtKey, {}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json(loginUser)
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
    res.cookie('token', '').json(true)
})

//profile validatr
app.get('/profile', (req,res) => {
    const{token} = req.cookies;
    if(token) {
        jwt.verify(token, jwtKey, {}, async (err,userData)=> {
            if(err) throw err;
            const userDoc = await regUser.findOne(userData.email)
            res.json(userDoc)
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
    }

})

app.post('/delete', (req, res) => {
    salesdata.deleteMany({}).then((done) => { res.json("deleted") })
})

app.listen(PORT, () => console.log(`App is listning at ${PORT}`))
