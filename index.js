var express = require('express');
const { join } = require('path');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');

let users = [];
let messageHistory = [];

app.use(express.static(path.join(__dirname, '')));

io.on('connection', (socket) => {
  console.log('a user connected');

  const user = addUser(socket.id, Math.random().toString(36).substring(7));
  socket.emit('username', user.username);

  messageHistory.forEach(message => {
    socket.emit('chat message', message);
  });
  
  socket.emit('chat message', createMessage('Magnus Messenger',user.color, `Welcome to chat ${user.username}`));

  socket.broadcast.emit('chat message', createMessage('Magnus Messenger', user.color, `${user.username} connected to chat`));
  io.emit('userList', users);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    if(removeUser(socket.id)){
      socket.broadcast.emit('chat message', createMessage('Magnus Messenger', user.color, `${user.username} disconnected`));
      io.emit('userList', users);
    }
  });

  socket.on('chat message', (msg) => {
    const user = getUser(socket.id);
    const message = createMessage(user.username, user.color, msg);
    if(!checkCommands(socket.id, message)){
      io.emit('chat message', message);
      logMessage(message);
    }
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

function createMessage(username, usernameColor, text){

  let date = new Date();
  return {
    username,
    usernameColor,
    text,
    time: date.toLocaleTimeString()
  }
}

function addUser(id, username){
  let color = '#000000'
  let user = {id, username, color};
  users.push(user);
  return user;
}

function getUser(id){
  return users.find(user => user.id === id);
}

function removeUser(id){
  const i = users.findIndex(user => user.id === id);
  if(i !== -1){
    return users.splice(i , 1)[0];
  }
}

function logMessage(msg){
  if(messageHistory.length >= 200){
    messageHistory.shift();
  }
  messageHistory.push(msg);
}

function checkCommands(id, msg){
  if(msg.text.substring(0, 6) === '/color'){
    let color = msg.text.slice(7, 13);
    if(color.length !== 6)
    {
      console.log(color.length);
      return false
    }
    let colorValue = parseInt('0x' + color);
    if(! isNaN(colorValue)){
      const user = msg.username;
      cssColor = '#' + color;
      let colorMessage = {user, cssColor};
      io.emit('color', colorMessage);
      changeUserColor(id, cssColor);
      io.emit('chat message', createMessage('Magnus Messenger','#000000', `${msg.username} has changed their color to ${cssColor}`));
      return true;
    }
  }
  else if(msg.text.substring(0, 5) === '/name')
  {
    let username = msg.text.slice(6, msg.text.length);

    changeUserName(id, username);
    io.emit('chat message', createMessage('Magnus Messenger','#000000', `${msg.username} has changed their name to ${username}`));
    io.emit('userList', users);
    io.to(id).emit('username', username);

    return true;
  }
  return false;
}

function changeUserColor(id, color){
  const i = users.findIndex(user => user.id === id);
  if(i !== -1){
    users[i].color = color;
  }

  messageHistory.forEach(message => {
    if(message.username === getUser(id).username){
      message.usernameColor = color;
    }
  });
}

function changeUserName(id, username) {
  
  const i = users.findIndex(user => user.username === username);
  if(i !== -1){
    return;
  }

  const j = users.findIndex(user => user.id === id);
  if(j !== -1){
    users[j].username = username;
  }
}
//https://www.youtube.com/watch?v=jD7FnbI76Hg 17:45