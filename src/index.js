const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username)

  if(!user) {
    return response.status(404).json({ error: 'Could not find user' })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const existUser = users.some(user => user.username === username)

  if(existUser) {
    return response.status(400).json({ error: 'User already exists' })
  }

  const newUser = {
    id: uuidv4(),
    username,
    name,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { todos } = request.user;

  const testeArray = []

  testeArray.push(todos)
  
  return response.status(200).json(testeArray);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { title, deadline, done } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: done || false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  todos.push(newTodo);

  // const testeArrayTodo = {
  //   deadline: newTodo.deadline,
  //   done: newTodo.done,
  //   title: newTodo.title
  // }

  return response.status(201).json(todos);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const task = todos.find(todo => todo.id === id);

  if(!task) {
    return response.status(404).json({ error: 'Todo not find' })
  }

  task.title = title;
  task.deadline = new Date(deadline);

  return response.status(200).json(task)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;
  const task = todos.find(todo => todo.id === id);

  if(!task) {
    return response.status(404).json({ error: 'Todo not find' })
  }

  task.done = true;

  return response.status(200).json(task)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;
  const taskIndex = todos.findIndex(todo => todo.id === id);

  if(taskIndex < 0) {
    return response.status(404).json({ error: 'Todo not find' })
  }

  todos.splice(taskIndex, 1)

  return response.status(204).send()
});

module.exports = app;