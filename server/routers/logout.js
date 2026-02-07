const express=require('express');
const router=express.Router();
const logoutController=require('../controllers/logoutController')


//this route creates new access token 
router.get('/',logoutController.handleLogout)

module.exports=router