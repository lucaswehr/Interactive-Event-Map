import React, {useState } from "react"; 

import './App.css' 

 const selectedImages = [
    "/uploads/basketball.webp",
    "/uploads/baseball.webp",
    "/uploads/football.webp",
    "/uploads/hockey.webp",
    "/uploads/racing.webp",
    "/uploads/volleyball.webp",
    "/uploads/tennis.webp",
    "/uploads/soccer.webp",
    "/uploads/sports.webp",
    "/uploads/food.webp",
    "/uploads/ticket.webp",
    "/uploads/theater.webp",
    "/uploads/music notes.webp",
    "/uploads/orchestra.webp",
    "/uploads/concert.webp",

  ]

function ImagePicker({ selectedImage, setSelectedImage }) {
  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexDirection:"row" }}>
      {selectedImages.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Option ${idx}`}
          style={{
            width: "80px",
            height: "80px",
            border: selectedImage === img ? "3px solid black" : "2px solid gray",
            borderRadius: "8px",
            cursor: "pointer",
            objectFit: "cover",
          }}
          onClick={() => setSelectedImage(img)}
        />
      ))}
    </div>
  );
}

function User()
{

    const [address, setAddress] = useState("")
  const [search, setSearch] = useState(""); // stores current search input

 
  
  const [selectedImage, setSelectedImage] = useState(selectedImages[0]);

    const [background, setBackground] = useState(false)
    const [form, setForm] = useState({
    name: "",
    venue_city: "N/A",
    latitude: "",
    longitude: "",
    start_time: "",
    venue_capacity: "10",
    image_url: "",
    description: "",
    genre: "Sports",
    ageRestriction: "All Ages",
    start_date: "",
    venue: "N/A",
    timezone: "Eastern"
    });

    const capacityOptions = [10, 100, 250, 500, 1000, 2500, 5000, 10000];

    async function getGeoAddress()
    {
      const res = await fetch(`http://192.168.0.104:5000/api/geocode?address=${encodeURIComponent(address)}`)  
      
       if (!res.ok) {
        alert("Could not find City! Check for Correct Spelling!")
        return;
       }

       const data = await res.json();

        if (!data || !data.lat || !data.lng) {
          alert("city not found")
          return;
        }
        
       return data;
    }

    

    async function submitUserEvent()
    {

          const fd = new FormData();
          Object.entries(form).forEach(([key, value]) => {
            fd.append(key, value);
          });
      
          const response = await fetch("http://192.168.0.104:5000/add-user-event", {
            method: "POST",
            body: fd
          });

          const data = await response.json();
          console.log(data);
    }

     async function handleChange() {

      
          if (!address)
          {
            alert("Please Enter a City")
            return;
          }

          if (!form.image_url)
          {
            alert("Please Select a Image")
            return;
          }

          const { lat, lng } = await getGeoAddress(address)

          form.latitude = lat;
          form.longitude = lng;

           for (let key in form) {

            if (!form[key])
            {
              alert(`${key} is empty`)

              return;
            }
          }
       
          if (!form.latitude || !form.longitude)
          {
             alert("City not found!");
          }

          alert(form.image_url)
        
        submitUserEvent()

        alert("Success!")

        setBackground(false)

     }
     
    return (

      <>
      {/* Add Event button */}
    <div style={{display:"flex", justifyContent:"center"}}>
      <div class="add-event-button" onClick={() => setBackground(true)} style={{width:"100px", height:"30px", position:"absolute", display:"flex", alignItems:"center", justifyContent:"center",zIndex:1000, marginTop:"25vh", fontSize:"10px", borderRadius:"10px", outline:"3px solid black",boxShadow: "0px 8px 10px black"}}>
          Add Event
      </div>
    </div>

      {background &&
      <>
       <div style={{display: "flex",position:"fixed", zIndex:1005, backgroundColor: "darkolivegreen", width:"100%", height:"100%"}}>
         
         <div className="homeButton"onClick={() => setBackground(false)} style={{ width:"50px", height:"5vh", zIndex:1000, position:"absolute", borderRadius:"10px", border:"3px solid black", alignContent:"center", textAlign:"center", bottom:"1vh", left:"1vw",boxShadow:"2px 3px 10px black"}}>
         <strong> Home </strong>
          </div>

       </div>

       <div className="maptext" style={{zIndex:10000,top:"7vh"}}>ADD EVENT</div>

     
          <div style={{display:"flex",flexDirection:"column", gap:"7vh", alignItems:"center", justifyContent:"center", marginTop:"15vh"}}> 
              
            <div className="addEventTexts">
                  <strong>Event Name</strong>
              <input maxLength={40} name="name" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"3px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
                 Max Length: 40
            </div>

            <div className="addEventTexts">
                  <strong>Venue</strong>
              <input maxLength={20}name="venue" value={form.venue} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"3px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
                Max Length: 20
            </div>

            <div className="addEventTexts">
                  <strong>Start Time</strong>
              <input className="HTML-Sensitive-Buttons" name="start_time" value={form.start_time} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="time"></input>
            </div>

             <div className="addEventTexts">
                  <strong>TimeZone</strong> 
                    <select className="HTML-Sensitive-Buttons" name="timezone" style={{textIndent:"3px", width:"110%"}}  value={form.timezone} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}>
                      <option value = "ET"> America/New_York </option>
                      <option value = "CT">America/Chicago</option>
                      <option value = "MT">America/Denver</option>
                      <option value = "PT">America/Los_Angeles</option>                                         
                  </select>
              </div>


            <div className="addEventTexts">
                  <strong>Start Date</strong> 
              <input className="HTML-Sensitive-Buttons" name="start_date" value={form.start_date} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="date"></input>
            </div>

            <div className="addEventTexts" >
                  <strong>Genre Select</strong> 
                    <select className="HTML-Sensitive-Buttons" name="genre" style={{textIndent:"3px"}}  value={form.genre} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}>
                      <option value = "Sports">Sports </option>
                      <option value = "Music">Music</option>
                      <option value = "Comedy">Comedy</option>
                      <option value = "Play">Play</option>
                      <option value = "Other">Other </option>
                      
                  </select>
              </div>

            <div className="addEventTexts" >
                  <strong>Age Restrictions</strong> 
                    <select className="HTML-Sensitive-Buttons" name="ageRestriction" style={{textIndent:"3px"}}value={form.ageRestriction} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}>
                      <option value = "All Ages">All Ages</option>
                      <option value = "18+">18+</option>
                      <option value = "21+">21+</option>   
                  </select>
              </div>

              <div className="addEventTexts" >
                    <strong>Venue Capacity</strong>
                <input className="venueCapacityBar" name="venue_capacity" value={capacityOptions.indexOf(form.venue_capacity)} onChange={(e) => setForm(prev => ({ ...prev, venue_capacity: capacityOptions[e.target.value]}))} type="range" min="0" max={capacityOptions.length - 1} step="1" style={{color:"black"}}></input>
                    <strong>{form.venue_capacity}+</strong>
              </div>
            
            <div className="addEventTexts">
                  <strong>Address</strong> 
              <input maxLength={50} value={address} onChange={(e) => setAddress(e.target.value)} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"3px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
                Max Length: 50
            </div>
    
                
              <div className="addEventTexts">
                    <strong>Description</strong>
                <textarea maxLength={300} name="description" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"15vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"4px solid black", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></textarea>
                 Max Length: 300
              </div> 

              <div className="addEventTexts">
                    <strong>Select Image</strong>

                    <ImagePicker selectedImage={selectedImage} setSelectedImage={(img) => {
                    setSelectedImage(img); // update the selected image state
                    setForm(prev => ({ ...prev, image_url: img })); // also update the form state
                  }}/>
                    {form.image_url}
                </div>

               <div  style={{zIndex:10000, alignItems:"center", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                 <div className="submit" onClick={handleChange} style={{ color:"white",width:"200px", height:"5vh", zIndex:10000,borderRadius:"10px", outline:"3px solid black", alignContent:"center", textAlign:"center", boxShadow:"2px 8px 10px black", marginTop:"4vh"}}>
                  <strong>Submit</strong>
                  </div>
               </div>      
        </div>
       </>
      }
    </>
    );
}




export default User