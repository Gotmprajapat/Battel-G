import { auth, db, rtdb } from "./firebase.js";

import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged,
updateProfile,
signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const splashScreen = document.getElementById("splashScreen");
const authScreen = document.getElementById("authScreen");
const homeScreen = document.getElementById("homeScreen");

const authTitle = document.getElementById("authTitle");
const authBtn = document.getElementById("authBtn");
const switchBtn = document.getElementById("switchBtn");

const email = document.getElementById("email");
const password = document.getElementById("password");
const username = document.getElementById("username");

let isLogin = true;

// Splash
setTimeout(() => {
    splashScreen.classList.add("hidden");
}, 1500);

// Login/Register Switch
switchBtn.onclick = () => {

    isLogin = !isLogin;

    if (isLogin) {
        authTitle.innerText = "Login";
        authBtn.innerText = "Login";
        username.classList.add("hidden");
        switchBtn.innerText = "Register";
    } else {
        authTitle.innerText = "Register";
        authBtn.innerText = "Create Account";
        username.classList.remove("hidden");
        switchBtn.innerText = "Login";
    }

};

// Login/Register Button
authBtn.onclick = async () => {

    if (isLogin) {

        try {

            await signInWithEmailAndPassword(
                auth,
                email.value,
                password.value
            );

        } catch (e) {

            alert(e.message);

        }

    } else {

        try {

            const userCred =
            await createUserWithEmailAndPassword(
                auth,
                email.value,
                password.value
            );

            await updateProfile(userCred.user, {
                displayName: username.value
            });

            await setDoc(
                doc(db, "users", userCred.user.uid),
                {
                    uid: userCred.user.uid,
                    name: username.value,
                    email: email.value,
                    wallet: 0,
                    createdAt: Date.now()
                }
            );

        } catch (e) {

            alert(e.message);

        }

    }

};

// Auto Login
onAuthStateChanged(auth, async(user)=>{

    splashScreen.classList.add("hidden");

    if(user){

        authScreen.classList.add("hidden");
        homeScreen.classList.remove("hidden");

    }else{

        authScreen.classList.remove("hidden");
        homeScreen.classList.add("hidden");

    }

});
import {
ref,
get,
set,
update,
onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const walletText = document.getElementById("walletText");
const profileWallet = document.getElementById("profileWallet");
const profileName = document.getElementById("profileName");

const tournamentContainer =
document.getElementById("tournamentContainer");

const myTournamentContainer =
document.getElementById("myTournamentContainer");

// --------------------
// Load User
// --------------------

async function loadUser(){

const user=auth.currentUser;

if(!user) return;

const snap=await getDoc(doc(db,"users",user.uid));

if(!snap.exists()) return;

const data=snap.data();

profileName.innerText=data.name;

walletText.innerText="₹"+(data.wallet||0);

profileWallet.innerText=
"Wallet ₹"+(data.wallet||0);

}

// --------------------
// Tournament List
// --------------------

const tournaments=[

{

id:"tap1",

game:"Tap Challenge",

entry:10,

prize:150,

maxPlayers:20,

duration:15,

startHour:10,

startMinute:0

},

{

id:"tap2",

game:"Tap Challenge",

entry:20,

prize:400,

maxPlayers:50,

duration:30,

startHour:18,

startMinute:0

}

];

// --------------------
// Load Tournament
// --------------------

function loadTournament(){

tournamentContainer.innerHTML="";

tournaments.forEach(t=>{

const card=document.createElement("div");

card.className="tournamentCard";

card.innerHTML=`

<h3>${t.game}</h3>

<p>Entry ₹${t.entry}</p>

<p>Prize ₹${t.prize}</p>

<p>

Players

<span id="players_${t.id}">

0/${t.maxPlayers}

</span>

</p>

<p>

Time

<span id="time_${t.id}">

Loading...

</span>

</p>

<button

onclick="joinTournament('${t.id}')"

>

Join

</button>

`;

tournamentContainer.appendChild(card);

});

}

loadTournament();

// --------------------
// After Login
// --------------------

onAuthStateChanged(auth,(user)=>{

if(user){

loadUser();

}

});
// ----------------------------
// Live Tournament Timer
// ----------------------------
import {
doc,
setDoc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
function updateTimers(){

const now = new Date();

tournaments.forEach(t=>{

const timer=document.getElementById("time_"+t.id);

if(!timer) return;

const start=new Date();

start.setHours(t.startHour);
start.setMinutes(t.startMinute);
start.setSeconds(0);

const end=new Date(start);

end.setMinutes(end.getMinutes()+t.duration);

if(now<start){

const diff=start-now;

const h=Math.floor(diff/1000/60/60);

const m=Math.floor(diff/1000/60)%60;

const s=Math.floor(diff/1000)%60;

timer.innerHTML=

`Starts In ${h}h ${m}m ${s}s`;

}

else if(now>=start && now<=end){

const diff=end-now;

const m=Math.floor(diff/1000/60);

const s=Math.floor(diff/1000)%60;

timer.innerHTML=

`LIVE ${m}m ${s}s`;

}

else{

timer.innerHTML="Finished";

}

});

}

setInterval(updateTimers,1000);

updateTimers();

// ----------------------------
// Join Tournament
// ----------------------------

window.joinTournament=async(id)=>{

const user=auth.currentUser;

if(!user){

alert("Please Login");

return;

}

const tournament=

tournaments.find(x=>x.id===id);

const snap=

await getDoc(doc(db,"users",user.uid));

const data=snap.data();

if(data.wallet<tournament.entry){

alert("Insufficient Wallet Balance");

return;

}

// Wallet Cut

await updateDoc(

doc(db,"users",user.uid),

{

wallet:data.wallet-tournament.entry

}

);

// Save Joined Tournament

await set(

ref(rtdb,

"joined/"+id+"/"+user.uid),

{

uid:user.uid,

name:data.name,

joinedAt:Date.now(),

score:0

}

);

alert("Tournament Joined");

loadUser();

loadMyTournament();

};

// ----------------------------
// My Tournament
// ----------------------------

async function loadMyTournament(){

const user=auth.currentUser;

if(!user) return;

myTournamentContainer.innerHTML="";

for(const t of tournaments){

const snap=await get(

ref(rtdb,

"joined/"+t.id+"/"+user.uid)

);

if(snap.exists()){

const div=document.createElement("div");

div.className="tournamentCard";

div.innerHTML=`

<h3>${t.game}</h3>

<p>

Entry ₹${t.entry}

</p>

<button

onclick="openGame('${t.id}')">

Play

</button>

`;

myTournamentContainer.appendChild(div);

}

}

}

onAuthStateChanged(auth,user=>{

if(user){

loadMyTournament();

}

});
// ================================
// Profile Navigation
// ================================

const profileScreen = document.getElementById("profileScreen");

document.getElementById("profileBtn").onclick = () => {

homeScreen.classList.add("hidden");

profileScreen.classList.remove("hidden");

};

document.getElementById("backHome").onclick = () => {

profileScreen.classList.add("hidden");

homeScreen.classList.remove("hidden");

};

// ================================
// Deposit
// ================================

document.getElementById("depositBtn").onclick=()=>{

document.getElementById("depositPopup")

.classList.remove("hidden");

};

document.getElementById("submitDeposit")

.onclick=async()=>{

const user=auth.currentUser;

const amount=

Number(document.getElementById("depositAmount").value);

const utr=

document.getElementById("utrNumber").value;

if(amount<10){

alert("Minimum Deposit ₹10");

return;

}

await set(

ref(rtdb,

"depositRequests/"+user.uid),

{

uid:user.uid,

amount,

utr,

status:"Pending",

time:Date.now()

}

);

alert("Deposit Request Submitted");

};

// ================================
// Withdraw
// ================================

document.getElementById("withdrawBtn").onclick=()=>{

document.getElementById("withdrawPopup")

.classList.remove("hidden");

};

document.getElementById("submitWithdraw")

.onclick=async()=>{

const user=auth.currentUser;

const amount=

Number(document.getElementById("withdrawAmount").value);

const upi=

document.getElementById("upiId").value;

const snap=

await getDoc(doc(db,"users",user.uid));

const wallet=snap.data().wallet;

if(amount<50){

alert("Minimum Withdraw ₹50");

return;

}

if(wallet<amount){

alert("Wallet Balance Low");

return;

}

await set(

ref(rtdb,

"withdrawRequests/"+user.uid),

{

uid:user.uid,

amount,

upi,

status:"Pending",

time:Date.now()

}

);

alert("Withdraw Request Submitted");

};

// ================================
// Logout
// ================================

document.getElementById("logoutBtn").onclick=()=>{

signOut(auth);

};

// ================================
// Support
// ================================

document.getElementById("supportBtn").onclick=()=>{

window.open(

"https://t.me/YOUR_USERNAME",

"_blank"

);

};

// ================================
// Open Game
// ================================

window.openGame=(game)=>{

location.href=

`games/${game}/index.html`;

};
