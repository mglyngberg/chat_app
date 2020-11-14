let messages = document.querySelector('.messages');
let userList = document.getElementById('users');
let usernameLabel = document.querySelector('.usernameLabel');
const socket = io();


$(function () {
    const username = readUserCookie();
    if(username !== '' && username !== undefined){
        socket.emit('cookie user', `${username}`);
    }
    else{
        socket.emit('new user', '');
    }
    
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });

    socket.on('chat message', function(msg){
        displayMessage(msg);
    });

    socket.on('userList', function(users){
        displayUsers(users);
    })
    
    socket.on('username', function(user){
        displayUser(user);
        updateUserCookie(user);
    })

    socket.on('color', function(colorMessage){
        changeColor(colorMessage.id, colorMessage.cssColor);
    })
});

function displayMessage(chatMessage) {
    const div = document.createElement('div');
    div.classList.add('chatMessage');
    div.innerHTML = `<p class="messageData u${chatMessage.id}">${chatMessage.username}<span>    ${chatMessage.time}</span></p>
    <p class="messageText">${chatMessage.text} </p>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    if(chatMessage.id === socket.id){
        div.style.backgroundColor = '#d9e4dd';
    }
    changeColor(chatMessage.id, chatMessage.usernameColor);
}

function displayUsers(users){
    
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}

function displayUser(user){
    usernameLabel.innerText = user;
}

function updateUserCookie(user){
    document.cookie = `username=${user}; SameSite=Strict`;
}

function changeColor(id, color){
    if(socket.id === id){
        usernameLabel.style.color = color;
    }
    let usernames = document.getElementsByClassName('u' + id);
    for (var i = 0; i < usernames.length; i++) {
        usernames[i].style.color = color;
    }
}

function readUserCookie(){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; username=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}