const backendAPI = "http://localhost:3200";
async function checkSignUp(event) {
    event.preventDefault();

    const username = document.querySelector('#UserName').value;
    const email = document.querySelector('#UserMail').value;
    const number = document.querySelector('#UserNumber').value;
    const password = document.querySelector('#Password').value;
    const rePass = document.querySelector('#Repeat-Password').value;
    if(rePass !== password) {
        console.log('Incorrect Password Detected');
        const errSpan = document.querySelector('#error');
        errSpan.innerHTML = "<span style='color: red;'>" + "Password does not match!</span>"
    } else {
        console.log('Proceeding');
        console.log(username, " ", email, " ", number, " ", password);
        try {
            const response = await fetch(`${backendAPI}/user/create-user`, {
                method:"POST",
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({username, email, number, password})
            });
            console.log("Request Sent!");
            if(response.ok) {
                alert('User Created!');
                window.location.href=`${backendAPI}/user/login`;
            } else {
                if(response.status === 409){
                    alert("Email or Number already in Use!");
                } else if(response.status === 500) {
                    alert("Server Down for some Time!");
                }
            }

        } catch {
            alert("Server Unavailable!");
        }
    }
}

async function checkLogin(event) {
    event.preventDefault();
    const email = document.querySelector('#UserMail').value;
    const password = document.querySelector('#Password').value;

    try {
        const response = await fetch(`${backendAPI}/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({email, password})
        });
        console.log('Login Request Sent!');
        if(response.ok) {
            response.json()
            .then(result => {
                console.log(result);
                console.log(result.userData);
                localStorage.setItem('token', result.token);
                localStorage.setItem('userData', result.userData);
                alert(result.message);
                window.location.href=`${backendAPI}/chatApp`;
            })
            .catch(err => alert(err));
        }
        else if(!response.ok) {
            response.json().then(result => {
                alert(result.message);
            }).catch(err => console.log(err));
        }
    } catch(err) {
        console.log(err);
    }
}