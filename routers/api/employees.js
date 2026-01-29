const express=require('express');
const path=require('path')


const data={}
const router=express.Router()

data.employees=require('../../data/employees.json')


router.route('/')
.get((req,res)=>{
    res.json(data.employees)



})
.post((req,res)=>{
    res.json({
            "firstname:":req.body.firstname,
             "lasstname:":req.body.lastname
    })


})
.put((req,res)=>{
        res.json({
            "firstname:":req.body.firstname,
             "lasstname:":req.body.lastname
    })


})
.delete((req,res)=>{
    res.json({"id":req.body.id})


})

router.route('/:id')
.get((req,res)=>{
    res.json({"id":req.params.id})


})


module.exports=router