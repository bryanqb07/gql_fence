import React from "react";
import { Slide } from "react-slideshow-image";
require("./slideshow.css");

const slideImages = [
  "testPanel.jpg",
  "testPanel.jpg",
  "testPanel.jpg"
];

const properties = {
  duration: 5000,
  transitionDuration: 500,
  infinite: true,
  indicators: true,
  arrows: true
};

const Slideshow = () => (
    <Slide {...properties}>
      <div className="each-slide">
        <div style={{ backgroundImage: `url(${slideImages[0]})` }}>
          <span>Slide 1</span>
        </div>
      </div>
      <div className="each-slide">
        <div style={{ backgroundImage: `url(${slideImages[1]})` }}>
          <span>Slide 2</span>
        </div>
      </div>
      <div className="each-slide">
        <div style={{ backgroundImage: `url(${slideImages[2]})` }}>
          <span>Slide 3</span>
        </div>
      </div>
    </Slide>
  );

export default Slideshow;

