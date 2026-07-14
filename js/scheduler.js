import { rtdb } from "../firebase.js";

import {
ref,
set
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const games=[
"Tap Challenge",
"Aim Challenge",
"Memory Challenge",
"Reaction Challenge",
"Color Challenge"
];

const entries=[10,10,10,20,10,40,60,100];
const players=[10,15,20,25];

function random(arr){
return arr[Math.floor(Math.random()*arr.length)];
}

async function createTodayTournament(){

const now=new Date();

const start=new Date();

start.setHours(9,0,0,0);

let index=1;

while(start.getHours()<23){

const id="T"+String(index).padStart(3,"0");

const game=random(games);

const entry=random(entries);

const max=random(players);

const prize=Math.floor(entry*max*0.9);

await set(ref(rtdb,"tournaments/"+id),{

id:id,

game:game,

entry:entry,

maxPlayers:max,

currentPlayers:0,

prizePool:prize,

status:"waiting",

startTime:start.getTime(),

duration:600000

});

start.setMinutes(start.getMinutes()+45);

index++;

}

alert("Today's tournaments created");

}

createTodayTournament();
