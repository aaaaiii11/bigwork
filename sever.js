const openai=require('./openai');
const express=require('express');
let app=express();

app.get('/',(req,res)=>{
    
    res.send('你好')
})

app.listen(300,()=>{
    console.log('开起成功')
})