import React, { useEffect, useRef, useState } from "react"; 
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const NavBar = () => {

    return (
        <nav>
            <p>Hello</p>
            <div>
                <Link to= "/">Home</Link>
                <Link to="/addUserEvent">User Added</Link>
            </div>
        </nav>
    );
}


export default NavBar;