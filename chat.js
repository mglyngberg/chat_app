let messages = document.querySelector('.messages');
let userList = document.getElementById('users');
let usernameLabel = document.querySelector('.usernameLabel');


$(function () {
    var socket = io();
    $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });
    socket.on('chat message', function(msg){
      // $('#messages').append($('<li>').text(msg));
        displayMessage(msg);

        // messages.scrollTop = messages.;
    });

    socket.on('userList', function(users){
        displayUsers(users);
    })

    socket.on('username', function(user){
        displayUser(user);
    })

    socket.on('color', function(colorMessage){
        changeColor(colorMessage.user, colorMessage.cssColor);
    })
});

function displayMessage(chatMessage) {
// $('#messages').append($('<li>').text(chatMessage));

console.log(chatMessage);
    const div = document.createElement('div');
    div.classList.add('chatMessage');
    div.innerHTML = `<p class="messageData ${chatMessage.username}">${chatMessage.username}<span>    ${chatMessage.time}</span></p>
    <p class="messageText">${chatMessage.text} </p>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    changeColor(chatMessage.username, chatMessage.usernameColor);
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

function changeColor(user, color){
    usernameLabel.style.color = color;
    let usernames = document.getElementsByClassName(user);
    for (var i = 0; i < usernames.length; i++) {
        usernames[i].style.color = color;
    }
}