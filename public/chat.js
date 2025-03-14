const backendAPI='http://localhost:3200/chatApp'

window.addEventListener('DOMContentLoaded', ()=>{
    const sendBtn = document.getElementById('sendChatBtn');
    //console.log(sendBtn);
    sendBtn.addEventListener('click', addChat);

    //setting a time interval to call fetchChatData every 1 second
    setInterval(loopFunction, 1000);
    
    loopFunction();
})

function loopFunction() {
    fetchChatData();
}


async function fetchChatData(){
    console.log('fetchData Executed');
    const chatsection = document.querySelector('.chat-section');
    if(chatsection){
        chatsection.innerHTML='';
    }
    
    try {
        const response = await fetch(`${backendAPI}/get-chat-Data`, {
            headers:{
                'authorization': localStorage.getItem('token')
            }
        });
        if(response.ok) {
            const result = await response.json();
            result.chatData.forEach(element => {
                chatToDisplay(element);
            });
        }
    } catch(err) {
        alert(err);
    }
}

function chatToDisplay(chat){
    //console.log(chat);
    const chatList = document.getElementsByClassName('chat-section')[0];
    const newli = document.createElement('li');
    newli.innerHTML = `${chat.message}`;
    newli.setAttribute('id', chat.chat_id);
    chatList.appendChild(newli);
}


async function addChat() {    
    //console.log('Send button clicked');
    const chatData = document.querySelector('#chat-box').value;
    const chatEmpty = document.querySelector('#chatEmpty');
    if(!chatData) {
        chatEmpty.innerHTML='Chat Box cannot be Empty!';
        return;
    }
    else {
        if(chatEmpty) {
            chatEmpty.innerHTML='';
        }
        try {
            const response = await fetch(`${backendAPI}/chat-save`, {
                method:"POST",
                headers: { 
                    'Content-Type' : 'application/json',
                    'Authorization': localStorage.getItem('token')
                 },
                body: JSON.stringify({chat: chatData})
            });
            if(response.ok) {
                //console.log(response)
                document.querySelector('#chat-box').value='';
            }
        } catch(err) {
            console.log(err);
        }
    }
}