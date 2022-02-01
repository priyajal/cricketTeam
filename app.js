const express = require("express");

const app = express();

module.exports = app;

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

let dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server has started");
    });
  } catch (e) {
    console.log(`DbError: ${e.message}`);

    process.exit(1);
  }
};

initializeDbAndServer();

//API GET ALL PLAYERS

const convertDbObjectToResponseObject = (dbData) => {
  return {
    playerId: dbData.player_id,

    playerName: dbData.player_name,

    jerseyNumber: dbData.jersey_number,

    role: dbData.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerDetailsQuery = `select

    *

    from cricket_team

   `;

  let playersArray = await db.all(getPlayerDetailsQuery);

  response.send(
    playersArray.map((eachplayer) =>
      convertDbObjectToResponseObject(eachplayer)
    )
  );
});

//API CREATE NEW PLAYER

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const addNewPlayer = `

   insert into cricket_team

   (player_name,jersey_number,role)

   values

   ('${playerName}',${jerseyNumber},'${role}')

   `;

  await db.run(addNewPlayer);

  response.send("Player Added to Team");
});

//API GET A PLAYER DETAILS

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerDetails = `

   select

   *

   from

   cricket_team

   where player_id = ${playerId}

 `;

  const playerDetails = await db.get(getPlayerDetails);

  response.send(convertDbObjectToResponseObject(playerDetails));
});

//API UPDATES PLAYER DETAILS

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerDetails = `

 update cricket_team

 set player_name = '${playerName}',

 jersey_number = ${jerseyNumber},

 role = '${role}'

 where player_id = ${playerId}



`;

  await db.run(updatePlayerDetails);

  response.send("Player Details Updated");
});

//API DELETE PLAYER

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerDetails = `

delete

from

cricket_team

where player_id = ${playerId} 

`;

  await db.run(deletePlayerDetails);

  response.send("Player Removed");
});
