const backendAPI = 'http://localhost:3200';

window.addEventListener('DOMContentLoaded', () => {

    initializeGeneralButtons();     //Adds eventListener to all the buttons

    //Highlight the selected Group
    const contactList = document.getElementById('contact-list');
    let intervalID = null; // Store the interval reference

contactList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        const previousSelected = document.querySelector('.contact-selected');
        if (previousSelected) {
            previousSelected.classList.remove('contact-selected');
        }
        const toggleGrpHeaderBtn = document.querySelector('.group-header-buttons');
        toggleGrpHeaderBtn.style.display='flex';

        const toggleChatInput = document.querySelector('.chat-input');
        toggleChatInput.style.display = 'flex';

        const chatSection = document.querySelector('.chat-section');
        chatSection.innerHTML = '';
        event.target.classList.add('contact-selected');
        const GroupName = event.target.innerHTML;
        const groupTitle = document.querySelector('.group-title');
        groupTitle.innerHTML = GroupName;
        
        //console.log('Executed checkpoint 1');
        // Clear the previous interval before setting a new one
        if (intervalID) {
            clearInterval(intervalID);
            console.log('Executed checkppoint if');
        }

        const groupId = event.target.id;
        //console.log(groupId);
        //console.log('Executed checkppoint 2');
        ScreenFunction(groupId);
        // Start a new interval and store its reference
        intervalID = setInterval(() => loopFunction(groupId), 3000);

        // Immediately call the function for the first fetch
        loopFunction(groupId);
        //console.log('Executed checkppoint 3');
    }
});
    
    setInterval(fetchUserGroupData, 120000);     //fetches User's Group every 30 seconds //will not be stopped       //This works not perfectly repeat group shows
    fetchUserGroupData();       //fetches Group Data for this 
});

function initializeGeneralButtons() {
    const sendBtn = document.getElementById('sendChatBtn');
    sendBtn.addEventListener('click',() => addChatInGroup());  //defined
    
    const leaveGrp = document.getElementById('leaveGroupBtn');
    leaveGrp.addEventListener('click', () => leaveGrpExecution());  //EventListener to leave Group

    const memberListBtn = document.querySelector('#generateMemberList');
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

    
}

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

async function fetchUserGroupData() {
    
    try {
        const grpDataResponse = await fetch(`${backendAPI}/chatApp/get-Group-Data`, {
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
        const response = await fetch(`${backendAPI}/chatApp/chat-post/${currGroupId}`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({message: chatInput})
        });
        if(response.ok) {
            const result = await response.json();
            chatInput.value='';
            //console.log(result);
        }
    } catch(error) {
        alert(error);
    }
}

function loopFunction(eventId) {       //keep checking for chats available for the selected group
    const oldmsg = JSON.parse(localStorage.getItem(`${eventId}`)) || [];
    //console.log('in loop function');
    //console.log(oldmsg);
    if(oldmsg.length > 0) {
        //console.log('something in local Storage');
        ScreenFunction(oldmsg);
        const lastEle = oldmsg[0];      //stored in descending order
        fetchGroupChatData(eventId, lastEle.chat_id);
    }
    if(oldmsg.length === 0) {
        //console.log('Nothing in LocalStorage');
        fetchGroupChatData(eventId, 0);
    }
}

async function fetchGroupChatData(Grp_Id, lastChatId) {     //fetches chat for the selected group   //as well as member
    //console.log('fetchGroupChatData called successfully');
    //console.log(Grp_Id + "|||||" + lastChatId);
    try{
        const grpChatData = await fetch(`${backendAPI}/chatApp/get-chat-Data/${Grp_Id}`,{
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
    //console.log(element);
    const chatList = document.getElementsByClassName('chat-section')[0];
    const newli = document.createElement('li');
    newli.innerHTML = `${element.message_content}`;
    newli.setAttribute('id', element.chat_id);
    chatList.appendChild(newli);
}

//Leave Group Execution
async function leaveGrpExecution() {
    const grpToLeave = document.querySelector('.contact-selected').id;
    console.log(grpToLeave);
    try {
        const response = await fetch(`${backendAPI}/chatApp/leave-Group/${grpToLeave}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('token')
            }
        });
        if(response.ok) {
            const result = await response.json();
            console.log(result);
            fetchUserGroupData();
        }
        if(!response.ok) {
            const failure = await response.json();
            alert(failure);
        }
    } catch (error) {
        console.log(error);
    }
}

async function memberListToggle() {
    const grpId = document.querySelector('.contact-selected').id;
    console.log(grpId);
    try{
        const memberList = await fetch(`${backendAPI}/grpFind/groupMember/${grpId}`, {
            headers: {
                'authorization' : localStorage.getItem('token')
            }
        })
        if(memberList.ok) {
            const result = await memberList.json();
            const list = result.memberData;
            const currUserType = result.connectionType;
            PrintonList(list);
            
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
            console.log(list);
            console.log(currUserType);
        }
    } catch(error) {
        console.log(error);
    }
    const memberList = document.querySelector('.popup-container2');
    memberList.style.display = 'flex';
}

function PrintonList(membList) {
    console.log('in function');
    const memberList = document.querySelector('.memberList');
    memberList.innerHTML = '';
    membList.forEach(element => {
        const li = document.createElement('li');
        const span1 = document.createElement('span');
        const span2 = document.createElement('span');
        const div = document.createElement('div');
        const button1 = document.createElement('button');
        const button2 = document.createElement('button');

        li.classList.add('member-item');
        
        span1.classList.add('role_type');
        span1.innerHTML = `<b>${element.role_type}</b>`;

        span2.classList.add('member-name');
        span2.innerHTML = `<u>${element.user.name}</u> <u>${element.user.email}</u>`;

        div.classList.add('member-actions');

        button1.classList.add('upgrade-btn');
        button1.classList.add('admin');
        button1.innerHTML='Upgrade';
        //addEventListener

        button2.classList.add('remove-btn');
        button2.classList.add('admin');
        button2.innerHTML = 'Remove';
        //addEventListener

        div.appendChild(button1);
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
        }
    } else {
        memberDet.value = '';
        alert('Add a valid Value!');
    }
 
}

