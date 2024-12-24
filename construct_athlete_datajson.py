import json
import random
from datetime import date, timedelta

files = ['all_nfl_players.json', 'nba_players_usa.json', 'nba_players_canada.json', 
         'nba_players_serbia.json', 'nba_players_cameroon.json', 'nba_players_spain.json',
         'nba_players_france.json']

athletes = []
for file_name in files:
    with open(f'./{file_name}', 'r') as f:
        data = json.load(f)
        if file_name != 'all_nfl_players.json':
            data = data.get("response", {})
        for athlete in data:
            _athlete = {}
            if file_name != 'all_nfl_players.json':
                if athlete.get("leagues", {}).get("standard", None) != None and athlete.get("leagues").get("standard").get("active") == True and athlete.get("nba", None) != None and athlete["height"]["feets"] != None and athlete["height"]["inches"] != None:
                    _athlete["full_name"] = f"{athlete["firstname"]} {athlete["lastname"]}"
                    _athlete["first_name"] = athlete["firstname"]
                    _athlete["last_name"] = athlete["lastname"]
                    _athlete["dob"] = athlete["birth"]["date"]
                    _athlete["experience"] = int(athlete["nba"]["pro"])
                    _athlete["height_feet"] = int(athlete["height"]["feets"])
                    _athlete["height_inches"] = int(athlete["height"]["inches"])
                    _athlete["weight"] = int(athlete["weight"]["pounds"])
                    _athlete["league"] = "NBA"
                    _athlete["college"] = athlete.get("college", "NA")
                    _athlete["position"] = athlete.get("leagues").get("standard").get("pos", "NA")
                    athletes.append(_athlete)
            else:
                if athlete.get("Active", False) == True and athlete.get("Position") in ["QB", "WR", "RB", "TE"]:
                    _athlete["full_name"] = f"{athlete["FirstName"]} {athlete["LastName"]}"
                    _athlete["first_name"] = athlete["FirstName"]
                    _athlete["last_name"] = athlete["LastName"]
                    _athlete["dob"] = athlete["BirthDate"][0:10]
                    _athlete["experience"] = int(athlete["Experience"])
                    _athlete["height_feet"] = athlete["HeightFeet"]
                    _athlete["height_inches"] = athlete["HeightInches"]
                    _athlete["weight"] = int(athlete["Weight"])
                    _athlete["league"] = "NFL"
                    _athlete["college"] = athlete.get("College", "NA")
                    _athlete["position"] = athlete["Position"]
                    athletes.append(_athlete)

# randomize the list of athletes
random.shuffle(athletes)
# today = date.today()
# for idx in range(len(athletes)):
#     athledle_date = today + timedelta(days=idx+1)
#     athletes[idx]["athledle_date"] = athledle_date.strftime('%Y-%m-%d')

with open('output_athlete.json', 'w') as f:
    output_json = json.dumps(athletes)
    f.write(output_json)
