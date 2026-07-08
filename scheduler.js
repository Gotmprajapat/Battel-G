// Daily Tournament Generator

export const dailySchedule = [

{time:"09:00",entry:10,max:20},
{time:"09:45",entry:10,max:20},
{time:"10:30",entry:20,max:40},
{time:"11:15",entry:10,max:20},
{time:"12:00",entry:10,max:60},
{time:"12:45",entry:20,max:40},
{time:"01:30",entry:10,max:20},
{time:"02:15",entry:30,max:60},
{time:"03:00",entry:10,max:20},
{time:"03:45",entry:10,max:100},
{time:"04:30",entry:20,max:40},
{time:"05:15",entry:10,max:20},
{time:"06:00",entry:40,max:100},
{time:"06:45",entry:10,max:20},
{time:"07:30",entry:20,max:60},
{time:"08:15",entry:10,max:20},
{time:"09:00",entry:10,max:100},
{time:"09:45",entry:20,max:40},
{time:"10:30",entry:10,max:20}

];
export function createTournament(entry,maxPlayers){

const totalCollection=entry*maxPlayers;

const profit=Math.floor(totalCollection*0.10);

const prizePool=totalCollection-profit;

return{

game:"Tap Challenge",

entry,

maxPlayers,

minPlayers:10,

duration:600,

profit,

prizePool,

status:"waiting"

};

}
