const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const{Todo} = require('./../models/todo');

var todos = [{
	_id : new ObjectID(),
	text: 'It is the first todo'
},{
	_id : new ObjectID(),
	text: 'I just dont know what i am doing',
	completed : true,
	completedAt : 12345
}];

beforeEach((done)=>{
  Todo.remove({}).then(()=>{
  	return Todo.insertMany(todos);
  }).then(()=>{
  	done();
  });
});

describe('POST /todos',()=>{
  it('should create a new todo',(done)=>{
		  var text = 'Test todo text';

		  request(app)
		  .post('/todos')
		  .send({text})
		  .expect(200)
		  .expect((res)=>{
		  	expect(res.body.text).toBe(text);
		  })
		  .end((err,res)=>{
		    if (err) {
		    return	done(err);
		    }

		    Todo.find({text}).then((todos)=>{
		    	expect(todos.length).toBe(1);
		    	expect(todos[0].text).toBe(text);
		       done();
		    }).catch((err)=>{
		    	done(errr)
		    });
		  });
		  });

  it('it should not create todo with invalid text data',(done)=>{
    
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err,res)=>{
    	if (err) {
    		return done(err);
    	}

    	Todo.find().then((todos)=>{
    		expect(todos.length).toBe(2);
    		done();
    	}).catch((e)=> done(e));
    });

  });
});


describe('GET /todos',()=>{
  it('Should get all todos',(done)=>{
   request(app)
   .get('/todos')
   .expect(200)
   .expect((res)=>{
   	expect(res.body.todos.length).toBe(2);
   })
   .end(done);
    
  });

});



describe('DELETE /todos',()=>{
  it('Should delete a todo',(done)=>{
    var hexId = todos[0]._id.toHexString();

    request(app)
    .delete(`/todos/${hexId}`)
    .expect(200)
    .expect((res)=>{
    	expect(res.body.todo._id).toBe(hexId);
    	
    })
    .end((err,res)=>{
    	if (err) {
    		return done(err);
    	}


    	Todo.findById(hexId).then((todo)=>{
    		expect(todo).toBe(null);
    		done();
    	}).catch((e)=>done(e));
    });

  });

  it('Should return 404 if todo not found',(done)=>{
   var hexId =new ObjectID().toHexString();

   request(app)
   .delete(`/todos/${hexId}`)
   .expect(404)
   .end(done);

  });

  if('should return 404 for non ObjectID',(done)=>{
   request(app)
   .delete('/todos/ajjddd')
   .expect(404)
   .end(done);
  });

});



describe('PATCH todos/:id',()=>{
  it('shoud update a todo',(done)=>{
   var hexId = todos[0]._id.toHexString();
   var text = 'This is the dummy text';

   request(app)
   .patch(`/todos/${hexId}`)
   .send({
   	completed: true,
   	text
   }) 
   .expect(200)
    .expect((res)=>{
    	expect(res.body.todo.text).toBe(text);
    	expect(res.body.todo.completed).toBe(true);
    	expect(typeof res.body.todo.completedAt).toBe('number');
    })
   .end(done);
  });

  it('Should remove completedAt at incompleted todo',(done)=>{
     var hexId = todos[1]._id.toHexString();
     var text = 'This is the dummy text';

     request(app)
     .patch(`/todos/${hexId}`)
     .send({
     	completed:false,
     	text
     })
     .expect(200)
     .expect((res)=>{
     	expect(res.body.todo.text).toBe(text);
     	expect(res.body.todo.completed).toBe(false);
           expect(res.body.todo.completedAt).toBe(null);
     })
     .end(done);
  });



});




