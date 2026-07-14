import { auth, rtdb } from "../firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
ref,
onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const wallet=document.getElementById("wallet");
const tournamentList=document.getElementById("tournamentList");

let currentUser=null;

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";

return;

}

currentUser=user;

loadWallet();

loadTournament();

});

function loadWallet(){

onValue(
ref(rtdb,"users/"+currentUser.uid+"/wallet"),
(snap)=>{

wallet.innerHTML=snap.val()||0;

});

}

function loadTournament(){

onValue(
ref(rtdb,"tournaments"),
(snapshot)=>{

tournamentList.innerHTML="";

if(!snapshot.exists()){

tournamentList.innerHTML="<h3>No Tournament</h3>";

return;

}

const data=snapshot.val();

Object.keys(data).forEach(id=>{

createCard(id,data[id]);

});

});

}

function createCard(id,t){

const card=document.createElement("div");

card.className="card";

card.innerHTML=`

<h3>${t.game}</h3>

<p>Entry ₹${t.entry}</p>

<p>Prize ₹${t.prizePool}</p>

<p>Players
${t.currentPlayers}/${t.maxPlayers}
</p>

<p id="time_${id}">
Loading...
</p>

<button
id="btn_${id}"
class="joinBtn">

JOIN

</button>

`;

tournamentList.appendChild(card);

}
// ========= UPDATE IMPORTS =========

import {
ref,
onValue,
get,
set,
runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


// ========= REPLACE createCard() WITH THIS =========

function createCard(id,t){

const card=document.createElement("div");

card.className="card";

card.innerHTML=`

<h3>${t.game}</h3>

<p>Entry ₹${t.entry}</p>

<p>Prize ₹${t.prizePool}</p>

<p>Players
<span id="players_${id}">
${t.currentPlayers}
</span>/${t.maxPlayers}
</p>

<p id="time_${id}">
Loading...
</p>

<button
id="btn_${id}"
class="joinBtn">

JOIN

</button>

`;

tournamentList.appendChild(card);

document
.getElementById("btn_"+id)
.onclick=()=>{

joinTournament(id,t);

};

onValue(

ref(rtdb,"tournaments/"+id+"/currentPlayers"),

(snap)=>{

document.getElementById("players_"+id).innerHTML=snap.val()||0;

}

);

}


// ========= ADD THIS BELOW createCard() =========

async function joinTournament(id,t){

const joinedRef=ref(

rtdb,

"joined/"+id+"/"+currentUser.uid

);

const joined=await get(joinedRef);

if(joined.exists()){

alert("Already Joined");

return;

}

const walletRef=ref(

rtdb,

"users/"+currentUser.uid+"/wallet"

);

const walletSnap=await get(walletRef);

const walletMoney=walletSnap.val()||0;

if(walletMoney<t.entry){

alert("Insufficient Balance");

return;

}

// Wallet Minus

await runTransaction(

walletRef,

(value)=>{

return (value||0)-t.entry;

}

);

// Save Joined

await set(

joinedRef,

{

uid:currentUser.uid,

game:t.game,

entry:t.entry,

joinTime:Date.now(),

status:"waiting"

}

);

// Player Count +1

await runTransaction(

ref(rtdb,"tournaments/"+id+"/currentPlayers"),

(value)=>{

return (value||0)+1;

}

);

document.getElementById("btn_"+id).innerHTML="WAITING";

document.getElementById("btn_"+id).disabled=true;

alert("Tournament Joined");

      }
// ============================
// PART 3
// Countdown + Play System
// ============================

function startTimer(id,startTime,duration){

const time=document.getElementById("time_"+id);

const btn=document.getElementById("btn_"+id);

const timer=setInterval(async()=>{

const now=Date.now();

const endTime=startTime+duration;

const joinedSnap=await get(
ref(rtdb,"joined/"+id+"/"+currentUser.uid)
);

const joined=joinedSnap.exists();

if(now<startTime){

const diff=startTime-now;

const h=Math.floor(diff/3600000);

const m=Math.floor((diff%3600000)/60000);

const s=Math.floor((diff%60000)/1000);

time.innerHTML=
`⏳ ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

if(joined){

btn.innerHTML="WAITING";

btn.disabled=true;

}

}

else if(now>=startTime && now<endTime){

time.innerHTML="🔴 LIVE";

if(joined){

btn.innerHTML="PLAY";

btn.disabled=false;

btn.className="playBtn";

btn.onclick=()=>{

window.location.href=
"games/tap/index.html?id="+id;

};

}else{

btn.innerHTML="JOIN CLOSED";

btn.disabled=true;

}

}

else{

time.innerHTML="✅ FINISHED";

btn.innerHTML="FINISHED";

btn.disabled=true;

clearInterval(timer);

}

},1000);

}



// ============================
// UPDATE CARD
// ============================

function createCard(id,t){

const card=document.createElement("div");

card.className="card";

card.innerHTML=`

<h3>${t.game}</h3>

<p>Entry ₹${t.entry}</p>

<p>Prize ₹${t.prizePool}</p>

<p>

Players

<span id="players_${id}">

${t.currentPlayers}

</span>

/

${t.maxPlayers}

</p>

<p id="time_${id}">

Loading...

</p>

<button

id="btn_${id}"

class="joinBtn">

JOIN

</button>

`;

tournamentList.appendChild(card);

onValue(

ref(rtdb,"tournaments/"+id+"/currentPlayers"),

snap=>{

document.getElementById("players_"+id).innerHTML=snap.val()||0;

}

);

document

.getElementById("btn_"+id)

.onclick=()=>{

joinTournament(id,t);

};

startTimer(

id,

t.startTime,

t.duration

);

}
// ==============================
// PART 4
// Live Tournament + My Tournament
// ==============================

const liveBox=document.getElementById("liveBox");

function loadLiveTournament(){

onValue(ref(rtdb,"tournaments"),(snapshot)=>{

if(!snapshot.exists()){

liveBox.innerHTML="<h3>No Live Tournament</h3>";

return;

}

const data=snapshot.val();

let live=null;

Object.keys(data).forEach(id=>{

const t=data[id];

const now=Date.now();

if(now>=t.startTime && now<=t.startTime+t.duration){

live={

id:id,

...t

};

}

});

if(live){

liveBox.innerHTML=`

<h3>${live.game}</h3>

<p>Entry ₹${live.entry}</p>

<p>Prize ₹${live.prizePool}</p>

<p>

Players

${live.currentPlayers}/${live.maxPlayers}

</p>

<p style="color:#00ff88">

LIVE NOW 🔴

</p>

`;

}else{

liveBox.innerHTML=`

<h3>

No Live Tournament

</h3>

`;

}

});

}

loadLiveTournament();



// ==============================
// SAVE MY TOURNAMENT
// ==============================

async function saveMyTournament(id,t){

await set(

ref(

rtdb,

"users/"+currentUser.uid+"/myTournament/"+id

),

{

game:t.game,

entry:t.entry,

prize:t.prizePool,

startTime:t.startTime,

duration:t.duration,

status:"waiting"

}

);

}



// ==============================
// UPDATE joinTournament()
// ONLY ADD THIS BEFORE
// alert("Tournament Joined");
// ==============================

await saveMyTournament(id,t);



// ==============================
// AUTO PLAY PAGE
// ==============================

function openGame(id){

window.location.href=

"games/tap/index.html?id="+id;

}



// ==============================
// UPDATE startTimer()
// REPLACE PLAY onclick
// ==============================

btn.onclick=()=>{

openGame(id);

};
// =====================================
// PART 5
// Winner + Prize Distribution
// =====================================

import {
update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

async function finishTournament(id){

const scoreSnap=await get(
ref(rtdb,"scores/"+id)
);

if(!scoreSnap.exists()) return;

const tournamentSnap=await get(
ref(rtdb,"tournaments/"+id)
);

const tournament=tournamentSnap.val();

const scores=[];

Object.keys(scoreSnap.val()).forEach(uid=>{

scores.push({

uid:uid,

score:scoreSnap.val()[uid].score

});

});

scores.sort((a,b)=>b.score-a.score);

const pool=tournament.prizePool;

const prize=[];

prize[0]=Math.floor(pool*0.35);

prize[1]=Math.floor(pool*0.20);

prize[2]=Math.floor(pool*0.15);

let remain=

pool-

(prize[0]+prize[1]+prize[2]);

const left=Math.max(

scores.length-3,

0

);

const each=

left>0?

Math.floor(remain/left):0;

for(let i=3;i<scores.length;i++){

prize[i]=each;

}

for(let i=0;i<scores.length;i++){

const uid=scores[i].uid;

const amount=prize[i]||0;

await runTransaction(

ref(rtdb,"users/"+uid+"/wallet"),

value=>(value||0)+amount

);

await set(

ref(rtdb,"results/"+id+"/"+uid),

{

rank:i+1,

score:scores[i].score,

prize:amount

}

);

}

await update(

ref(rtdb,"tournaments/"+id),

{

status:"finished"

}

);

}



// =====================================
// AUTO CHECK EVERY 30 SEC
// =====================================

setInterval(async()=>{

const snap=await get(

ref(rtdb,"tournaments")

);

if(!snap.exists()) return;

const data=snap.val();

Object.keys(data).forEach(id=>{

const t=data[id];

const end=t.startTime+t.duration;

if(

Date.now()>end &&

t.status!="finished"

){

finishTournament(id);

}

});

},30000);
