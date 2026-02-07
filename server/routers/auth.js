const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController')

//to access from front you have to set credentials to inlude with fetch and so the options for axios 

router.post('/',authController.handleLogin)

module.exports=router