const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { render } = require('ejs')

require('dotenv').config()

const app = express()

db_username = 'root'
db_host = 'localhost'
db_password = ''
db_name = 'software'

db = mysql.createConnection({
    host: db_host,
    user: db_username,
    password: db_password,
    database: db_name
});

db.connect((err)=>{
    if(err)
    throw err
    console.log("DB CONNECTION SUUCESSFUL")
})

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use('/assets', express.static('assets'));
app.use(cookieParser())
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret:'secret'
}))

var auth = function(req,res,next){
    if(req.session && req.session.user){
        return next()
    }
    else{
        return res.sendStatus(401)
    }
}

var auth1 = function(req,res,next){
    if(req.session && req.session.admin){
        return next()
    }
    else{
        return res.sendStatus(401)
    }
}
//LANDING PAGE --------------------------------------------------------------------------------------
app.get('/',(req,res)=>{
    if(req.session.user){
        res.render('landingpage',{user: 'Welcome, '+req.session.user,logout:true})
    }
    else{
        res.render('landingpage',{user:'',logout:false})
    }
})
//LOGIN STUDENT -------------------------------------------------------------------------------------------------
app.get('/login',(req,res)=>{
    res.render('login',{message:''})
})

//UPDATE STUDENT ----------------------------------------------------------------------------------------------------
app.get('/update',async(req,res)=>{
    let roll = req.session.rollno
    let class1 = req.session.class
    let users = await getDetails(roll,class1)
    console.log(users)
    res.render('updatestudentprofile',{Name: users[0].Name, Roll: users[0].Roll, Class: users[0].Class, Email: users[0].Email, Phone: users[0].Phone_Number, Address: users[0].Address, BloodG: users[0].Blood_Group, Gender: users[0].Gender, Dob: users[0].DATE,message:""})
})
  
//PROFILE PAGE STUDENT ----------------------------------------------------------------------------------

function getDetails(roll,class1){
    let sql = `SELECT Roll,Name,Class,Email,Phone_Number,Address,Blood_Group,Gender,DATE_FORMAT(DOB,"%Y-%m-%d") DATE from student1 where Roll=? and Class= ?`
    var p = [roll,class1]
    return new Promise((resolve, reject) => {
        db.query(sql,[roll,class1],(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}


app.get('/profile',auth,async(req,res)=>{
    let roll = req.session.rollno
    let class1 = req.session.class
    console.log(roll)
    console.log(class1)
    let users = await getDetails(roll,class1)
    console.log(users)
    res.render('studentprofile',{Name: users[0].Name, Roll: users[0].Roll, Class: users[0].Class, Email: users[0].Email, Phone: users[0].Phone_Number, Address: users[0].Address, BloodG: users[0].Blood_Group, Gender: users[0].Gender, Dob: users[0].DATE})
})

//LOGOUT STUDENT ------------------------------------------------------------------------------
app.get('/logout',function(req,res){
    req.session.destroy()
    res.render('login',{message:"Logged Out",logout:false})
})

//FORGOT PASSWORD STUDENT -----------------------------------------------------------------
app.get('/forgotpassword',(req,res)=>{
    res.render('fotgotpassword',{message: ''})
})

// REQUEST DETAILS UPDATE BY STUDENT ---------------------------------------------------------------------
app.post('/updating',(req,res)=>{
    res.render('updatestudentprofile',{Name: '', Roll: '', Class: '', Email: '', Phone: '', Address: '', BloodG: '', Gender: '', Dob: '', message: "Request Send to admin"})
})
//---------------------------------------------------------------------------------------------
function fpdata(rollno,class1){
    let sql = `SELECT Name, Roll, Password, Class, Securecode from student_info where Roll=? and Class= ?`
    var p = [rollno,class1]
    return new Promise((resolve, reject) => {
        db.query(sql,p,(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}
//RESETING PASSWORD STUDENT -----------------------------------------------------------------------------
function reseting(newpass,rollno,class1){
    let sql = `UPDATE student_info SET Password = ? WHERE Roll=? AND Class=?`
    let p=[newpass,rollno,class1]
    db.query(sql,p,(err, rows, fields) => {
        if (err) {
            //console.log(rows)
            throw err
        }
    })
}

app.post('/resetpassword',async(req,res)=>{
    let rollno = parseInt(req.body.roll)
    let class1 = parseInt(req.body.class)
    let secure = req.body.securecode
    let newpass = req.body.password
    let cnewpass = req.body.confirmpassword
    let users = await fpdata(rollno,class1)
    //console.log(users)
    if(users.length>0){
            if(secure === users[0].Securecode){
                if(newpass === cnewpass){
                    reseting(newpass,rollno,class1)
                    res.render('login',{message: 'Password reset Successful'})
                }
                else{
                    res.render('fotgotpassword',{message: 'Passwords did not match'})
                }
            }
            else{
                res.render('fotgotpassword',{message: 'Wrong Secure Code'})
            }
    }
    else{
        res.render('fotgotpassword',{message: 'No such user'})
    }
})

//STUDENT LOGIN AUTHENTICATION -----------------------------------------------------------------------------

function userData(class1,roll){
    let sql = `SELECT Name, Roll, Password, Class,Email from student_info where Roll=? and Class= ?`
    var p = [roll,class1]
    return new Promise((resolve, reject) => {
        db.query(sql,p,(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}

app.post('/loginstudent',async(req,res)=>{
    let class1 = parseInt(req.body.class)
    let password = req.body.pass
    let roll = parseInt(req.body.rollno)
    let users = await userData(class1,roll)
    //console.log(users)
    if(users.length>0){
        if(!password || !class1 || !roll){
            res.send('Login Failed')
        }
        else{
                if(class1===users[0].Class && password===users[0].Password && roll===users[0].Roll){
                    req.session.user = users[0].Name
                    req.session.class = users[0].Class
                    req.session.rollno = users[0].Roll
                    req.session.email = users[0].Email
                    res.redirect('/')
                }
                else{
                    res.render('login',{message: "Invalid Credentials"})
                }
                   
            }
    } else{
        res.render('login',{message: "No such user"})
    }

})
//ADMIN LOGIN PAGE --------------------------------------------------------------------------------------
function userAdmin(email){
    let sql = `SELECT * from admin where Email=?`
    var p = [email]
    return new Promise((resolve, reject) => {
        db.query(sql,p,(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}

app.post('/loginadmin',async(req,res)=>{
    let email1 = req.body.email
    let password = req.body.pass
    let users = await userAdmin(email1)
    //console.log(users)
    if(users.length>0){
        if(!password || !email1){
            res.send('Login Failed')
        }
        else{
                if(email1===users[0].Email && password===users[0].Password){
                    req.session.user = users[0].Name
                    req.session.adminid = users[0].Admin_id
                    res.redirect('/adminportal')
                }
                else{
                    res.render('adminlogin',{message: "Invalid Credentials"})
                }
                   
            }
    } else{
        res.render('adminlogin',{message: "No such user"})
    }

})
app.get('/adminlogin',(req,res)=>{
    res.render('adminlogin',{message:""})
})

//ADMIN PORTAL--------------------------------------------------------------------------------

app.get('/adminportal',(req,res)=>{
    if(req.session.user){
        res.render('adminportal',{user: 'Welcome, '+req.session.user,logout:true})
    }
    else{
        res.render('adminportal',{user:'',logout:false})
    }
})

//FORGOT PASSWORD FOR ADMIN  AND RESETING----------------------------------------------------------------------------------------------------
app.get('/forgotpasswordadmin',(req,res)=>{
    res.render('forgotpasswordadmin',{message: ''})
})

function reseting1(newpass,email1){
    let sql = `UPDATE admin SET Password = ? WHERE Email=?`
    let p=[newpass,email1]
    db.query(sql,p,(err, rows, fields) => {
        if (err) {
            //console.log(rows)
            throw err
        }
    })
}

app.post('/resetpasswordadmin',async(req,res)=>{
    let email1 = req.body.email
    let secure = req.body.securecode
    let newpass = req.body.password
    let cnewpass = req.body.confirmpassword
    let users = await fpdata1(email1)
    //console.log(users)
    if(users.length>0){
            if(secure === users[0].Securecode){
                if(newpass === cnewpass){
                    reseting1(newpass,email1)
                    res.render('adminlogin',{message: 'Password reset Successful'})
                }
                else{
                    res.render('fotgotpasswordadmin',{message: 'Passwords did not match'})
                }
            }
            else{
                res.render('fotgotpasswordadmin',{message: 'Wrong Secure Code'})
            }
    }
    else{
        res.render('fotgotpasswordadmin',{message: 'No such user'})
    }
})

function fpdata1(email1){
    let sql = `SELECT * from admin where Email=?`
    var p = [email1]
    return new Promise((resolve, reject) => {
        db.query(sql,p,(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}

//ADMIN PROFILE PAGE-----------------------------------------------------------------------------------------

function getDetails1(adminid){
    let sql = `SELECT * from admin where Admin_id=?`
    var p = [adminid]
    return new Promise((resolve, reject) => {
        db.query(sql,p,(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}


app.get('/adminprofile',async(req,res)=>{
    let adminid = req.session.adminid
    let users = await getDetails1(adminid)
    //console.log(adminid)
    res.render('adminprofile',{Name: users[0].Name, Email: users[0].Email, Adminid: users[0].Admin_id,Phone: users[0].Phone_Number, Address: users[0].Address, Gender: users[0].Gender})
})

//ADMIN LOGOUT-------------------------------------------------------------------------------

app.get('/adminlogout',function(req,res){
    req.session.destroy()
    res.render('adminlogin',{message:"Logged Out",logout:false})
})

//ADMIN UPDATE DETAILS----------------------------------------------------------------------

app.get('/adminupdate',async(req,res)=>{
    let adminid = req.session.adminid
    let users = await getDetails1(adminid)
    //console.log(users)
    res.render('adminupdateprofile',{Name : users[0].Name, Email: users[0].Email, Adminid: users[0].Admin_id, Phone: users[0].Phone_Number, Gender: users[0].Gender, Address: users[0].Address,message:""})
})

app.post('/updatingadmin',(req,res)=>{
    let adminid = req.body.adminid
    let name = req.body.name
    let ph = req.body.phonenumber
    let addr = req.body.address
    let gen = req.body.gender
    let sql = `UPDATE admin SET Name=?, Phone_Number=?, Address=?, Gender=? WHERE Admin_id=?`

    let p = [name,ph,addr,gen,adminid]

    db.query(sql,p,(err, rows, fields) => {
        if (err) {
            //console.log(rows)
            throw err
        }
    })
    //console.log(users)
    res.redirect('/adminprofile')
    //res.render('adminupdateprofile',{Name : users[0].Name, Email: users[0].Email, Adminid: users[0].Admin_id, Phone: users[0].Phone_Number, Gender: users[0].Gender, Address:users[0].Address,message:"Details Updated"})
})


//ADDING NEW STUDENT--------------------------------------------------------------------------------

app.get('/addstudentinfo',(req,res)=>{
    res.render('addstudentbio')
})

app.post('/addbiostudent',async(req,res)=>{
    let rollno = parseInt(req.body.roll)
    let class1 = parseInt(req.body.class)
    let email1 = req.body.email
    let sc = req.body.securecode
    let password = req.body.pass
    let name1 = req.body.name
    let phone = req.body.phonenumber
    let adr = req.body.address
    let bg = req.body.bloodgroup
    let dob = req.body.date
    let gen = req.body.gender
    let sql = `INSERT INTO student_info (Roll, Class, Email, Securecode, Password, Name) VALUES (?)`
    let p = [rollno,class1,email1,sc,password,name1]
    db.query(sql,[p],(err, result)=>{
        if(!err || result.affectedRows>0)
        console.log("1 row inserted")
        else
        console.log("err")
       
    })
    let sql1 = `INSERT INTO student1 (Roll, Class, Email, Name, Phone_Number, Address, Blood_Group, Gender, DOB) VALUES (?)`
    let p1 = [rollno,class1,email1,name1,phone,adr,bg,gen,dob]
    db.query(sql1,[p1],(err, result)=>{
        if(!err || result.affectedRows>0)
        console.log("1 row inserted")
        else
        console.log("err")
       
    })
    res.redirect('/adminportal')
})

//SEARCH------------------------------------------------------------------------------
app.get('/search',(req,res)=>{
    res.render('searchstudent1',{result:''})
})

app.get('/search1',(req,res)=>{
    res.render('searchstudent2',{result:''})
})

app.get('/search2',(req,res)=>{
    res.render('searchstudent3',{result:''})
})

app.post('/searchstudent3',async(req,res)=>{
    let filter1 = req.body.filter
    let searched1 = req.body.search
    let result = await getSearched(filter1,searched1)
    console.log(result)
    res.render('searchstudent3',{result: result})
})

app.post('/searchstudent2',async(req,res)=>{
    let filter1 = req.body.filter
    let searched1 = req.body.search
    let result = await getSearched(filter1,searched1)
    console.log(result)
    res.render('searchstudent2',{result: result})
})

//SEARCH -----------------------------------------------------------------------------------------------------------------D
app.post('/searchstudent1',async(req,res)=>{
    let filter1 = req.body.filter
    let searched1 = req.body.search
    let result = await getSearched(filter1,searched1)
    console.log(result)
    res.render('searchstudent1',{result: result})
})

function getSearched(filter1,searched1){
    let sql = `SELECT * from student1 WHERE Roll=?`
    return new Promise((resolve, reject) => {
        db.query(sql,[searched1],(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}

function getSearch(searched){
    let sql = `SELECT ROLL, Name, Class FROM student1 where ROLL=?`
    let p =[searched]
    return new Promise((resolve, reject) => {
        db.query(sql,p,(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}

//PAYMENT OF FEES--------------------------------------------------------------------------------------------

app.get('/payfees',async(req,res)=>{
    let roll = parseInt(req.session.rollno)
    let email1 = req.session.email
    let class1 = parseInt(req.session.class)
    //console.log(email1)
    let users = await getFeeDetails(roll,email1,class1)
    console.log(users)
    if(users[0].Payment === 'NOT PAID')
        res.render('payfees',{Name: users[0].Name,Roll: users[0].Roll, Email:users[0].Email,Phone: users[0].Phone_Number,Gender: users[0].Gender, Dob: users[0].DOB, Fee: users[0].Fees,Class: users[0].Class, message:'NOT PAID'})
    else
        res.render('payfees',{Name: '',Roll: '', Email: '',Phone: '',Gender: '', Dob: '', Fee: '', Class: '', message:'PAID'}) 
})

function getFeeDetails(roll,email1,class1){
    let sql = "SELECT s.Roll, s.Name, s.Class, s.Email, s.Phone_Number, s.Gender, s.Payment, s.DOB, f.Fees FROM student1 s INNER JOIN feedetails f ON f.Class=s.Class WHERE s.Roll=? and s.Class=?"
    
    return new Promise((resolve, reject) => {
        db.query(sql,[roll,class1],(err, rows, fields) => {
            if (!err) {
                //console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}
function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
  }
app.post('/paymentdetails',(req,res)=>{
    let t = between(1, 9999999999999999999)
    //req.user.tid= t
    let rollno = parseInt(req.body.roll)
    let fee = req.body.Fees
    let class1 =  parseInt(req.body.class)
    const date = new Date()
    let sql = `INSERT INTO paymentdetails (Transaction_Id,Roll,Class,Fees,Pay_Date) VALUES (?)`
    let p = [t,rollno,class1,fee,date]
    db.query(sql,[p],(err, result)=>{
        if(!err || result.affectedRows>0)
        console.log("1 row inserted")
        else
        console.log("err")
    })

    let sql1 = `UPDATE student1 set PAYMENT='PAID' where Roll=? and CLass=?`
    let p1 = [rollno,class1]
    db.query(sql1,[rollno,class1],(err, result)=>{
        if(err) {
            throw err
        }
        else{
            console.log("1 row Updated")
        }
    })
    res.redirect('/paymentsuccess')
})

function gettransact(roll,class1){

    let sql = `SELECT s.Name,s.Roll,s.Class, s.Payment, p.Transaction_Id, p.Fees, p.Pay_Date FROM student1 s INNER JOIN paymentdetails p ON s.CLass=p.Class where s.Roll=? and s.Class=?`
    return new Promise((resolve, reject) => {
        db.query(sql,[roll,class1],(err, rows, fields) => {
            if (!err) {
                console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}

app.get('/paymentsuccess',async(req,res)=>{
    let roll = req.session.rollno
    console.log('PAYMENT ROLL',roll)
    let class1 = req.session.class
    let users = await gettransact(roll,class1)
    console.log(users)
    if(users.length>0 && users[0].Payment === 'PAID')
        res.render('paymentsuccess',{Name: users[0].Name, Roll: users[0].Roll, Payment: users[0].Payment, Tid: users[0].Transaction_Id, Fees: users[0].Fees, pd: users[0].Pay_Date, Class: users[0].Class, message:''})
    else
        res.render('paymentsuccess',{Name: '', Roll: '', Payment: '', Tid: '', Fees: '', pd: '', Class: '', message:'NOT YET PAID'})
})

app.post('/adminviewpayment',async(req,res)=>{
    let rollno = parseInt(req.body.roll)
    let class1 = parseInt(req.body.class)
    let users = await gettransact(rollno,class1)
    if(users.length>0){
        res.render('paymentsuccess',{Name: users[0].Name, Roll: users[0].Roll, Payment: users[0].Payment, Tid: users[0].Transaction_Id, Fees: users[0].Fees, pd: users[0].Pay_Date, Class: users[0].Class, message:'PAID'})
    }else{
        res.render('paymentsuccess',{Name: '', Roll: '', Payment: '', Tid: '', Fees: '', pd: '', Class: '', message:'NOT YET PAID'})
    }
})




app.post('/updatestudent',async(req,res)=>{
    let rollno = parseInt(req.body.roll)
    let class1 = parseInt(req.body.class)
    let users = await getDetails(rollno,class1)
    res.render('adminupdatestudent',{Name: users[0].Name, Roll: users[0].Roll, Class: users[0].Class, Email: users[0].Email, Phone: users[0].Phone_Number, Address: users[0].Address, BloodG: users[0].Blood_Group, Gender: users[0].Gender, Dob: users[0].DATE,message: ""})
})

app.post('/updatingstudent',(req,res)=>{
    let name = req.body.name
    let rollno = req.body.roll
    let class1 = req.body.class
    let email = req.body.email
    let phone = req.body.phonenumber
    let adr = req.body.address
    let bg = req.body.bloodgroup
    let dob = req.body.date

    let sql = `UPDATE student1 SET Name=?, Phone_Number=?, Address=?, Blood_Group=?, DOB=? WHERE Roll=? and Class=?`
    db.query(sql,[name,phone,adr,bg,dob,rollno,class1],(err, rows, fields) => {
        if (err) {
            //console.log(rows)
            throw err
        }
    })
    let sql1 = `UPDATE student_info SET Name=? WHERE Roll=? and Class=?`
    db.query(sql1,[name,rollno,class1],(err, rows, fields) => {
        if (err) {
            //console.log(rows)
            throw err
        }
    })
    res.redirect('search1')
})

//STUDENT VIEW ATTENDANCE--------------------------------------------------------------------------------

function getAttendance(roll,class1){
    let sql = `SELECT Name, Roll, Class,DATE_FORMAT(Date,"%d-%m-%Y") DATE, Status FROM attendance WHERE Roll=? and Class=?`
    return new Promise((resolve, reject) => {
        db.query(sql,[roll,class1],(err, rows, fields) => {
            if (!err) {
                console.log(rows)
                resolve(rows)
            }
            else {
                reject(err)
            }
        })
    })
}
//VIEW ATTENDANCE STUDENT
app.get('/viewattendance',async(req,res)=>{
    let roll = req.session.rollno
    let class1 = req.session.class
    let users = await getAttendance(roll,class1)
    res.render('viewattendance',{user: users})
})

//MANAGE ATTENDANCE-------------------------------------------------------------------------------------

// function getAttendanceDetails(rollno, class1){
//     let date = new Date()
//     console.log(date)
//     let sql = `SELECT * FROM attendance WHERE Roll=? and Class=?`
//     return new Promise((resolve, reject) => {
//         db.query(sql,[rollno,class1],(err, rows, fields) => {
//             if (!err) {
//                 console.log(rows)
//                 resolve(rows)
//             }
//             else {
//                 reject(err)
//             }
//         })
//     })
    
// }

// app.post('/manageattendance',async(req,res)=>{
//     let name = req.body.name
//     let rollno = req.body.roll
//     let class1 = req.body.class
//     let users = await getAttendanceDetails(rollno,class1)
//     console.log(users[0].Status)
// })

//PORT---------------------------------------------------------------------------------------
app.listen('8000', () => {
    console.log('listennig on port 8000')
})  
