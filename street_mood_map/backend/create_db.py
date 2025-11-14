#----------------------------------------------------------------------------------------------------------------------#
#--------------------------------------------SQLite CREATION IMPLEMENTATION--------------------------------------------#
#----------------------------------------------------------------------------------------------------------------------#

from sqlalchemy import create_engine,Column,String,Integer,Float, DateTime # --> Engine: connects to SQLite
from sqlalchemy.ext.declarative import declarative_base # ---> creates a base class, any class that inherets from base becomes a table in the database
from sqlalchemy.orm import sessionmaker # --> allows us to add/update/delete/query rows in the database

#-------------------------------------------------------------------------------------------------------------#
#-SQLAlchemy allows me to make a object and bundle all these attributes up instead of writing raw SQL queries
#-------------------------------------------------------------------------------------------------------------#

Base = declarative_base() # --> creates base class, anything inhereting base will be added to the database table

engine = create_engine('sqlite:///events.db', echo=False) # --> establishes connection to the database. Echo is useful for debugging

Session = sessionmaker(bind=engine) # --> creates a session factory
session = Session() # --> creates an actual session object that allows me to preform CRUD

class Event(Base): # creates individual columns for each row
    __tablename__ = 'events'
    id = Column(String, primary_key=True) # --> this will be our primary key to find specific events
    name = Column(String)
    venue = Column(String)
    venue_city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    start_time = Column(DateTime)
    venue_capacity = Column(Integer)
    image_url = Column(String, nullable=True)
    predicted_crowd = Column(Integer)
    predicted_vibe = Column(String)
    predicted_noise = Column(String)
    description = Column(String, nullable=True)
    genre = Column(String)
    url = Column(String)
    ageRestriction = Column(String)
    


Base.metadata.create_all(engine)









# # Creates a table that we will use to store values. Since Im making a city vibe map that
# # reccomends what spots to go to based on your preferences (i.e calm, exciting, quiet etc.), i want to get values like
# # latitude and logitude to find where these spots are. I will be getting these values from 
# # apps like twitter and reddit such as for the date and if the mood of these area+tweet is 
# # happy or something different.

# # AUTOINCREMENT allows the dataset/dictionary to automaatically increment my id for each new set of data
# # REAL --> Numbers
# c.execute('''
# CREATE TABLE IF NOT EXISTS posts (
#     id INTEGER PRIMARY KEY AUTOINCREMENT, 
#     text TEXT,
#     latitude REAL,
#     longitude REAL,
#     timestamp DATETIME,
#     sentiment_score REAL,
#     noise_level REAL DEFAULT 0,  
#     crowd_factor REAL DEFAULT 0   
# )
# ''')

# conn.commit()
# conn.close()

# print("Database and table created successfully!")