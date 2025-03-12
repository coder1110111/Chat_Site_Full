const backendAPI='http://localhost:3200/chatApp'

window.addEventListener('DOMContentLoaded', ()=>{
    const sendBtn = document.getElementById('sendChatBtn');
    console.log(sendBtn);
    sendBtn.addEventListener('click', addChat);    
})


async function addChat() {    
    console.log('Send button clicked');
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
                console.log(response)
            }
        } catch(err) {
            console.log(err);
        }
    }
}