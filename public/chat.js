const backendAPI='http://localhost:3200/chatApp'

window.addEventListener('DOMContentLoaded', ()=>{
    const sendBtn = document.getElementById('sendChatBtn');
    //console.log(sendBtn);
    sendBtn.addEventListener('click', addChat);
    
    //CREATE GROUP FORM POP-UP WINDOW MANAGEMENT
    const createGroupBtn = document.getElementById('createGroupBtn');
    const groupPopup = document.getElementById('groupPopup');
    const cancelBtn = document.getElementById('cancelBtn');
    const createBtn = document.getElementById('createBtn');
    const contactList = document.getElementById('contact-list');
    const chatInput = document.getElementById('chat-box');
    
    // initially text elements are disabled for convenience
    chatInput.disabled = true;
    sendBtn.disabled = true;

    //DISPLAYS POPuP FORM
    createGroupBtn.addEventListener('click', () => {
        groupPopup.style.display = 'flex';
    })

    //Hides popup menu
    cancelBtn.addEventListener('click', () => {
        const groupNameInput = document.getElementById('groupName');

        groupNameInput.value = '';
        groupPopup.style.display = 'none';
    })

    createBtn.addEventListener('click', () => createGroup());

    //Highlight the selected group
    contactList.addEventListener('click', (event) => {
        if(event.target.tagName === 'LI') {
            const previousSelected = document.querySelector('.contact-selected');
            if(previousSelected) {
                previousSelected.classList.remove('contact-selected');
            }
            const chatSection = document.querySelector('.chat-section');
            chatSection.innerHTML='';
            event.target.classList.add('contact-selected');
        }
    })
    
    //setting a time interval to call fetchChatData every 1 second
    
    setInterval(loopFunction, 10000);
    loopFunction();
})

function loopFunction() {

    //localStorage methods to store and get more chats to perform less data transfer

    const oldmsg = JSON.parse(localStorage.getItem('msgArr')) || [];
    if(oldmsg.length > 0) {        //checks if the local Storage has stored messages or not will execute one or the other argument function
        console.log('something in localStorage');
        const lastEle = oldmsg[0];
        console.log(lastEle.chat_id);
        fetchChatData(lastEle.chat_id);
    }
    if(oldmsg === 0) {
        console.log('Nothing in localStorage');
        fetchChatData(0);
    }
}


async function fetchChatData(lastChatId){
    console.log(lastChatId);
    try {
        const response = await fetch(`${backendAPI}/get-chat-Data?lastChatId=${lastChatId}`, {
            headers:{
                'authorization': localStorage.getItem('token')
            }
        });
        if(response.ok) {
            const resultData = await response.json();
            const result = resultData.chatData;
            console.log(result);
            if(result.length>0) {
                let newMsgArr;
                const oldMsgArr = JSON.parse(localStorage.getItem('msgArr')) || [];
                if(oldMsgArr.length === 0) {
                    newMsgArr = result;
                } else {
                    newMsgArr = result.concat(oldMsgArr);
                }
                newMessageDetected(result);     //remember messages are in Descending chat_id format
                if(newMsgArr.length >20) {
                    newMsgArr = newMsgArr.slice(0,20);
                }
                localStorage.setItem('msgArr', JSON.stringify(newMsgArr));
            }
        }
    } catch(err) {
        console.log(err);
    }
}

function newMessageDetected(msgDispArr) {
    for(let i=msgDispArr.length-1; i>=0; i--) {
        chatToDisplay(msgDispArr[i]);
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

function createGroup() {

    const groupPopup = document.getElementById('groupPopup');
    const groupNameInput = document.getElementById('groupName');

    const groupName = groupNameInput.value.trim();
    if(groupName === '') {
        alert('Please enter a Group name.');
        return;
    }
    
    //below this will be calling API for groupwork
    console.log('Created group: ', groupName);

    groupPopup.style.display = 'none';

    groupNameInput.value = '';
    
}