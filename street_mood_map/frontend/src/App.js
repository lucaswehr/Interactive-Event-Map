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

// CSS Files with the map 
import 'leaflet/dist/leaflet.css'; 
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// my css file that changes the style of the event icons
import './App.css' 

// componenets that make up the dynamic map
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; 

//-------------------------------------------------------------------//
// MapContainer: The actual map element
// Tile Layer: Provides the map tiles
// Marker: Pins events on the map
// Popup: Info window that appears when a user clicks on the marker
//-------------------------------------------------------------------//

// Used to get custom icons (i.e images for each event on the map)
import L, { marker } from "leaflet" 

// allows me to access multiple events in the same spot
import MarkerClusterGroup from 'react-leaflet-markercluster';

//------------------------------------------------------------------------------//
//-Links with my App.css file and changes the size and positioning of the image-//
//------------------------------------------------------------------------------//
const EventMarker = ({event}) => {

  const [, forceUpdate] = useState(0);

   let isLocked = false; // plain JS variable

  const isLockedRef = useRef(false);
  const seeMoreRef = useRef(false);
  const [eventDescrption, setEventDescription] = useState(null)
  const icon = L.divIcon({
   html: `<div class="custom_marker">
          <img src= "${event.image_url}" alt="Event"/>
          </div>`,
          
  iconSize: [50, 50],
  popupAnchor: [20,-10],
  className: "" // important: disable default Leaflet icon class
  });

   const markerRef = useRef();

   // allows me to see the popup just by hovering over it
   useEffect(() => { // this hook is used best when you want to update something constantly.
     const marker = markerRef.current;
     if (marker)
     {
       const openPopup = () => {
      if (!isLockedRef.current) marker.openPopup();
    };

    const closePopup = () => {
      if (!isLockedRef.current) marker.closePopup();
    };

    const toggleLock = () => {
      isLockedRef.current = !isLockedRef.current;
     
      if (isLockedRef.current) {
        marker.openPopup();
      } else {
        marker.closePopup();
      }
     
     }

       marker.on("mouseover", openPopup);
    marker.on("mouseout", closePopup);
    marker.on("click", toggleLock);

    return () => {
      marker.off("mouseover", openPopup);
      marker.off("mouseout", closePopup);
      marker.off("click", toggleLock);
    };
    }
   },[]);

   // this useEffect changes the state of the lock emoji when the user clicks on the marker
   useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const handleClick = () => {
      isLocked = !isLocked; 
      
      const popup = marker.getPopup();
      if (!popup) return;
      const container = popup.getContent(); 
      
      const lockSpan = popup._contentNode.querySelector(".lock-emoji");
      if (lockSpan) {
        lockSpan.innerHTML = isLocked ? "🔒" : "🔓";
      }
    };

    marker.on("click", handleClick);
    return () => marker.off("click", handleClick);
  }, []);

return (
    <>
    <Marker key={event.id} position={[event.latitude, event.longitude]} icon={icon} ref={markerRef}>
      <Popup autoClose={false} closeOnClick={false} maxWidth={8000} minWidth={200}>
        
        <b>{event.name}</b><br/>
        Venue: {event.venue}<br/>
        Start: {event.start_time}  <span className="lock-emoji" style={{ fontSize: "20px", marginLeft: "200px" }}>🔓</span><br/>
       
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

    fetch("http://localhost:5000/events") // --> retrieves our data from flask 
    .then((res => res.json())) // --> .then: a "Promise" meaning that it waits for the fetch to finsih and then this line will run
    .then(data => setEvents(data)) // --> waits for the response to be converted to json then it'll run
    .catch((err) => console.error(err));
  }, [])

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

        fetch(`http://localhost:5000/fetch-events?city=${search}&size=${size}`) // sends the desired city and event size to the backend
        .then((res => res.json())) // --> .then: a "Promise" meaning that it waits for the fetch to finsih and then this line will run
        .then(data => setEvents(data))
        .catch((err) => console.error(err));


        // Fetch coordinates (lat,lon) from OpenCage API
         fetch(`https://api.opencagedata.com/geocode/v1/json?q=${search}&key=3599032bf52c486ca5ae8b2871bc3d6f`)
        .then(res => res.json())
        .then(data => {
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry;
          setCenter([lat, lng]); // triggers Recenter
          setTimeout(() => {
          window.location.reload();
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
      <input 
     type="text"
     placeholder="Search for city...."
     value={search}
     onChange={(e) => setSearch(e.target.value)}
     style={{
      position: "absolute",
      top: 170,
      left: 740,
      width: 200,
      zIndex: 1000,  // Make sure it's above the map layers
      padding: "5px 10px",
      borderRadius: "50px",
      border: "3px solid black",
      boxShadow: "2px 8px 10px black",
      outline: "none"
      
      }}
    />
    
     <>
        {/*White background bar behind the size button*/}
        <div style ={{width: "80px", height: "25px", zIndex: "1000", position:"absolute", backgroundColor: "white", 
            border: "3px solid black", borderRadius: "30px", marginLeft: "1400px", marginTop: "170px", boxShadow: "2px 8px 10px black" }}>
        </div>

        {/* Size button itself along with the text "Size" */}
        <form style={{position: "absolute", zIndex: "1000", marginLeft: "1406px", marginTop: "173px"}}>
            <label>
                Size{' '}
                <select className="Size" style ={{borderRadius: "30px", border: "3px solid black"}}  value = {size} onChange={e => {const newSize = e.target.value; setSize(newSize)}}>
                    <option value = "10">10</option>
                    <option value = "25">25</option>
                    <option value = "50">50</option>
                    <option value = "75">75</option>
                </select>
            </label>
        </form>
        </>

        {/* Filter Button */}
        <form style={{zIndex: "1000", position: "absolute", marginLeft: "224px", marginTop: "170px"}}>
          <label>
            Filter Events:{" "}
            <select className="Filter" style={{borderRadius: "30px", outline: "solid black 2px"}} value = {genre} onChange={e => {const newGenre = e.target.value; setGenre(newGenre)}}>
                <option value = "All">All</option>
                <option value = "Exciting">Exciting</option>
                <option value = "Intense">Intense</option>
                <option value = "Smooth">Smooth</option>
                <option value = "Laid-Back">Laid-Back</option>
                <option value = "Energetic">Energetic</option>
                <option value = "Dramatic">Dramatic</option>
                <option value = "Classy">Classy</option>
                <option value = "Quirky">Quirky</option>
                <option value = "Upbeat">Upbeat</option> 
            </select>
          </label>
        </form>

        {/* Filter Age Button */}
         <form style={{zIndex: "1000", position: "absolute", marginLeft: "224px", marginTop: "220px"}}>
          <label>
            Filter Age:{" "}
            <select className="Filter" style={{borderRadius: "30px", outline: "solid black 2px"}} value = {age} onChange={e => {const newAge = e.target.value; setAge(newAge)}}>
                <option value = "All ages">All Ages</option>
                <option value = "18+">18+</option>
                <option value = "21+">21+</option>
            </select>
          </label>
        </form>

         {/*White background bar behind the filter age button*/}
        <div style ={{width: "159px", height: "25px", zIndex: "900", position:"absolute", backgroundColor: "white", 
            border: "3px solid black", borderRadius: "30px", marginLeft: "215px", marginTop: "217px" ,boxShadow: "2px 8px 10px black"}}>
        </div>

         {/*White background bar behind the filter button*/}
        <div style ={{width: "185px", height: "25px", zIndex: "900", position:"absolute", backgroundColor: "white", 
            border: "3px solid black", borderRadius: "30px", marginLeft: "215px", marginTop: "167px" ,boxShadow: "2px 8px 10px black"}}>
        </div>

      {/* GO button when searching for city*/}
     {search ? <button className="goButton" onClick={() => { // button will only appear if theres text in the search
      handleSearch(search, size);
    }}>GO</button> : null}


    {/* Styling the Map*/}
     <div style={{width:"1697px", height: "150px", backgroundColor:"black", zIndex: "700", position:"absolute", borderRadius: "20px", backgroundColor: "darkolivegreen", boxShadow: "10px 10px 10px black"}}> </div>
    <div style={{width:"200px", height: "820px", backgroundColor:"black", zIndex: "700", position:"absolute", borderRadius: "20px", backgroundColor: "darkolivegreen", boxShadow: "2px 150px 5px 5px black"}}> </div>
    <div style={{width:"200px", height: "820px", backgroundColor:"black", zIndex: "700", position:"absolute", borderRadius: "20px", marginLeft: "1497px", backgroundColor:"darkolivegreen", boxShadow: "-10px 150px 10px black"}}> </div> 
    <div style={{width:"1300px", height: "100px", backgroundColor:"black", zIndex: "600", position:"absolute", borderRadius: "20px", marginTop: "720px", backgroundColor: "darkolivegreen", boxShadow: "1px -10px 10px 0px black", marginLeft: "195px"}}> </div>
    <div style={{width:"1500px", height: "100px", backgroundColor:"black", zIndex: "800", position:"absolute", borderRadius: "20px", marginTop: "720px", backgroundColor: "darkolivegreen", marginLeft: "100px"}}> </div>
    <div style={{zIndex: "1000", position: "absolute", left:"50%", transform: "translateX(-50%)",marginTop:"-60px" ,fontSize: "80px", color: "white", fontWeight:"bold", pointerEvents: "none", textShadow: "2px 7px 4px black"}}>
      <p>EVENT MAP</p>
    </div>
    <div style={{zIndex: "1000", position: "absolute",marginTop:"720px" ,fontSize: "30px", color: "white", fontWeight:"bold", pointerEvents: "none", textShadow: "2px 6px 4px black",marginLeft:"20px"}}>
      <p>Made by: Lucas Wehr</p>
    </div>


       {/* Displays the map itself to the webpage */}
    <MapContainer center={center} zoom={10} style={{ height: "100vh", width: "100%" }}>
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

            return genreMatch && ageMatch;
          })
          .map(event => ( // loops through all my events in the useState
        <EventMarker key={event.id} event={event}/>
      ))}
      </MarkerClusterGroup>

      <Recenter center = {center} />
    </MapContainer>
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
