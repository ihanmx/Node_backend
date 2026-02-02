const express=require('express');
const router=express.Router();
const refreshTokenController=require('../controllers/refreshTokenController')


//this route creates new access token 
router.get('/',refreshTokenController.handleRefreshToken)

module.exports=router