import React, { useEffect, useRef, useState } from "react"; 

//------------------------------------------------------------------------------------------//
//  ^ lets us build componenets

// useEffect lets you use libraries outside of React. Function runs when everything is rendered first
// unless the dependincy array has variables

// useState is a hook that stores/sets data and can be accessed anywhere in the function

// hook --> lets my components "remember" things every time i run the program. Basically
// stores data or values without it being reset after each time i run the program

// UseRef: Hook that lets us keep a persistent value on a value and doesnt trigger a rerender.
// good for something like hovering over an icon and opening the popup
//------------------------------------------------------------------------------------------//

//------------------------------------------------------------------------------------------//
//Note: (useEffect always runs once no matter what when a component is being mounted)
// useEffect (() => {
//  }, [x,y]) <- this dependincy array means the useEffect will only run when x and y change.
// if the dependincy array was [], that means it only runs once 
//------------------------------------------------------------------------------------------//

import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

import AddUserEvent from './addUserEvent';

// CSS Files with the map 
import 'leaflet/dist/leaflet.css'; 
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// my css file that changes the style of the event icons
import './App.css' 
import Panel from './Panel'

// componenets that make up the dynamic map
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; 

//-------------------------------------------------------------------//
// MapContainer: The actual map element
// Tile Layer: Provides the map tiles
// Marker: Pins events on the map
// Popup: Info window that appears when a user clicks on the marker
//-------------------------------------------------------------------//

// Used to get custom icons (i.e images for each event on the map)
import L, { latLng, marker } from "leaflet" 

// allows me to access multiple events in the same spot
import MarkerClusterGroup from 'react-leaflet-markercluster';

//------------------------------------------------------------------------------//
//-Links with my App.css file and changes the size and positioning of the image-//
//------------------------------------------------------------------------------//
const EventMarker = ({event}) => {

 const [isSaved, setisSaved] = useState(false)
 const [, forceUpdate] = useState(0); // trick to re-render

 useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedEvents") || "[]");
    setisSaved(saved.includes(event.id))
 }, [event.id])


 const toggleSave = () => {

  let saved = JSON.parse(localStorage.getItem("savedEvents") || "[]");

  if (saved.includes(event.id)) {
  saved = saved.filter(id => id !== event.id);
} else {
  saved.push(event.id);
}

localStorage.setItem("savedEvents", JSON.stringify(saved));
setisSaved(!isSaved);


 }
  const icon = L.divIcon({
   html: `<div class="custom_marker">
          <img src= "${event.image_url}" alt="Event"/>
          </div>`,
          
  
  popupAnchor: [40,-0],
  className: "" // important: disable default Leaflet icon class
  });

   const markerRef = useRef();
   
  
return (
    <>
    <Marker key={event.id} position={[event.latitude, event.longitude]} icon={icon} ref={markerRef}>
      <Popup autoClose={false} closeOnClick={false} maxWidth={250} minWidth={20}>

        <div onClick={toggleSave} style={{ display: "flex" }}>
        <b style={{flex:1}}>{event.name} </b><br/>

        <div style={{cursor:"pointer"}}>
        {isSaved ? (
        <BsBookmarkFill size={24} color="gold" />
        ) : (
          <BsBookmark size={24} color="gold"/>
        )}
        </div>
        </div>

        Venue: {event.venue}<br/>
        Start: {event.start_time} PST<br/>
    

       {/* target: opens link in a different tab | rel: security reasons, good practice */}
       {event.url && (
       <a href={event.url} target="_blank" rel="noopener noreferrer">Buy Tickets</a>
       )}

       

      <div
      style={{
        maxHeight: "100px", // set the max height
        overflowY: "auto",  // vertical scrolling
        whiteSpace: "normal",
        marginTop: "5px",
        borderTop: "1px solid #ccc",
        paddingTop: "5px",
       }}
       > 
        
        <p><strong>Genre: </strong>{event.genre}</p>
        <p><strong>Description:</strong> {event.description} </p>
        <p><strong>Vibe: </strong>{event.predicted_vibe}</p>
        <p><strong>Age Restrictions: </strong>{event.ageRestriction}</p>

  </div>
      </Popup>
    </Marker>
    </>
  );  
};

// Recenter the map when center changes
const Recenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
      map.flyTo(center, map.getZoom(), {duration: 2});

  }, [center, map]);


  return null;
};

// React Component: Like HTML <div> but with more logic to it. Its like a
//its own block of code that could be HTML or JS

//--------------------------------------//
//-Initializes the map and and useState-//
//--------------------------------------//
function App() 
{

  const [View, setView] = useState("ticketmaster")
  const [showSaved, setshowSaved] = useState(false)
  const [timeFilter, setTimeFilter] = useState("0")
  const [goButton, setButton] = useState(true)
  const [open, setOpen] = useState(false);
  const [age, setAge] = useState("All ages")
  const [genre, setGenre] = useState("all");
  const[size, setSize] = useState("10");
  const [center, setCenter] = useState(() => { // this useState remembers the current center even if the page is refreshed
  const savedCenter = localStorage.getItem("mapCenter");
  return savedCenter ? JSON.parse(savedCenter) : [47.6062, -122.3321]; // Seattle as fallback
});
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState(""); // stores current search input

  useEffect(() => { // the reactive UI part of the frontend, allows me to see changes without refreshing the page 

    if (View === "ticketmaster"){
    fetch("http://192.168.0.105:5000/events") // --> retrieves our data from flask 
    .then((res => res.json())) // --> .then: a "Promise" meaning that it waits for the fetch to finsih and then this line will run
    .then(data => setEvents(data)) // --> waits for the response to be converted to json then it'll run
    .catch((err) => console.error(err));
    }
    else if (View === "user"){
     fetch("http://192.168.0.105:5000/get-user-events")
    .then((res => res.json())) 
    .then(data => setEvents(data)) 
    .catch((err) => console.error(err));
    }

  }, [View])

  useEffect(() => {
   
    
  },[])

  useEffect(() => { // constantly stores/remembers the new center when it changes 
  localStorage.setItem("mapCenter", JSON.stringify(center));
   }, [center]);
   
   // filters the users search to lowercase
   const filteredEvents = Array.isArray(events) ? events.filter(
   (event) =>
    event.name.toLowerCase().includes(search.toLowerCase()) ||
    event.venue.toLowerCase().includes(search.toLowerCase())
    ) : [];


    // Handles delivering data from the frontend to the backend (search and size) as well as
    // finding the lat and lon of the searched city
    const handleSearch = (search, size) => {

       setButton(false)
        fetch(`http://192.168.0.105:5000/fetch-events?city=${search}&size=${size}`) // sends the desired city and event size to the backend
        .then((res => res.json())) // --> .then: a "Promise" meaning that it waits for the fetch to finsih and then this line will run
         .then(data => setEvents(data)) // --> waits for the response to be converted to json then it'll run
        .catch((err) => console.error(err));


        // Fetch coordinates (lat,lon) from OpenCage API
        fetch(`http://192.168.0.105:5000/api/geocode?address=${encodeURIComponent(search)}`)  
        .then(res => res.json())
        .then(data => {
        if (data.lat && data.lng) {
          const { lat, lng } = data;
          alert(lat)
          setCenter([lat, lng]); // triggers Recenter
          setTimeout(() => {
         window.location.reload();
          setButton(true)
          }, 2000);
        } else {
          alert("City not found!");
        }
        })
         .catch(err => console.error(err));
      }

     
      useEffect(() => {
        console.log("Events updated:", events);
      }, [events]);





  return (
    <> 
  
    
    {/*search bar*/}
    <div style={{display:"flex",position:"absolute", alignItems:"center",justifyContent:"space-between", top:"17vh"}}>
      
      <span style={{position:"absolute",marginLeft:"52%",zIndex:"1001"}}>🔍</span>
      <input type="text" placeholder= "U.S. City...." value={search} onChange={(e) => setSearch(e.target.value)}
        style={{
        fontSize:"16px",
        marginLeft:"33vw",
        width: "30vw",
        zIndex: 1000,  // Make sure it's above the map layers
        padding: "5px 10px",
        borderRadius: "50px",
        border: "3px solid black",
        boxShadow: "2px 8px 10px black",
        outline: "none",
        textIndent:"23px"
      }}/>



      {search && goButton && <button className="goButton" onClick={() => handleSearch(search,size)}>GO</button>}
    </div>
     <>
        </>

        {/* Tab Button */}
        <div className="tab" onClick={() => setOpen(!open)} 
        style={{transform: open ? "translateX(33vw)" : "translate(0vw)",
          transition: "transform 0.3s ease"
        }}>
          {open ? "<" : ">"}
        </div>

         {/* Function that contains filter buttons and the panel that slides over */}
         <Panel View ={View} showSaved={showSaved}timeFilter ={timeFilter} genre = {genre} open = {open}  size = {size} age = {age} setGenre = {setGenre} setAge = {setAge} setSize={setSize} setTimeFilter={setTimeFilter} setshowSaved={setshowSaved} setView={setView}/>
         
        
    {/* Styling the Map*/}
     <div style={{width:"95vw", height: "clamp(50px, 15%, 150px)", left: "50%",transform: "translateX(-50%)", backgroundColor:"black", zIndex: "700", position:"absolute", backgroundColor: "darkolivegreen", boxShadow: "10px 10px 10px black"}}> 
      <div className="credits"> <p>Made by: Lucas Wehr</p></div>
     </div>

    <div style={{width:"98vw", bottom: "0" ,height: "20px", backgroundColor:"black", zIndex: "600", position:"absolute", backgroundColor: "darkolivegreen", boxShadow: "1px -10px 10px 0px black"}}> </div> 
    <div style={{width:"100vw", bottom: "-16%",height: "18%", backgroundColor:"black", zIndex: "800", position:"absolute", backgroundColor: "darkolivegreen"}}> </div> 
    <div style={{width:"5vw",left: "0",height: "100%", backgroundColor:"black", zIndex: "700", position:"absolute", backgroundColor: "darkolivegreen", boxShadow: "5px 15vh 10px 5px black"}}></div>
    <div style={{width:"5vw", right: "0",height: "100%", backgroundColor:"black", zIndex: "700", position:"absolute", backgroundColor:"darkolivegreen", boxShadow: "-10px 15vh 10px black", }}></div> 
    
    <div className="maptext"><p>EVENT MAP</p></div>
    {/* Styling the Map End */}

    
    <AddUserEvent/>

      {/* Displays the map itself to the webpage */}
      <div style={{height:"100vh", width:"100vw"}}>
    <MapContainer center={center} zoom={10} style={{flexGrow: "1", height: "95%", width: "95%"}} zoomControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // --> opens template for openstreetmap which has a free licence. x,y,z are zoom/tile coordinates
        attribution="&copy; OpenStreetMap contributors" // required by their licence
      />
      <MarkerClusterGroup chunkedLoading={true} maxClusterRadius={50}  spiderfyDistanceMultiplier={2}>
      
      
      {filteredEvents
          .filter(event =>  { // filters all the events the user selects, if "all", it returns all events
            
            // Filter by genre first
            const genreMatch = genre.toLowerCase() === "all" || event.predicted_vibe.toLowerCase() === genre.toLowerCase();
    
            // Normalize age values
            const eventAge = event.ageRestriction ? event.ageRestriction.trim() : "All ages";
            const selectedAge = age ? age.trim() : "All ages";

            const ageMatch = selectedAge === "All ages" || eventAge === selectedAge;
            let month = "", day ="", year =""

            // Parse event start date safely (MM-DD-YYYY)

            if (View == "ticketmaster")
            {
              const [monthStr, dayStr, yearStr] = event.start_time.split("-");
              month = parseInt(monthStr, 10);
              day = parseInt(dayStr, 10);
              year = parseInt(yearStr, 10);

            }
            const eventDate = new Date(year, month - 1, day); // JS months are 0-indexed
            if (isNaN(eventDate)) return false; // skip invalid dates
          
            const now = new Date();
            let value = 0;

            if (timeFilter === "2") value = 1;
            else if (timeFilter === "3") value = 7;
            else if (timeFilter === "4") value = 31;

            const savedEventIds = JSON.parse(localStorage.getItem("savedEvents") || "[]");
           
             if (showSaved) {
               return savedEventIds.includes(event.id); // only show saved events
             }
          
            if (timeFilter === "0")
            {
              return genreMatch && ageMatch 
            }

            const filterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + value); // filters all events by the date it begins
 
            return genreMatch && ageMatch && (eventDate <= filterTime);
          })
            .filter(event => event.latitude != null && event.longitude != null)
          .map(event => ( // loops through all my events in the useState
        <EventMarker key={event.id} event={event}/>
      ))}
      </MarkerClusterGroup>

      <Recenter center = {center} />
    </MapContainer>
    </div>
</>
  );

}
 //------TESTING GROUNDS-------//
function App2()
 {

  const [state, setState] = useState(false)
  const [search, setSearch] = useState(""); // stores current search input

 
  const [count, setCount] = useState(() =>{
    const saved = localStorage.getItem("count");
    const parsed = parseInt(saved,10);
    return isNaN(parsed) ? 0 : parsed;
  })

  const handleClick = () => {
  setCount(prevCount => {
    const newCount = prevCount + 1;
    localStorage.setItem("count", newCount); // save the new value
    return newCount;
  });
};

const increment = () => (count + 1)
const decrement = () => (count - 1)


  return(
    <>
    
    <button
    className={state ? 'active' : 'inactive'}
    onClick={() => {
      setState(!state); 
      handleClick();
    }}
    >
    Increase
    </button>

    {count > 5 && (
      <p>
      Youre Happy
      </p>
      
    )}

    {count < -5 && (

      <p>Youre sad</p>
    )}

    <button onClick={() => setCount(decrement)}> Decrease</button>

    <button onClick={() => setCount(0)}> Reset</button>

    <h1>hello world</h1>
    {search}
    {count}
   </>
  );
}

export default App;
