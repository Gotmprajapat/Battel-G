import { auth } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

onAuthStateChanged(auth,(user)=>{

setTimeout(()=>{

if(user){

window.location.href="home.html";

}else{

window.location.href="login.html";

}

},2000);

});
