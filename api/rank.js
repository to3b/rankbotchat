import fetch from "node-fetch";

const API_TOKEN = "Ay1yzdp9jAmiO5CPBUoAdSEPdFkPYG3sJCnFwf8x";
const PLAYER_ID = "epic:2ff0b84336df49ba827f6dab9e23d015"; // Use full Epic/Steam ID

// Helper to fetch JSON safely
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  if (!res.ok) {
    console.log(`API error at ${url}: ${res.status} ${res.statusText}`);
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json();
}

// Get latest replays
async function getReplays(playerId, playlist) {
  const url = `https://ballchasing.com/api/replays?player=${playerId}&count=10&playlist=${playlist}`;
  return fetchJSON(url);
}

// Get replay details
async function getReplayDetails(replayId) {
  const url = `https://ballchasing.com/api/replays/${replayId}`;
  return fetchJSON(url);
}

// Main handler
export default async function handler(req, res) {
  const playlists = {
    "1v1": "ranked-duels",
    "2v2": "ranked-doubles",
    "3v3": "ranked-standard",
  };

  const rankData = {};

  try {
    for (const [mode, playlistId] of Object.entries(playlists)) {
      console.log(`Fetching ${mode} replays for ${PLAYER_ID}...`);

      let replays;
      try {
        replays = await getReplays(PLAYER_ID, playlistId);
        console.log(`Found ${replays.length} ${mode} replays`);
      } catch (err) {
        console.log(`Error fetching replays for ${mode}:`, err.message);
        rankData[mode] = "Error fetching replays";
        continue;
      }

      if (!replays.length) {
        rankData[mode] = "No replays found";
        continue;
      }

      // Most recent replay
      const mostRecent = replays.sort((a, b) => new Date(b.created) - new Date(a.created))[0];

      let replay;
      try {
        replay = await getReplayDetails(mostRecent.id);
      } catch (err) {
        console.log(`Error fetching replay details for ${mode}:`, err.message);
        rankData[mode] = "Error fetching replay details";
        continue;
      }

      // Find player in teams
      let playerData = null;
      for (const team of ["blue", "orange"]) {
        playerData = replay[team].players.find(
          (p) => p.id.id === PLAYER_ID.split(":")[1]
        );
        if (playerData) break;
      }

      rankData[mode] = playerData?.rank?.name || "Rank not available";
    }

    res.status(200).json(rankData);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: err.message });
  }
}
