const backendAPI = 'http://localhost:3200';

const socket = io(backendAPI, {         //Initially gets a id for user once user is logged in
    auth: {
        token: localStorage.getItem('token')       //Passes the token
    }
});

window.addEventListener('DOMContentLoaded', () => {
    initializeGenralButtons();      //called to add event listener to almost all the button on the page
    fetchUserGroupData();           //once user is logged in gets all the groups user is connected to

    //Genral scoket handlers for initial connection and final disconnection
    socket.on('connect', () => {
        console.log('Connected to the SocketIo Side of the Server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected');
    })

    socket.on('joined-group',(data) => {
        console.log(`Successfully joined group: ${data.groupname}`);
    });


    //when user gets a new message
    socket.on('receive-message', (message) => {
        console.log('New message found for the group :', message);
        displayToUI(message);
        saveMessage(message);
    });

    socket.on('groupUpdate', (group) => {
        console.log('Group updated: ', group);
        fetchUserGroupData();  //called to refresh the group data side
    });
    
});

function initializeGenralButtons() {        //This function initializes functionality of almost all the buttons on the page
    const sendBtn = document.getElementById('sendChatBtn');
    sendBtn.addEventListener('click', () => sendMessage());

    const leaveGrp = document.getElementById('leaveGroupBtn');
    leaveGrp.addEventListener('click', () => leaveGrpExecution());

    const memberListBtn = document.getElementById('generateMemberList');
    memberListBtn.addEventListener('click', () => memberListToggle());

    const memberListClose = document.getElementById('memberListClose');
    memberListClose.addEventListener('click', ()=> {
        const memberPopup = document.querySelector('.popup-container2');
        memberPopup.style.display= 'none';
    })

    const addMemberBtn = document.getElementById('addMemberToList');
    addMemberBtn.addEventListener('click', () => {
        const addmemberPop = document.querySelector('#addMemberPopup');
        addmemberPop.style.display = 'flex';
    });

    const AddBtn = document.getElementById('AddBtn');
    AddBtn.addEventListener('click', ()=> addMemberFunction());

    const closeMemberBtn = document.getElementById('closeBtn');
    closeMemberBtn.addEventListener('click', () => {
        const addmemberPop = document.querySelector('#addMemberPopup');
        addmemberPop.style.display = 'none';
    })

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
    createBtn.addEventListener('click',() => createGroup());
}

//used to create new Groups
async function createGroup() {
    const groupName = document.getElementById('groupName');
    try {
        const Response = await fetch(`${backendAPI}/chatApp/create-Group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({groupName: groupName.value, role_type: 'admin'})
        });

        if(Response.ok) {
            //console.log(grpCreateBtn);
            const closeBtn = document.getElementById('cancelBtn');
            closeBtn.click();
            fetchUserGroupData();
        }
    } catch(error) {
        alert(error);
    }
}
//Fetches users groups
async function fetchUserGroupData() {
    try{
        const response = await fetch(`${backendAPI}/chatApp/get-Group-Data`, {
            headers: {
                'authorization': localStorage.getItem('token')
            }
        });
        if(response.status === 403) {
            window.location.href = `${backendAPI}/user/login`
        }

        if(response.ok) {
            
            const groupList = document.getElementById('contact-list');
            groupList.innerHTML = '';

            const grpData = await response.json();

            grpData.response.forEach(element => {
                showGroupOnDisp(element);
            })
        } else {
            console.log('Failed to fetch groups');
        }
    } catch(error) {
        console.log(error, "Hello");
    }
}

//Shows group name in the group-section
function showGroupOnDisp(group) {
    console.log(group);
    const groupList = document.getElementById('contact-list');
    
    const li = document.createElement('li');

    li.innerHTML = `${group.group_Name}`;
    li.setAttribute('id', group.group_id);

    li.addEventListener('click', () => {
        document.querySelectorAll('.contact-selected').forEach(el => el.classList.remove('contact-selected'));      //unhighlights the previously selected group

        li.classList.add('contact-selected');   //Highlights the current group

        //Some basic display
        const toggleGrpHeaderBtn = document.querySelector('.group-header-buttons');
        toggleGrpHeaderBtn.style.display='flex';

        const toggleChatInput = document.querySelector('.chat-input');
        toggleChatInput.style.display = 'flex';

        const chatSection = document.querySelector('.chat-section');
        chatSection.innerHTML = '';

        const groupName = group.group_Name;
        const groupTitle = document.querySelector('.group-title');
        groupTitle.innerHTML = groupName;

        //Emit event to join the group
        socket.emit('join-group', { groupId: group.group_id });

        //Displays the stored messages first
        displaySavedMessage(group.group_id);
        
        //fetches newMessage
        fetchGroupChatData(group.group_id);
    });

    groupList.appendChild(li);

}

// This function sends message using Socket
function sendMessage() {
    const chatInput = document.getElementById('chat-box');
    if(!chatInput) {
        console.log('no message to send');
        return;
    }

    const currGroupId = document.querySelector('.contact-selected')?.id;     //Essentially means if the group exists then give me the Id
    console.log(currGroupId)
    if(!currGroupId) {
        alert('Please Select a group First');
        chatInput='';
        return;
    }

    const messageData = {
        groupId: currGroupId,
        message: chatInput.value
    };

    socket.emit('send-message', messageData);

    chatInput.value='';
}

//saves received message in localStorage using grpId
function saveMessage(message) {
    const groupId = message.group_id;
    const savedMessages = JSON.parse(localStorage.getItem(groupId)) || []       //If there is no mention will give an empty array
    savedMessages.unshift(message); //Adds message array at the front of the savedMessage Array  !!!!!!!!!!!!!!!!!!!!!!!!!

    //reduce the size to 20 messages
    while(savedMessages.length > 20) {
        savedMessages.pop();            //!!!!!!!!!!!!!!!!!! NEED TO CHECK IF THIS WORKS
    }

    localStorage.setItem(groupId, JSON.stringify(savedMessages));
}

//Displays the stored messages up on the chat-section
function displaySavedMessage(groupId) {
    const chatSection = document.querySelector('.chat-section');
    chatSection.innerHTML = '';

    const savedMessage = JSON.parse(localStorage.getItem(groupId)) || [];

    savedMessage.forEach(message => {
        displayToUI(message);
    });
}

//This function fetches recent messages from backend when user was not active

async function fetchGroupChatData(groupId) {
    const savedMessages = JSON.parse(localStorage.getItem(groupId)) || [];
    const lastChatId = savedMessages[0]?.chat_id || 0;

    try {
        const response = await fetch(`${backendAPI}/chatApp/get-chat-Data/${groupId}`, {
            headers: {
                'authorization': localStorage.getItem('token'),
                'lastChatId': lastChatId
            }
        });

        if(response.ok) {
            const result = await response.json();

            result.chatData.forEach(message => {
                displayToUI(message);
                saveMessage(message);
            });
        } else {
            console.log('Failes to fetch messages');
        }
    } catch (error) {
        console.error(error);
    }
}

//Displays message to chat-section
function displayToUI(message) {
    console.log(message);
    const chatSection = document.querySelector('.chat-section');

    const newli = document.createElement('li');
    newli.classList.add('chat-message');
    newli.setAttribute('id', message.chat_id);

    const newspan = document.createElement('span');
    newspan.classList.add('sender-name');
    newspan.innerHTML = `${message.sent_by}`;

    newli.appendChild(newspan);

    const newp = document.createElement('p');
    newp.classList.add('message-content');
    newp.innerText = `${message.message_content}`

    newli.appendChild(newp);

    chatSection.appendChild(newli);
}

//Leave Group
async function leaveGrpExecution() {
    const currGroupId = document.querySelector('.contact-selected')?.id;

    if(!currGroupId) {
        alert('Please select a Group');
        return;
    }

    try {
        const response = await fetch(`${backendAPI}/chatApp/leave-Group/${currGroupId}`, {
            method: 'DELETE',
            headers: {
                'authorization': localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if(response.ok) {
            console.log('Lest Group Successfully');
            fetchUserGroupData();
        } else {
            console.error('Failed to leave a Group');
        }
    } catch(error) {
        console.error(error);
    }
}

//Toggle display group member list

async function memberListToggle() {
    const groupId = document.querySelector('.contact-selected')?.id;

    if(!groupId) {
        alert('Please Select a group');
        retuurn
    }

    try {
        const response = await fetch(`${backendAPI}/grpFind/groupMember/${groupId}`, {
            headers: {
                'authorization': localStorage.getItem('token')
            }
        });

        if(response.ok) {
            const result = await response.json();
            console.log(result);
            const currUserType = result.connectionType;
            PrintonList(result.memberData);
            if(currUserType === 'admin'){
                const adminElements = document.querySelectorAll('.admin');
                adminElements.forEach(element => {
                    element.style.display = 'flex';
                })
            } else {
                const adminElements = document.querySelectorAll('.admin');
                adminElements.forEach(elemet => {
                    elemet.style.display = 'none';
                })
            }
        } else {
            console.log('Failed to fetch member List');
        }
    } catch(error) {
        console.error(error);
    }
    const memberListPopup = document.querySelector('.popup-container2');
    memberListPopup.style.display = 'flex';
}

function PrintonList(membList) {
    console.log('in function');
    const memberList = document.querySelector('.memberList');
    memberList.innerHTML = '';
    membList.forEach(element => {
        console.log(element);
        const li = document.createElement('li');
        const span1 = document.createElement('span');
        const span2 = document.createElement('span');
        const div = document.createElement('div');
        const button2 = document.createElement('button');

        li.classList.add('member-item');
        
        span1.classList.add('role_type');
        span1.innerHTML = `<b>${element.role_type}</b>`;

        span2.classList.add('member-name');
        span2.innerHTML = `<u>${element.user.name}</u> <u>${element.user.email}</u>`;

        div.classList.add('member-actions');

        button2.classList.add('remove-btn');
        button2.classList.add('admin');
        button2.setAttribute('id', element.user.id);
        button2.innerHTML = 'Remove';
        button2.addEventListener('click',async (event) => {
            const groupId = document.querySelector('.contact-selected')?.id;
            console.log(groupId);
            if(!groupId) {
                alert('Please select a valid Group!');
                return;
            }
            try {
                const response = await fetch(`${backendAPI}/grpFind/deleteGroupMember/${groupId}`, {
                    method: 'DELETE',
                    headers: {
                        'authorization' : localStorage.getItem('token'),
                        'userToRemove': event.target.id
                    }
                });
                if(response.ok) {
                    console.log(response);
                    const result = await response.json();
                    console.log(result);
                    memberListToggle();
                }
            } catch(error) {
                console.error(error);
            }
        });
        //addEventListener

        div.appendChild(button2);

        li.appendChild(span1);
        li.appendChild(span2);
        li.appendChild(div);

        memberList.appendChild(li);


        //console.log(element.user.id);
        //li.setAttribute('id', `${element.user.id}`)
    });
}

async function addMemberFunction() {
    console.log('Add Member Function called');
    const memberDet = document.getElementById('memberDet');
    const info = memberDet.value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   
    const phoneRegex = /^\+?\d{5,15}$/;

    const getInputType = (info) => {
        if(emailRegex.test(info)) {
            return {type: 'email', info};
        } else if(phoneRegex.test(info)) {
            return {type: 'mobile', info};
        } else {
            return {type: 'invalid', info};
        }
    };

    const valuetype = getInputType(info);
    if(valuetype.type !== 'invalid') {
        const selectedGrpId = document.querySelector('.contact-selected').id;
        //console.log(selectedGrpId);
        const response = await fetch(`${backendAPI}/grpFind/addGroupMember/${selectedGrpId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({valuetype})
        });
        if(response.ok){
            const result = await response.json();
            console.log(result);
            memberDet.value = '';
            const memberListClose = document.getElementById('memberListClose');
            memberListClose.click();
            memberListToggle();

        }
    } else {
        memberDet.value = '';
        alert('Add a valid Value!');
    }
 
}

