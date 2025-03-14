const backendAPI='http://localhost:3200/chatApp'

window.addEventListener('DOMContentLoaded', ()=>{
    const sendBtn = document.getElementById('sendChatBtn');
    //console.log(sendBtn);
    sendBtn.addEventListener('click', addChat);
    fetchChatData();
})

async function fetchChatData(){
    try {
        const response = await fetch(`${backendAPI}/get-chat-Data`, {
            headers:{
                'authorization': localStorage.getItem('token')
            }
        });
        if(response.ok) {
            response.json().then(result => {
                result.chatData.forEach(chat => {
                    chatToDisplay(chat);
                });
            }).catch(err => console.log(err));
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