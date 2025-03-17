const backendAPI = 'http://localhost:3200/chatApp'

window.addEventListener('DOMContentLoaded', () => {
    //Event listener on send btn
    const sendBtn = document.getElementById('sendChatBtn');
    sendBtn.addEventListener('click', addChatInGroup);     ///////////need to define

    //Initial state of buttons in chat-container
    const chatInput = document.getElementById('chat-box');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const leaveGrp = document.getElementById('leaveGroupBtn');

    sendBtn.disabled = true;
    chatInput.disabled = true;
    addMemberBtn.disabled = true;
    leaveGrp.disabled = true; 

    //Group Create PopUp Menu
    const createGroupBtn = document.getElementById('createGroupBtn');
    const groupPopup = document.getElementById('groupPopup');
    const cancelBtn = document.getElementById('cancelBtn');
    const createBtn = document.getElementById('createBtn');
    const groupNameInput = document.getElementById('groupName');
    
    //Shows PopUp Menu
    createGroupBtn.addEventListener('click', () => {
        groupPopup.style.display = 'flex';
    });

    //Hides PopUp Menu
    cancelBtn.addEventListener('click', () => {
        groupNameInput.value = '';
        groupPopup.style.display = 'none';
    })

    //EventListener to create a group
    createBtn.addEventListener('click', createGroup);

    //Highlight the selected Group
    const contactList = document.getElementById('contact-list');

    let intervalID = null; // Store the interval reference

contactList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        const previousSelected = document.querySelector('.contact-selected');
        if (previousSelected) {
            previousSelected.classList.remove('contact-selected');
        }

        const chatSection = document.querySelector('.chat-section');
        chatSection.innerHTML = '';
        event.target.classList.add('contact-selected');
        
        sendBtn.disabled = false;
        chatInput.disabled = false;
        addMemberBtn.disabled = false;
        leaveGrp.disabled = false;
        console.log('Executed checkppoint 1');
        // Clear the previous interval before setting a new one
        if (intervalID) {
            clearInterval(intervalID);
            console.log('Executed checkppoint if');
        }

        const groupId = event.target.id;
        console.log(groupId);
        console.log('Executed checkppoint 2');
        ScreenFunction(groupId);
        // Start a new interval and store its reference
        intervalID = setInterval(() => loopFunction(groupId), 10000);

        // Immediately call the function for the first fetch
        loopFunction(groupId);
        console.log('Executed checkppoint 3');
    }
});

    //addMemberPopup

    //leaveGroupBtnExecution
    
    setInterval(fetchUserGroupData, 120000);     //fetches User's Group every 30 seconds //will not be stopped       //This works not perfectly repeat group shows
    fetchUserGroupData();       //fetches Group Data for this 
});

async function createGroup() {
    const groupName = document.getElementById('groupName');
    try {
        const Response = await fetch(`${backendAPI}/create-Group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({groupName: groupName.value, role_type: 'admin'})
        });

        if(Response.ok) {
            const grpCreateBtn = await Response.json();
            //console.log(grpCreateBtn);
            const closeBtn = document.getElementById('cancelBtn');
            closeBtn.click();
            fetchUserGroupData();
        }
    } catch(error) {
        alert(error);
    }
}

async function fetchUserGroupData() {
    
    try {
        const grpDataResponse = await fetch(`${backendAPI}/get-Group-Data`, {
            headers: {
                'authorization': localStorage.getItem('token')
            }
        });
        console.log(grpDataResponse.status);
        if(grpDataResponse.status === 403){
            window.location.href = `http://localhost:3200/user/login`;
        }
        if(grpDataResponse.ok) {
            
            const groupList = document.getElementById('contact-list');
            groupList.innerHTML = '';
            const grpData = await grpDataResponse.json();
            grpData.response.forEach(element => {
                showGroupOnDisp(element);
            })
        }

    } catch(error) {
        alert(error);
    }
}

//Shows Group Data on screen
function showGroupOnDisp(element) {
    //console.log(element);
    const groupList = document.getElementById('contact-list');
    const li = document.createElement('li');
    li.innerHTML=`${element.group_Name}`;
    li.setAttribute('id', element.group_id);

    groupList.appendChild(li);
}

async function addChatInGroup() {
    const chatInput = document.getElementById('chat-box').value;
    if(!chatInput) {
        console.log('There is no message');
        return;
    }
    const currGroupId = document.querySelector('.contact-selected').id;
    try {
        const response = await fetch(`${backendAPI}/chat-post/${currGroupId}`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({message: chatInput})
        });
        if(response.ok) {
            const result = await response.json();
            console.log(result);
        }
    } catch(error) {
        alert(error);
    }
}

function loopFunction(eventId) {       //keep checking for chats available for the selected group
    const oldmsg = JSON.parse(localStorage.getItem(`${eventId}`)) || [];
    console.log('in loop function');
    console.log(oldmsg);
    if(oldmsg.length > 0) {
        console.log('something in local Storage');
        ScreenFunction(oldmsg);
        const lastEle = oldmsg[0];      //stored in descending order
        fetchGroupChatData(eventId, lastEle.chat_id);
    }
    if(oldmsg.length === 0) {
        console.log('Nothing in LocalStorage');
        fetchGroupChatData(eventId, 0);
    }
}

async function fetchGroupChatData(Grp_Id, lastChatId) {     //fetches chat for the selected group
    console.log('fetchGroupChatData called successfully');
    console.log(Grp_Id + "|||||" + lastChatId);
    try{
        const grpChatData = await fetch(`${backendAPI}/get-chat-Data/${Grp_Id}`,{
            headers: {
                'authorization': localStorage.getItem('token'),
                'lastChatId': lastChatId
            }
        });
        const result = await grpChatData.json();
        if(result.chatData.length > 0) {
            let newMsgArr;
            ScreenNewMsg(result.chatData);  //Displays new messages if any
            const oldMsg = JSON.parse(localStorage.getItem(`${Grp_Id}`)) || [];
            if(oldMsg.length === 0) {
                newMsgArr = result.chatData;
            } else {
                newMsgArr = result.chatData.concat(oldMsg);
            }
            if(newMsgArr.length > 10) {
                newMsgArr = newMsgArr.slice(0,20);
            }
            localStorage.setItem(`${Grp_Id}`, JSON.stringify(newMsgArr));
        }
        
    } catch(error) {
        console.log(error);
    }
}

function ScreenFunction(GroupId) {
    const getOldMsg = JSON.parse(localStorage.getItem(`${GroupId}`)) || [];
    if(getOldMsg.length > 0) {
        for(let i = getOldMsg.length-1; i>=0; i--) {
            displayToUI(getOldMsg[i]);
        }
    }
}
function ScreenNewMsg(msgArray) {
    for(let i = msgArray.length-1; i>=0; i--){
        displayToUI(msgArray[i]);
    }
}

function displayToUI(element) {
    console.log(element);
    const chatList = document.getElementsByClassName('chat-section')[0];
    const newli = document.createElement('li');
    newli.innerHTML = `${element.message_content}`;
    newli.setAttribute('id', element.chat_id);
    chatList.appendChild(newli);
}