const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs')
//const { getPhone } = require('./tests/getPhone');

const app = express();

const port = process.env.port || 5000;

app.get('/', (req,res)=>{

    // fs.readFile('./phoneData/samsungPhone.js', (err, data)=>{
    //     const jsonD = JSON.parse(data)
    //     res.send(jsonD)
    // })
    //res.send();
// (async()=> {
//   await  getPhone()
// })()
    
})

app.listen(port, ()=> {
    console.log("port running ");
});