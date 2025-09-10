from ballchasing import BallchasingApi

# --- CONFIGURATION ---
PLAYER_ID = "steam:76561198330826708"  # Make sure this is correct

# --- INITIALIZE API ---
API_TOKEN = "Ay1yzdp9jAmiO5CPBUoAdSEPdFkPYG3sJCnFwf8x"  # just the key as a string
api = BallchasingApi(API_TOKEN)

rank = {}

playlists = {
    0: ('ranked-duels', 'Ranked 1v1'),
    1: ('ranked-doubles', 'Ranked 2v2'),
    2: ('ranked-standard', 'Ranked 3v3')
}

for count in range(3):
    playlist_id, mode_name = playlists[count]

    # Fetch replays
    replays = list(api.get_replays(player_id=PLAYER_ID, count=10, playlist=[playlist_id]))

    if not replays:
        rank[mode_name] = "No replays found"
        continue

    # Get most recent replay
    most_recent = sorted(replays, key=lambda x: x['created'], reverse=True)[0]
    replay = api.get_replay(most_recent['id'])

    # Find the player
    player_data = None
    for team in ['blue', 'orange']:
        for p in replay[team]['players']:
            if p['id']['id'] == PLAYER_ID.split(":")[1]:
                player_data = p
                break
        if player_data:
            break

    # Safely get rank
    if player_data:
        rank_name = player_data.get('rank', {}).get('name', 'Rank not available')
        rank[mode_name] = rank_name
    else:
        rank[mode_name] = "Player not found"

# Print results once
htmlText = ""
for mode, r in rank.items():
    print(f"{mode}: {r}\n")
    htmlText = f"{mode}: {r} \n" + htmlText


# Define your HTML content
html_content = htmlText

# Write to a file
with open("index.html", "w", encoding="utf-8") as file:
    file.write(html_content)

print("HTML file created!")
