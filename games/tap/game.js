import { auth, rtdb } from "../../firebase.js";

import {
ref,
set,
get,
onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const tapBtn = document.getElementById("tapBtn");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");

let score = 0;
let timeLeft = 900; // 15 Minutes

// Timer
const timer = setInterval(() => {

    timeLeft--;

    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;

    timerText.innerText =
        `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

    if(timeLeft <= 0){

        clearInterval(timer);

        tapBtn.disabled = true;

        alert("Tournament Finished");

    }

},1000);

// Tap
tapBtn.onclick = async()=>{

const user = auth.currentUser;

if(!user) return;

score++;

scoreText.innerText = score;

// Firebase Save

await set(

ref(rtdb,

"scores/tap/"+user.uid),

{

uid:user.uid,

score:score,

updatedAt:Date.now()

}

);

};

// Live Score Sync

onValue(

ref(rtdb,

"scores/tap/"+auth.currentUser?.uid),

(snapshot)=>{

if(snapshot.exists()){

score=snapshot.val().score;

scoreText.innerText=score;

}

}

);
// =============================
// Load Tournament Settings
// =============================

let tournamentId = "tap_today";
let tournament = null;

const tournamentRef = ref(rtdb, "tournaments/" + tournamentId);

const snap = await get(tournamentRef);

if(!snap.exists()){

alert("Tournament Not Available");

tapBtn.disabled = true;

throw new Error("Tournament Missing");

}

tournament = snap.val();

timeLeft = tournament.duration;

// =============================
// Player Join Check
// =============================

const joinedSnap = await get(

ref(rtdb,

"joined/"+tournamentId+"/"+auth.currentUser.uid)

);

if(!joinedSnap.exists()){

alert("Please Join Tournament First");

location.href="../../index.html";

}

// =============================
// Live Timer
// =============================

setInterval(()=>{

if(timeLeft<=0){

tapBtn.disabled=true;

timerText.innerHTML="Finished";

return;

}

timeLeft--;

let m=Math.floor(timeLeft/60);

let s=timeLeft%60;

timerText.innerHTML=

`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

},1000);
// ===============================
// Prize Calculation
// ===============================

function calculatePrize(entryFee, totalPlayers){

const totalCollection = entryFee * totalPlayers;

const platformProfit = Math.floor(totalCollection * 0.10);

const prizePool = totalCollection - platformProfit;

return{

totalCollection,

platformProfit,

prizePool

};

}

// ===============================
// Prize Distribution
// ===============================

function distributePrize(prizePool,winners){

let prizes=[];

if(winners<=0) return prizes;

// 1st 30%

prizes.push(Math.floor(prizePool*0.30));

// 2nd 20%

if(winners>=2)

prizes.push(Math.floor(prizePool*0.20));

// 3rd 15%

if(winners>=3)

prizes.push(Math.floor(prizePool*0.15));

// Remaining

let used=prizes.reduce((a,b)=>a+b,0);

let remain=prizePool-used;

let left=winners-3;

if(left>0){

let each=Math.floor(remain/left);

for(let i=0;i<left;i++){

prizes.push(each);

}

}

return prizes;

}
