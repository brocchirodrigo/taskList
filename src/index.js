const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existUser = users.some((user) => user.username === username)

  if(!existUser) {
    return response.status(400).json({ error: 'Could not find user' })
  }

  request.username = username;

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
  
  return response.status(200).json(users);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline, done } = request.body;

  const user = users.find(user => user.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: done || false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const task = users.find(user => user.username === username).todos.find(todo => todo.id === id);

  if(!task) {
    return response.status(404).json({ error: 'User or task not find' })
  }

  task.title = title;
  task.deadline = new Date(deadline);

  return response.status(200).json(task)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const task = users.find(user => user.username === username).todos.find(todo => todo.id === id);

  if(!task) {
    return response.status(404).json({ error: 'User or task not find' })
  }

  task.done = true;

  return response.status(204).json(task)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const user = users.find(user => user.username === username)
  const taskIndex = users.find(user => user.username === username).todos.findIndex(todo => todo.id === id);

  const { todos } = user;

  if(taskIndex < 0) {
    return response.status(404).json({ error: 'User or task not find' })
  }

  todos.splice(taskIndex, 1)

  return response.status(204).send()
});

module.exports = app;