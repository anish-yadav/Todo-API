const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose.js');
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js')


var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

//POST Todos
app.post('/todos',(req,res) =>{
        var todo = new Todo ({
          text : req.body.text
        });

        todo.save().then((docs) =>{
         res.send(docs);
        },(err)=>{
          res.status(400).send(err);
        });
});

//GET all todos
app.get('/todos',(req,res)=>{
      Todo.find().then((todos)=>{
        res.send({todos});
      },(e)=>res.status(400).send(e));
});



//GET todo by id
app.get('/todos/:id',(req,res)=>{
   
      var id = req.params.id;

      if (!ObjectID.isValid(id)) {
         return res.status(404).send();
      }
       
      Todo.findById(id).then((todo)=>{
        if(!todo){
          return res.status(404).send();
        }
        res.status(200).send(todo);
      });


});

//DELETE todos 
app.delete('/todos/:id',(req,res)=>{
 var id = req.params.id;

 if(!ObjectID.isValid(id)){
  return res.status(404).send();
 }

 Todo.findByIdAndRemove(id).then((todo)=>{
 if(!todo){
  return res.status(404).send();
 }
 return res.status(200).send({todo});
 }).catch((e)=>{
  res.status(400).send(e);
 });


});


// PATCH Todos
app.patch('/todos/:id',(req,res)=>{
      var id = req.params.id;
      var body = _.pick(req.body,['text','completed']);

      if(!ObjectID.isValid(id)){
       return res.status(404).send();
      }

      if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
      } else {
       body.completed = false;
       body.completedAt = null;
      }

      Todo.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo)=>{
        if(!todo){
          return res.status(404).send()
        }
       return res.status(200).send({todo});
      }).catch((e)=>{
        return res.status(400).send(e);
      });


});





app.listen(port, () => {
  console.log(`API Started up at port ${port}` );
});


module.exports = {app};

