import React, {useState } from "react"; 

import './App.css' 

function User()
{

    const [address, setAddress] = useState("")
  const [search, setSearch] = useState(""); // stores current search input
   
    const [background, setBackground] = useState(false)
    const [form, setForm] = useState({
    name: "",
    venue_city: "N/A",
    latitude: "",
    longitude: "",
    start_time: "",
    venue_capacity: "",
    image_url: "",
    description: "",
    genre: "",
    ageRestriction: "All Ages",
    start_date: "",
    venue: "N/A",
    });

    async function getGeoAddress()
    {
      const res = await fetch(`http://192.168.0.104:5000/api/geocode?address=${encodeURIComponent(address)}`)  
      
       if (!res.ok) {
        alert("error")
         throw new Error("Failed to geocode address");
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
          Home</div>

       </div>

       <div className="maptext" style={{zIndex:10000,top:"7vh"}}>ADD EVENT</div>

     
          <div style={{display:"flex",flexDirection:"column", gap:"7vh", alignItems:"center", justifyContent:"center", marginTop:"15vh"}}> 
              
            <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", textShadow:"2px 3px 0px black"}}>
                  <strong>Event Name</strong>
              <input name="name" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>

            <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", textShadow:"2px 3px 0px black"}}>
                  <strong>Venue</strong>
              <input name="venue" value={form.venue} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>

            <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white",textShadow:"2px 3px 0px black"}}>
                  <strong>Start Time</strong>
              <input name="start_time" value={form.start_time} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="time" style={{ color:"black",marginLeft:"-10px",width:"120%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"3px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>

            <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", textShadow:"2px 3px 0px black"}}>
                  <strong>Start Date</strong> 
              <input name="start_date" value={form.start_date} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="date" style={{color:"black",width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"3px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>

            
            <div style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white",textShadow:"2px 3px 0px black"}}>
                  <strong>Address</strong> 
              <input  value={address} onChange={(e) => setAddress(e.target.value)} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>
        
              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", textShadow:"2px 3px 0px black"}}>
                    <strong>Genre</strong>
                <input name="genre" value={form.genre} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
              </div>

              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", textShadow:"2px 3px 0px black"}}>
                    <strong>Age Restriction</strong>
                <input name="ageRestriction" value={form.ageRestriction} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
              </div>

              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", textShadow:"2px 3px 0px black"}}>
                    <strong>Venue Capacity</strong>
                <input  name="venue_capacity" value={form.venue_capacity} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
              </div>

              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", textShadow:"2px 3px 0px black"}}>
                    <strong>Description</strong>
                <textarea name="description" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"100%",height:"15vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></textarea>
              </div> 

              <div  style={{zIndex:10000, alignItems:"center", display:"flex", flexDirection:"column", gap:"1vh", color:"white",textShadow:"2px 3px 0px black"}}>
                    <strong>Image URL</strong>

                    <button onClick={() => document.getElementById("imageInput").click()} style={{cursor:"pointer",color:"black",width:"100%",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", fontSize:"16px",boxShadow:"2px 8px 10px black"}}> Select Image</button>
                <input id="imageInput" type="file" hidden accept="image/*" name="image_url" onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.files[0] }))}></input>
                </div>

               <div  style={{zIndex:10000, alignItems:"center", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                  {form.image_url &&(
                  <img 
                  src={URL.createObjectURL(form.image_url)} 
                  style={{width: "50vw", height: "100%", objectFit: "cover", marginTop:"6vh", outline:"8px solid black"}} 
                />
                )}
                {form.image_url.name}

                 <div className="submit" onClick={handleChange} style={{ color:"white",width:"200px", height:"5vh", zIndex:10000,borderRadius:"10px", outline:"3px solid black", alignContent:"center", textAlign:"center", boxShadow:"2px 8px 10px black", marginTop:"4vh"}}>
                  Submit
                  </div>
           
               </div>      
        </div>
       </>
      }
    </>
    );
}




export default User