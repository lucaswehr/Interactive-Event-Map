#--------------------------------------------------------------------------------------------------------#
#------------------------------------------FLASK IMPLAMENTATION------------------------------------------#
#--------------------------------------------------------------------------------------------------------#

#------------------------------------------------------------#
# Note: Flask is a bridge between my database and my frontend
#--------------------------------------------------------------------------------------------#
# Goal of Flask: Retrieve data from SQLite and processes it so that it can be ready for React
#--------------------------------------------------------------------------------------------#

from sqlalchemy import inspect, and_
from flask import Flask, jsonify, request, Response, send_from_directory
from create_db import session, Event, engine, UserEvent
from flask_cors import CORS # --> allows React to make requests to my flask without being blocked by browsers
from dotenv import load_dotenv # --> I stored my api key in a seperate file so that its private and no one can see it. This allows me do that
import os # --> allows me to access variables outside of this file (i.e API_KEY)
import requests # --> allows me to make API requests from my backend
from sqlalchemy.orm import sessionmaker # --> Event: actual table that i created. Engine: My connection to SQLite
from datetime import datetime, timedelta,date
from zoneinfo import ZoneInfo
import redis # --> allows me to use cache my data (If this project was ever to scale to 1000s of people, querying thousands of times
# is costly and drains preformance. Caching allows me to only query something from the database once, and if other people
# ask for something like "I want 50 events in seattle" many times, the cached data (which is seattle and 50 events for this example)
# will retrive it instantly, completely skipping the querying and database entirely.)
import json
import re
import uuid
from werkzeug.utils import secure_filename


load_dotenv() # --> gets my hidden api key

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

cache = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, db=0) # --> connects to redis for caching

try:
    cache.ping()
    print("Redis is connected!")
    
except redis.exceptions.ConnectionError:
    print("Failed to connect to Redis.")

Session = sessionmaker(bind=engine)

API_KEY = os.getenv("TICKET_MASTER_API_KEY")
GEO_KEY = os.getenv("GEO_KEY")

app = Flask(__name__)

# Creates the file path to uploads i.e. moodmapproject/streetmoodmap/backend/uploads/etc
# Guarentees that the uploads file exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

print("Count in MySQL before fetch:", session.query(Event).count())

CORS(app) # --> browsers block two different ports being ran i.e React and Flask. 
# this allows my Flask API to call React as well. Kind of like a 2 in 1 button 
# #instead of manually running both ports

def to_standard_time(time_24):
    hour, minute = map(int, time_24.split(":"))
    period = "AM" if hour < 12 else "PM"
    hour = hour % 12
    if hour == 0:
        hour = 12
    return f"{hour}:{minute:02d} {period}"

#------------------------------------------------------------------------------------------------------#
#---------------------------------------WEBSITE EXTENSIONS---------------------------------------------#
#------------------------------------------------------------------------------------------------------#
@app.route('/')
def hello():
    return "Event Map Running"

#---------------------------------CONVERTS DATA TO JSON-------------------------------------#

@app.route('/events') # --> Returns all stored maps in JSON which is then 
# ready for React. We need to convert to JSON so that React can understand it
def get_events():
    
    session = Session() # --> Opens a new database session to interact with mySQL

    now = datetime.utcnow()
    session.query(Event).filter(Event.start_time < now).delete() # deletes old events in the database
    session.commit()

    with Session() as session: # --> automatically closes the session
      events = session.query(Event).all()

      return jsonify([{ # --> loops through each row and jsonifies it 
         "id": e.id,
         "name": e.name,
         "venue": e.venue,
         "venue_city": e.venue_city,
         "latitude": e.latitude,
         "longitude": e.longitude,
         "start_time": e.start_time.strftime("%m-%d-%Y | %I:%M %p %Z"),  # formats my time so that its not in military time and have the time zone
         "image_url": e.image_url,
         "predicted_crowd": e.predicted_crowd,
         "predicted_vibe": e.predicted_vibe,
         "predicted_noise": e.predicted_noise,
         "description": e.description,
         "genre": e.genre,
         "url": e.url,
         "ageRestriction": e.ageRestriction
      } for e in events])

#-------------------------------CONVERTS DATA TO JSON END----------------------------------#


#----------------------FINDS VIBE FROM THE GENRE--------------------------#
def getVibe(genre):
   
   vibe_map = {
    "Energetic": ["Rock", "Dance", "Electronic", "Pop Punk", "Hip Hop", "Rap", "Trap"],
    "Upbeat": ["Pop", "K-Pop", "Dance Pop", "Disco"],
    "Smooth": ["Jazz", "R&B", "Soul", "Blues"],
    "Classy": ["Classical", "Opera", "Orchestral"],
    "Laid-Back": ["Country", "Folk", "Soft Rock", "Acoustic"],
    "Intense": ["Metal", "Hard Rock", "Punk"],
    "Quirky": ["Indie", "Alternative", "Experimental"],
    "Dramatic": ["Theater", "Musical", "Opera", "Theatre","Drama"],
    "Exciting": [ "Football", "Soccer", "Basketball", "Baseball", "Hockey", "Tennis", "Golf", "Cricket", "Rugby", "Volleyball", "Motorsports", "Action"],
    "Playful": ["Comedy", "Family Shows", "Improv"],
    "Futuristic": ["Electronic", "EDM", "Synthwave"]
    }
   
   for vibe, genres in vibe_map.items():
      for g in genres:
         if g.lower() in genre.lower():
            return vibe
      
   return "Unknown"
    
#----------------------FINDS VIBE FROM THE GENRE END--------------------------#

#-----------------------------TICKETMASTER API IMPLEMENTATION------------------------------#
#---------------------------------------------------------------------#
# Goal of fetch-events: Add and format the live API data to my database 
#---------------------------------------------------------------------#
@app.route('/fetch-events')
def fetch_events():
     
     now = datetime.utcnow()
     session = Session() # --> Opens a new database session to interact with SQLite

     size = request.args.get("size", 1).strip().lower()
     size = int(size)
     city = request.args.get("city", "Seattle")
   
    
     url = "https://app.ticketmaster.com/discovery/v2/events" # --> Finds events 

     params = {
         "apikey": API_KEY,
         "countryCode": "US",
         "city": city,
         "size": size
     }
     #--------------------------CACHE IMPLEMENTATION----------------------------#

     # checks the cache first before querying
     cache_key = f"events_{city}_{size}" # --> creates a unique key using the city and size to access the right cached data (ex. events_seattle_50 and events_seattle_10 are two separate keys)
     cachedData = cache.get(cache_key)
     if (cachedData):
        print("/////////////////////////////////////////////////////")
        print("Returning Cached events")
        print("/////////////////////////////////////////////////////")

        # since the cached data is already a JSON string, we dont need to jsonify it 
        # mimetype: ensures that the browsers interpret it as JSON
        return Response(cachedData, status=200, mimetype='application/json')
    
    #--------------------------CACHE IMPLEMENTATION END----------------------------#
     # filters all events in the specific city and ones that are still to come in the database
     existing_events = session.query(Event).filter(Event.venue_city == city).filter(Event.start_time >= now).all() 

     print("len(existing_events):", len(existing_events))
     print("requested size:", size)
                     
     # if the size of new events in said city is greater than the user picked size, we just return the  existing events.
     if (len(existing_events) + 9 >= size):
        print("returning:", len(existing_events), "events")
        events_list = [{
            "id": e.id,
            "name": e.name,
            "venue": e.venue,
            "venue_city": e.venue_city,
            "latitude": e.latitude,
            "longitude": e.longitude,
            "start_time": e.start_time.isoformat() if e.start_time else None,
            "image_url": e.image_url,
            "predicted_crowd": e.predicted_crowd,
            "predicted_vibe": e.predicted_vibe,
            "predicted_noise": e.predicted_noise,
            "description": e.description,
            "genre": e.genre,
            "url": e.url,
            "ageRestriction": e.ageRestriction
        } for e in existing_events]

        # Cache the result
        print("/////////////////////////////////////////////////////")
        print("Returning exisitng events")
        print("/////////////////////////////////////////////////////")
        #--------------------------------------------------------------------------------------------------#
        # saves cached data in Redix.
        # setex: set key, expiration, and value
        # timedelta: expries in x hours
        # json.dumps: convers python dict to JSON string
        #--------------------------------------------------------------------------------------------------#
        cache.setex(cache_key, timedelta(hours=12), json.dumps({"events": events_list, "status": "success"}))
        return jsonify({"events": events_list, "status": "success"}), 200      
      
     r = requests.get(url, params=params) # --> requests to ticketmaster
     data = r.json() # --> converts the ticketmaster API response to JSON
     
     events = data.get("_embedded", {}).get("events", []) # --> Ticketmaster nests 
     # events under _embedded so we have to go thorugh that to get to events.
     # .get makes sure our code doesnt crash if theres no data from the API that fills that attribute

     #----------FORMATTING TIME AND CREATING EVENT OBJECT---------#

     events_list = []  

     for ev in events:
         venue = ev["_embedded"]["venues"][0] # --> fetches the first venue of the event

         start_info = ev.get("dates", {}).get("start", {})
         dateTime = start_info.get("dateTime")
         localDate = start_info.get("localDate")
         localTime = start_info.get("localTime")

         venue_tz = "America/Los_Angeles"  # Ideally get from venue['timezone'] if provided

         if dateTime:  # --> Convert from UTC to venue timezone
          start_time = datetime.fromisoformat(dateTime.replace("Z", "+00:00"))
          start_time = start_time.astimezone(ZoneInfo(venue_tz))
         elif localDate: # --> If only date is given, combine with localTime or default to noon
           time_part = localTime or "12:00:00"
           start_time = datetime.fromisoformat(f"{localDate}T{time_part}")
           start_time = start_time.replace(tzinfo=ZoneInfo(venue_tz))
         else:
          start_time = None

         description = ev.get("info") or ev.get("pleaseNote") or "No Description Available"

        
         if 'classifications' in ev and ev['classifications']:
             genre = ev['classifications'][0].get('genre', {}).get('name', "No Genre Found") # --> Retrieves the event genre from the API

         vibe = getVibe(genre) # --> gives me the vibe of the event
         url = ev.get("url", "")

         age = ev.get("ageRestrictions", {})

         if age.get("minimumAge"):
            age_Restriction = f"{age["minimumAge"]}+"
         elif age.get("legalAgeEnforced"):
            age_Restriction = "Age Restricted"
         else:
            age_Restriction = "All Ages"

         match = re.search(r"\b(1[89]|2[01])\b", description)
         min_age = age.get("minimumAge")
     
         if match:
            age_Restriction = f"{match.group(0)}+"
         elif min_age:
            age_Restriction = f"{min_age}+"
         else:
            age_Restriction = "All ages"


         #-------Adds the events to the database-------#
         if not session.query(Event).filter_by(id=ev["id"]).first():
            event_obj = Event(
                id=ev["id"],
                name=ev["name"],
                venue=venue["name"],
                venue_city=city,
                latitude=float(venue["location"]["latitude"]) if "location" in venue else None,
                longitude=float(venue["location"]["longitude"]) if "location" in venue else None,
                start_time=start_time,
                image_url=ev.get("images", [{}])[0].get("url", None),
                predicted_crowd=0,
                predicted_vibe=vibe,
                predicted_noise="Unknown",
                description = description,
                genre = genre,
                url = url,
                ageRestriction = age_Restriction
            )
            session.add(event_obj)

            #-------returns the new events straight to the frontend-------#
            events_list.append({
            "id": ev["id"],
            "name": ev["name"],
            "venue": venue["name"],
            "venue_city": city,
            "latitude": float(venue["location"]["latitude"]) if "location" in venue else None,
            "longitude": float(venue["location"]["longitude"]) if "location" in venue else None,
            "start_time": start_time.isoformat() if start_time else None,
            "image_url": ev.get("images", [{}])[0].get("url", None),
            "predicted_crowd": 0,
            "predicted_vibe": vibe,
            "predicted_noise": "Unknown",
            "description": ev.get("info"),
            "genre": genre,
            "url": url,
            "ageRestriction": age_Restriction

        })


      #----------FORMATTING TIME AND CREATE EVENT OBJECT END----------#

     
     session.commit()
     session.close()
     print("//////////////////////////////////////////////////////")
     print("////////////Returning fresh events////////////////////")
     print("//////////////////////////////////////////////////////")
     return jsonify({"events": events_list, "status": "success"}), 200

#---------------------------TICKETMASTER API IMPLEMENTATION END---------------------------#

#---------------------------ADDING USER EVENTS TO DATABASE---------------------------#
@app.route('/add-user-event', methods=["POST"])
def userEvent():

   session = Session()
   data = request.form

   # print("------------------------------------------")
   # print("Received start_date:", data.get("start_date"))
   # print("Received start_time:", data.get("start_time"))
   # print("------------------------------------------")

   newEvent = UserEvent(
      id=str(uuid.uuid4()),
      name = data.get("name"),
      venue = data.get("venue"),
      venue_city = data.get("venue_city"),
      latitude = data.get("latitude"),
      longitude = data.get("longitude"),
      start_time= to_standard_time(data.get("start_time")),
      venue_capacity=data.get("venue_capacity", 0),
      image_url=data.get('image_url'),
      description=data.get("description"),
      genre=data.get("genre"),
      ageRestriction=data.get("ageRestriction"),
      start_date= data.get("start_date"),
      timezone =data.get("timezone")
   )

   session.add(newEvent)
   session.commit()
   new_event = newEvent.id
   session.close()

   return jsonify({"status": "success", "id": new_event})



@app.route('/get-user-events') # --> Returns all stored maps in JSON which is then 
# ready for React. We need to convert to JSON so that React can understand it
def get_user_events():
    
    session = Session() # --> Opens a new database session to interact with mySQL

    now = date.today()
    session.query(UserEvent).filter(UserEvent.start_date < now).delete()
    session.commit()

    session.commit()

    with Session() as session: # --> automatically closes the session
      events = session.query(UserEvent).all()

      return jsonify([{ # --> loops through each row and jsonifies it 
         "id": e.id,
         "name": e.name,
         "venue": e.venue,
         "venue_city": e.venue_city,
         "latitude": e.latitude,
         "longitude": e.longitude,
         "start_time": e.start_time,
         "image_url": e.image_url,
         "description": e.description,
         "genre": e.genre,
         "ageRestriction": e.ageRestriction,
         "start_date": e.start_date,
         "venue_capacity": e.venue_capacity,
         "timezone": e.timezone

      } for e in events])

#---------------------------ADDING USER EVENTS TO DATABASE END---------------------------#

@app.route('/api/geocode')
def geoCode():
    
   address = request.args.get("address")

   url = "https://api.opencagedata.com/geocode/v1/json"
   params = { "q": address, "key": GEO_KEY }

   r = requests.get(url, params=params).json()
  
   if not r["results"]:
        return {"error": "not found"}, 404
   
   loc = r["results"][0]["geometry"]


   return {

        "lat": loc["lat"],
        "lng": loc["lng"]
    }


# Looks into the upload folder and returns whatever image is in the uploads/<filename>
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # send_from_directory ensures that only the uploads/image.png is used and not the entire file path
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

#---------------------------------------------------------------------------------------------------#
#-----------------------------------WEBSITE EXTENTIONS END------------------------------------------#
#---------------------------------------------------------------------------------------------------#

if __name__ == '__main__':
    app.run()
