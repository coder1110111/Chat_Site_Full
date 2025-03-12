const backendAPI='http://localhost:3200/chat'



document.querySelector('#sendChatBtn').addEventListener('click', async () => {
    const chatData = document.querySelector('#chat-box').value;
    const chatEmpty = document.querySelector('#chatEmpty');
    if(!chatData) {
        chatEmpty.innerHTML=`check box`;
    } else {
        chatEmpty.innerHTML=``;
        try {
            const response = await fetch(`${backendAPI}/chat-save`, {
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
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
})