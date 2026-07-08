import { rtdb } from "./firebase.js";

import {
ref,
get,
update
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ===============================
// Finish Tournament
// ===============================

export async function finishTournament(tournamentId){

const joinedRef = ref(rtdb, "joined/" + tournamentId);

const snap = await get(joinedRef);

if(!snap.exists()) return;

const players = Object.values(snap.val());

// Highest Score First
players.sort((a,b)=>b.score-a.score);

// Top 10 Winners
const winners = players.slice(0,10);

// Tournament Data
const tournamentSnap = await get(
ref(rtdb,"tournaments/"+tournamentId)
);

const tournament = tournamentSnap.val();

const totalCollection =
tournament.entry * players.length;

const platformProfit =
Math.floor(totalCollection * 0.10);

const prizePool =
totalCollection - platformProfit;
  // ===============================
// Prize Distribution
// ===============================

function calculatePrizes(prizePool, totalWinners){

let prizes=[];

const first=Math.floor(prizePool*0.30);
const second=Math.floor(prizePool*0.20);
const third=Math.floor(prizePool*0.15);

prizes.push(first);
prizes.push(second);
prizes.push(third);

let used=first+second+third;

let remain=prizePool-used;

let left=totalWinners-3;

if(left>0){

let each=Math.floor(remain/left);

for(let i=0;i<left;i++){

prizes.push(each);

}

}

return prizes;

}

const prizeList=calculatePrizes(prizePool,winners.length);

// ===============================
// Wallet Credit
// ===============================

for(let i=0;i<winners.length;i++){

const player=winners[i];

const amount=prizeList[i]||0;

const userRef=ref(rtdb,"users/"+player.uid);

const userSnap=await get(userRef);

if(userSnap.exists()){

const user=userSnap.val();

await update(userRef,{

wallet:(user.wallet||0)+amount,

totalWin:(user.totalWin||0)+amount

});

}

}

// ===============================
// Finish Tournament
// ===============================

await update(

ref(rtdb,"tournaments/"+tournamentId),

{

status:"finished",

completedAt:Date.now(),

totalPlayers:players.length,

platformProfit

}

);

console.log("Tournament Finished");
