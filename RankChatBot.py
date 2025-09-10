from ballchasing import BallchasingApi
import json

API_TOKEN = "Ay1yzdp9jAmiO5CPBUoAdSEPdFkPYG3sJCnFwf8x"
PLAYER_ID = "steam:76561198330826708"

api = BallchasingApi(API_TOKEN)

def handler(event, context=None):
    playlists = {
        '1v1': 'ranked-duels',
        '2v2': 'ranked-doubles',
        '3v3': 'ranked-standard'
    }
    rank_data = {}

    for mode_name, playlist_id in playlists.items():
        replays = list(api.get_replays(player_id=PLAYER_ID, count=10, playlist=[playlist_id]))
        if not replays:
            rank_data[mode_name] = "No replays found"
            continue

        most_recent = sorted(replays, key=lambda x: x['created'], reverse=True)[0]
        replay = api.get_replay(most_recent['id'])

        player_data = None
        for team in ['blue', 'orange']:
            for p in replay[team]['players']:
                if p['id']['id'] == PLAYER_ID.split(":")[1]:
                    player_data = p
                    break
            if player_data:
                break

        rank_name = player_data.get('rank', {}).get('name', 'Rank not available') if player_data else "Player not found"
        rank_data[mode_name] = rank_name

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(rank_data)
    }
