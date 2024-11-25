import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import particlesConfig from "../config/particlesjs-config.json";
import "./Layout.css";

const Layout = ({ children }) => {
    const particlesInit = async (main) => {
        await loadFull(main); // Initializes tsparticles
    };

    return (
        <div className="layout-container">
            {/* Particles.js Background */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particlesConfig}
            />

            {/* Page Content */}
            <div className="layout-content">
                {children}
            </div>
        </div>
    );
};

export default Layout;
