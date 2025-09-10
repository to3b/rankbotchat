import fetch from "node-fetch";

// --- CONFIGURATION ---
const API_TOKEN = "Ay1yzdp9jAmiO5CPBUoAdSEPdFkPYG3sJCnFwf8x"; // Replace with your token
const PLAYER_ID = "steam:76561198330826708"; // Replace with full Steam/Epic ID

// Helper: get replays from Ballchasing
async function getReplays(playerId, playlist) {
  const url = `https://ballchasing.com/api/replays?player=${playerId}&count=10&playlist=${playlist}`;
  const res = await fetch(url, {
    headers: { Authorization: API_TOKEN }
  });
  return res.json();
}

// Helper: get replay details
async function getReplayDetails(replayId) {
  const url = `https://ballchasing.com/api/replays/${replayId}`;
  const res = await fetch(url, {
    headers: { Authorization: API_TOKEN }
  });
  return res.json();
}

// Serverless function handler
export default async function handler(req, res) {
  const playlists = {
    "1v1": "ranked-duels",
    "2v2": "ranked-doubles",
    "3v3": "ranked-standard"
  };

  const rankData = {};

  for (const [mode, playlistId] of Object.entries(playlists)) {
    try {
      const replays = await getReplays(PLAYER_ID, playlistId);
      if (!replays.length) {
        rankData[mode] = "No replays found";
        continue;
      }

      // Most recent replay
      const mostRecent = replays.sort((a, b) => new Date(b.created) - new Date(a.created))[0];
      const replay = await getReplayDetails(mostRecent.id);

      // Find the player
      let playerData = null;
      for (const team of ["blue", "orange"]) {
        playerData = replay[team].players.find(p => p.id.id === PLAYER_ID.split(":")[1]);
        if (playerData) break;
      }

      rankData[mode] = playerData?.rank?.name || "Rank not available";
    } catch (err) {
      rankData[mode] = "Error fetching data";
    }
  }

  res.status(200).json(rankData);
}
