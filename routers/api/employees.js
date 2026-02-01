const express=require('express');
const path=require('path')
const router=express.Router()
const employeesController=require('../../controllers/employeesControllers')



router.route('/')
.get(employeesController.getAllEmployees)
.post(employeesController.createNewEmployee)
.put(employeesController.updateEmployee)
.delete(employeesController.deleteEmployee)

router.route('/:id')
.get(employeesController.getEmployee);


module.exports=router