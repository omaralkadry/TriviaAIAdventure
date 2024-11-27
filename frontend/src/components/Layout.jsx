import React from "react";
import "./Layout.css";
import "./animations.css";
import Navbar from "./Navbar";
import coolBackground from "../assets/cool-background+1.png";
import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <div className="layout-container" style={{
            backgroundImage: `url(${coolBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh'
        }}>
            <Navbar />
            {/* Page Content */}
            <div className="layout-content page-transition">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;

