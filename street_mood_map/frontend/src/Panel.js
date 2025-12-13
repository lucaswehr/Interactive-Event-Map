import React, { useEffect, useRef, useState } from "react"; 

function Panel({View,showSaved,timeFilter,genre,open,age,size, setGenre, setAge, setSize, setTimeFilter, setshowSaved, setView}) 
{
    const [filterValue, setfilterValue] = useState("0")
   const sliderTimeout = useRef(null); // persists across renders


   // Triggers a delay when the filter slider is being changed constantly, only filters data when slider has not been touched for 100ms
    const handlefilterText = (value) => {

     setfilterValue(value);
   
     if (sliderTimeout.current) clearTimeout(sliderTimeout.current);

     sliderTimeout.current = setTimeout(() => {setTimeFilter(value)}, 100);  
    }

    
    return (

        <>
        {/* Panel from tab | Has all the filters in the panel <div> block so that the conents move with the panel */}
   <div className="panel" 
         style={{transform: open ? "translateX(0)" : "translate(-34vw)", 
         transition: "transform 0.3s ease"}}>


          {/* Filter Mood Button */}
     <div style={{display:"flex", flexDirection:"column", gap:"4vh", marginTop:"2vh"}}>
       <form style={{fontSize:"2.5vw"}}>
          <label style={{display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            alignItems: "center",
            color: "white",
            fontWeight: "bold",
            width: "90%",
            marginLeft:"1vw"}}>
            Filter Events  
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
            <span style={{marginLeft:"1vw"}}></span>
          </label>
        </form>

        {/* Filter Age Button */}
         <form style={{zIndex: "1000", fontSize:"2.5vw", fontWeight:"bold"}}>
          <label style={{display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            alignItems: "center",
            color: "white",
            fontWeight: "bold",
            width: "90%",
            marginLeft:"1vw"}}>
            Filter Age
            <select className="Filter" style={{borderRadius: "30px", outline: "solid black 2px"}} value = {age} onChange={e => {const newAge = e.target.value; setAge(newAge)}}>
                <option value = "All ages">All Ages</option>
                <option value = "18+">18+</option>
                <option value = "21+">21+</option>
            </select>
            <span style={{marginLeft:"1vw"}}></span>
          </label>

           
        </form>

          {/* Size button itself along with the text "Size" */}
        <form style={{fontSize: "2.5vw", fontWeight: "bold", color: "black"}}>
            <label style={{display: "grid", gridTemplateColumns: "1fr 1fr auto", alignItems: "center",color: "white", fontWeight: "bold", width: "80%", marginLeft:"1vw"}}>
                Size
                <select className="Filter" style ={{borderRadius: "30px", border: "2px solid black", zIndex: "1000"}}  value = {size} onChange={e => {const newSize = e.target.value; setSize(newSize)}}>
                    <option value = "10">10</option>
                    <option value = "25">25</option>
                    <option value = "50">50</option>
                    <option value = "75">75</option>
                </select>
                <span style={{marginLeft:"1vw"}}></span>
            </label>
        </form> 

         <div style={{fontSize: "2.5vw", fontWeight: "bold",alignItems: "center",color: "white", fontWeight: "bold", marginLeft: "1vw",zIndex: "10000"}}>Filter Date
           <div>
            <input type="range" min={0} max={4} step={1} value={filterValue} className="nowButton" onChange={(e) =>  handlefilterText(e.target.value)}/>
            </div>
         </div>
        
            {timeFilter === "0" &&   <p className="filterTimeText">All</p>  }
       
      <div>
          {timeFilter === "1" && <p className="filterTimeText">Today</p>}

         <div>{timeFilter === "2" && <p className="filterTimeText">Tomorrow</p>}</div>

         <div>{timeFilter === "3" && <p className="filterTimeText">This Week</p>}</div>

         <div>{timeFilter === "4" && <p className="filterTimeText">This Month</p>}</div> 
      </div>

         <div style={{fontSize: "2.5vw", fontWeight: "bold", display:"flex", alignItems:"center",color: "white", fontWeight: "bold", marginLeft: "1vw",zIndex: "10000", marginTop:"-7vh"}}> Saved Events
           <input type="checkbox" style={{position:"relative",marginLeft:"5vw", width:"3vw",height:"3vh"}} checked={showSaved} onChange={(e) => setshowSaved(e.target.checked)}></input>
         </div>

           {/* Display Type Button */}
           <form style={{fontSize:"2.5vw"}}>
          <label style={{display: "grid", gridTemplateColumns: "1fr 1fr auto", alignItems: "center", color: "white",  fontWeight: "bold", width: "90%",  marginLeft:"1vw"}}>
            Filter Type
            <select className="Filter" style={{borderRadius: "30px", outline: "solid black 2px"}} value={View} onChange={(e) => setView(e.target.value)}>
                <option value = "ticketmaster">Ticketmaster Events</option>
                <option value = "user">User Generated Events</option>
            </select>
            <span style={{marginLeft:"1vw"}}></span>
          </label>
        </form>
         

     </div>
    
    </div>


    
       
</>
    )


}


export default Panel;