import { auth, rtdb } from "./firebase.js";

import {
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
ref,
set
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const name=document.getElementById("name");
const email=document.getElementById("email");
const password=document.getElementById("password");
const registerBtn=document.getElementById("registerBtn");

registerBtn.onclick=()=>{

if(name.value==""||email.value==""||password.value==""){

alert("Fill all fields");

return;

}

createUserWithEmailAndPassword(
auth,
email.value,
password.value
)

.then(async(userCredential)=>{

const user=userCredential.user;

await set(ref(rtdb,"users/"+user.uid),{

uid:user.uid,

name:name.value,

email:email.value,

wallet:0,

totalMatches:0,

totalWins:0,

totalEarning:0,

createdAt:Date.now()

});

window.location.href="home.html";

})

.catch((error)=>{

alert(error.message);

});

};
