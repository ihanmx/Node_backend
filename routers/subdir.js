const express=require('express');
const path=require('path')




const router=express.Router()
router.get(['/','/index','index.html'],(req,res)=>{ 

// res.sendFile('./views/index.html',{root:__dirname})
res.sendFile(path.join(__dirname,'..','views','subdir','index.html'))

})


router.get(['/','/index','index.html'],(req,res)=>{ 

// res.sendFile('./views/index.html',{root:__dirname})
res.sendFile(path.join(__dirname,'..','subdir','views','test.html'))

})





module.exports=router;