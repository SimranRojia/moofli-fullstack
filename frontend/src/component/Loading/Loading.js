import React from 'react';

// Assuming all images are now in the same directory as the component
import shellImg from './shell.png';
import brainImg from './brain.png';
import leafImg from './leaf.png';


function Loading() {
  return (
    <>
      <style>
        {`
          .loading-wrapper {
            /* Center the component on the entire screen */
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.8); /* Optional: Adds a backdrop */
            z-index: 999; /* Ensures it's on top of other content */
          }

          .logo-container {
              position: relative;
              width: 400px; /* Adjust size as needed */
              max-width: 90%;
              height: auto;
          }

          /* Base shell image */
          .shell-img {
              width: 100%;
              display: block;
          }

          /* Common styles for overlaid images */
          .overlay-img {
              position: absolute;
          }

          /* Left brain positioning - Clockwise animation */
          .brain-left {
              width: 30%;
              top: 44%;
              left: 16%;
              animation: spin-clockwise 2s linear infinite;
          }
          
          /* Right brain positioning - Anti-clockwise animation */
          .brain-right {
              width: 30%;
              top: 44%;
              right: 17%;
              animation: spin-anticlockwise 2s linear infinite;
          }
          
          /* Leaf positioning - Added sway animation */
          .leaf-img {
              width: 30%;
              top: 4.5%;
              right: 15%;
              transform-origin: bottom center; /* Make it sway from the stem */
              animation: sway 2.5s ease-in-out infinite alternate;
          }

          /* Clockwise animation for the left brain */
          @keyframes spin-clockwise {
              from {
                  transform: rotate(0deg);
              }
              to {
                  transform: rotate(360deg);
              }
          }

          /* Anti-clockwise animation for the right brain */
          @keyframes spin-anticlockwise {
              from {
                  transform: rotate(0deg);
              }
              to {
                  transform: rotate(-360deg);
              }
          }

          /* Swaying animation for the leaf */
          @keyframes sway {
              from {
                  transform: rotate(5deg);
              }
              to {
                  transform: rotate(-10deg);
              }
          }
        `}
      </style>
      <div className="loading-wrapper">
        <div className="logo-container">
          {/* The base shell image */}
          <img src={shellImg} alt="Logo Shell" className="shell-img" />
          
          {/* The overlaid component images */}
          <img src={brainImg} alt="Brain Icon" className="overlay-img brain-left" />
          <img src={brainImg} alt="Brain Icon" className="overlay-img brain-right" />
          <img src={leafImg} alt="Leaf Icon" className="overlay-img leaf-img" />
        </div>
      </div>
    </>
  );
}

export default Loading;

