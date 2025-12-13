import React, {useState } from "react"; 




import './App.css' 

function User()
{

    const [address, setAddress] = useState("")
  const [search, setSearch] = useState(""); // stores current search input
   
    const [background, setBackground] = useState(false)
    const [form, setForm] = useState({
    name: "",
    venue_city: "",
    latitude: "",
    longitude: "",
    start_time: "",
    venue_capacity: "",
    image_url: "",
    description: "",
    genre: "",
    ageRestriction: "",
    start_date: "",
    venue: "x",
    });

    async function getGeoAddress()
    {
      const res = await fetch(`http://192.168.0.105:5000/api/geocode?address=${encodeURIComponent(address)}`)  
      
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

    async function submitUserEvent(userEventData)
    {
          const response = await fetch("http://192.168.0.105:5000/add-user-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userEventData)
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

          const { lat, lng } = await getGeoAddress(address)

          form.latitude = lat;
          form.longitude = lng;

          alert(`Form: ${form.latitude}`)
          alert(`Form: ${form.longitude}`)

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
        
        submitUserEvent(form)

        alert("success")

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
       <div style={{display: "flex",position:"absolute", zIndex:1005, backgroundColor: "darkolivegreen", width:"100%", height:"100%"}}>
         <div className="maptext" style={{top:"7vh"}}>ADD EVENT</div>
         <div onClick={() => setBackground(false)} style={{ width:"50px", height:"5vh", zIndex:1000, backgroundColor:"white", position:"absolute", borderRadius:"10px", border:"3px solid black", alignContent:"center", textAlign:"center", bottom:"1vh", left:"1vw"}}>
          Home</div>

          <div className="submit" onClick={handleChange} style={{ width:"20vw", height:"5vh", zIndex:1000, position:"absolute", borderRadius:"10px", border:"3px solid black", alignContent:"center", textAlign:"center", bottom:"-1vh",left:"50%", transform:"translate(-50%, -50%)"}}>
          Submit</div>
       </div>

        <div style={{ display: "flex",flexDirection: "row",justifyContent: "space-around", marginTop:"15vh" }}>
          <div style={{display:"flex",flexDirection:"column", gap:"2vh", alignItems:"start", justifyContent:"center"}}> 
              
            <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                  <strong>Event Name</strong>
              <input name="name" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>

            <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                  <strong>City</strong>
              <input name="venue_city" value={form.venue_city} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>

            <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                  <strong>Start Time</strong>
              <input placeholder="HH:MM" name="start_time" value={form.start_time} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>

            <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                  <strong>Start Date</strong> 
              <input placeholder="YYYY-MM-DD" name="start_date" value={form.start_date} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>

            
            <div style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                  <strong>Address</strong> 
              <input  value={address} onChange={(e) => setAddress(e.target.value)} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
            </div>
           

          </div>

            <div style={{display:"flex",flexDirection:"column", gap:"2vh"}}> 
            
              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                    <strong>Genre</strong>
                <input name="genre" value={form.genre} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
              </div>

              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                    <strong>Age Restriction</strong>
                <input name="ageRestriction" value={form.ageRestriction} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
              </div>

              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                    <strong>Image URL</strong>
                <input name="image_url" value={form.image_url} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
              </div>

              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                    <strong>Venue Capacity</strong>
                <input  name="venue_capacity" value={form.venue_capacity} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
              </div>

              <div  style={{zIndex:10000, alignItems:"start", display:"flex", flexDirection:"column", gap:"1vh", color:"white", marginLeft:"10px", textShadow:"2px 3px 0px black"}}>
                    <strong>Description</strong>
                <input name="description" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))} type="text" style={{width:"30vw",height:"5vh", zIndex:1005, outline:"none", borderRadius:"10px", outline:"2px solid black", textIndent:"5px", fontSize:"16px",boxShadow:"2px 8px 10px black"}}></input>
              </div>

            </div>
       </div>
       </>
      }
    </>
    );
}




export default User