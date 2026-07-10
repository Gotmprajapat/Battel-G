import { auth } from "./firebase.js";

import {

signInWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const email=document.getElementById("email");

const password=document.getElementById("password");

const loginBtn=document.getElementById("loginBtn");

loginBtn.onclick=()=>{

if(email.value==""||password.value==""){

alert("Fill All Fields");

return;

}

signInWithEmailAndPassword(

auth,

email.value,

password.value

)

.then(()=>{

window.location.href="home.html";

})

.catch((error)=>{

alert(error.message);

});

};
