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
const nodemailer = require('nodemailer')
const pendingactivations = require("./models/pendingActivation.js")


//MongoDB connection
mongoose.connect(process.env.DATABASEURL).then(() => { console.log("mongoose is connected") }, err => { console.log("mongoose not connected", err); })

//MidleWare
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}))

app.use(cookieParser())


///JWTKEY
const jwtKey = process.env.JWTSECUREKEY


//register


app.post('/register', async (req, res) => {
    const otpConfirmation = req.body.otpConfirmation
    const otpConfirmed = req.body.otpConfirmed
    const reqOtp = req.body.reqOtp
    const email = req.body.email


    const alreadyUser = await regUser.findOne({ email: req.body.email });
    if (alreadyUser) {
        return res.json('User Already Exists')
    }

    const isEmployee = await employelists.findOne({ useremail: req.body.email });

    if (!isEmployee && otpConfirmed) {
        return res.json('Did you change your email while registering? Start again.')
    }
    //emailverification
    if (!otpConfirmation && !reqOtp && !otpConfirmed) {
        if (isEmployee) {
            return res.json('ok')
        } else {
            return res.json('User is not Registered with MEDPL')
        }
    }
    //req otp
    if (reqOtp && !otpConfirmed) {
        // Node Mailer
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "comedpl@gmail.com",
                pass: "oikk ukuh vcdd vvla",
            },
        });


        const OTP = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000).toString();
        const encryptOTP = bcrypt.hashSync(OTP, bcrypt.genSaltSync(10));

        const info = await transporter.sendMail({
            from: 'MEDPL',
            to: email,
            subject: "OTP",
            html: `<b>Your OTP is : ${OTP}`
        }).then(() => {
            return res.cookie('otp', encryptOTP, { sameSite: 'none', secure: true }).json('done')
        }).catch((err) => {
            
            return res.json(err)
        })
    }

    //otp confirmation
    if (otpConfirmation && !otpConfirmed) {
        const encryptOTP = req.cookies.otp

        const otp = req.body.otp

        if (bcrypt.compareSync(otp, encryptOTP)) {
            return res.json('otp confiremed')
        } else {
            return res.json('wrong otp')
        }
    }

    //otp confiremed, register
    if (otpConfirmed) {
        const newUser = await regUser.create({
            userName: isEmployee.name,
            email: req.body.email,
            password: req.body.password,
            vworkid: isEmployee.vworkid,
            shopCode: isEmployee.shopCode,
            designation: isEmployee.designation,
            subdesignation: isEmployee.subdesignation,
            area: isEmployee.area,
        })

        res.cookie('otp', '', { sameSite: 'none', secure: true }).json('registered')
    }

})
//registration ends here


//Login 
app.post('/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const loginUser = await regUser.findOne({ email })

    if (loginUser) {
        if (password == loginUser.password) {
            jwt.sign({ email: loginUser.email, objectId: loginUser._id }, jwtKey, {}, (err, token) => {
                if (err) throw err;
                
                res.cookie('token', token, { sameSite: 'none', secure: true, expires: new Date(Date.now() + (10*30*24*3600000))}).json(
                    {
                        email: loginUser.email,
                        userName: loginUser.userName,
                        vworkid: loginUser.vworkid,
                        shopCode: loginUser.shopCode,
                        designation: loginUser.designation,
                        subdesignation: loginUser.subdesignation,
                        area: loginUser.area,
                        area: loginUser.area,
                        
                    }
                )
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
    res.cookie('token','', { sameSite: 'none', secure: true }).json(true)
  
    
})

//profile validatr
app.post('/profile', (req, res) => {
    const token = req.body.token
    
    if (token) {

        jwt.verify(token, jwtKey, {}, async (err, userData) => {
            if (err) throw err;

            const userDoc = await regUser.findOne({email:userData.email})
            
            if (userDoc) {
                res.json({
                    email: userDoc.email,
                    userName: userDoc.userName,
                    vworkid: userDoc.vworkid,
                    shopCode: userDoc.shopCode,
                    designation: userDoc.designation,
                    subdesignation: userDoc.subdesignation,
                    area: userDoc.area,
                });
            } else {
                res.json(null)
            }
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

//sale query for office emploayee
//asm area query
app.post('/officetsmareaquery', async (req, res) => {
    const { asmarea } = req.body

    if (asmarea) {
        const tsmareas = await areaList.find({ asmArea: (asmarea).toUpperCase() })
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

app.post('/tsmareavbasalequery', async (req, res) => {
    const tsmArea = req.body

    const vbasales = await vbasaledatas.find({ tsmArea: (tsmArea.tsmarea).toUpperCase() })
    res.json(vbasales)
})



//Pending Activation
app.post('/pendingactivationsshop', async (req, res) => {
    const { area, subdesignation,uploadercode } = req.body
    if(subdesignation == 'asm') {
        const data = await pendingactivations.find({ amarea: area }).sort('tmarea')
        res.json(data)
    }
    if(subdesignation == 'tsm') {
        const data = await pendingactivations.find({ tmarea: area }).sort('shopname')
        res.json(data)
    }
    if(subdesignation == 'vba') {
       
        const data = await pendingactivations.find({uploadercode: uploadercode})
        res.json(data)
    }
    
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
app.post('/deletependingactivation', (req, res) => {
    pendingactivations.deleteMany({}).then((done) => { res.json("deleted") })
})


app.listen(PORT, () => console.log(`App is listning at ${PORT}`))
