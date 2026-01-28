
const {logEvents}=require('../logEvents')
const EventEmiiter=require('events');

class MyEmiiter extends EventEmiiter{}



//initialize obj

const myEmiiter=new MyEmiiter();

//add listener for the log event

myEmiiter.on('log',msg=>{

    logEvents(msg);
})

setTimeout(()=>{
    myEmiiter
    .emit('log','log event emitted');


},2000)