import { auth, rtdb } from "../firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
ref,
get,
onValue,
runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const wallet=document.getElementById("wallet");
const tournamentList=document.getElementById("tournamentList");
const liveBox=document.getElementById("liveBox");

// Profile
document.getElementById("profileBtn").onclick=()=>{
location.href="profile.html";
};

// My Tournament
document.getElementById("myBtn").onclick=()=>{
location.href="my-tournaments.html";
};

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

// Wallet

onValue(ref(rtdb,"users/"+user.uid+"/wallet"),(snap)=>{

wallet.innerHTML=snap.val()||0;

});

// Tournament

loadTournament(user.uid);

});

async function loadTournament(uid){

const snap=await get(ref(rtdb,"tournaments"));

if(!snap.exists()){

tournamentList.innerHTML="<h3>No Tournament</h3>";

return;

}

const data=snap.val();

tournamentList.innerHTML="";

Object.keys(data).forEach(id=>{

const t=data[id];

const div=document.createElement("div");

div.className="card";

div.innerHTML=`

<h3>${t.game}</h3>

<p>Entry ₹${t.entry}</p>

<p>Prize ₹${t.prizePool}</p>

<p>Players ${t.currentPlayers}/${t.maxPlayers}</p>

<p id="time_${id}"></p>

<button class="joinBtn"

id="btn_${id}">

JOIN

</button>

`;

tournamentList.appendChild(div);

timer(id,t.startTime);

updateButton(uid,id,t.startTime);

document

.getElementById("btn_"+id)

.onclick=()=>{

joinTournament(uid,id,t.entry);

};

});

}

async function joinTournament(uid,id,entry){

const walletRef=ref(rtdb,"users/"+uid+"/wallet");

await runTransaction(walletRef,(money)=>{

if((money||0)>=entry){

return money-entry;

}

return;

});

alert("Tournament Joined");

      }

// ===============================
// Tournament Timer
// ===============================

function timer(id,startTime){

const time=document.getElementById("time_"+id);
const btn=document.getElementById("btn_"+id);

setInterval(()=>{

const now=Date.now();

const diff=startTime-now;

if(diff>0){

const h=Math.floor(diff/3600000);
const m=Math.floor((diff%3600000)/60000);
const s=Math.floor((diff%60000)/1000);

time.innerHTML=`Starts In ${h}:${m}:${s}`;
btn.innerHTML="WAITING";
btn.disabled=true;

}else{

const end=startTime+(10*60*1000);

if(now<end){

time.innerHTML="LIVE 🔴";
btn.innerHTML="PLAY";
btn.disabled=false;

}else{

time.innerHTML="Finished";
btn.innerHTML="FINISHED";
btn.disabled=true;

}

}

},1000);

}
// ===============================
// Check Joined Tournament
// ===============================

async function checkJoined(uid,tournamentId){

const snap=await get(
ref(rtdb,"joined/"+tournamentId+"/"+uid)
);

return snap.exists();

}

// ===============================
// Update Button
// ===============================

async function updateButton(uid,id,startTime){

const btn=document.getElementById("btn_"+id);

const joined=await checkJoined(uid,id);

const now=Date.now();

const end=startTime+(10*60*1000);

if(!joined){

if(now<startTime){

btn.innerHTML="JOIN";

btn.disabled=false;

}else{

btn.innerHTML="JOIN CLOSED";

btn.disabled=true;

}

return;

}

if(now<startTime){

btn.innerHTML="WAITING";

btn.disabled=true;

}else if(now<end){

btn.innerHTML="PLAY";

btn.disabled=false;

btn.onclick=()=>{

location.href="games/tap/index.html?tournament="+id;

};

}else{

btn.innerHTML="FINISHED";

btn.disabled=true;

}

      }
