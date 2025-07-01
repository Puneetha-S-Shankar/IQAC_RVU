import { useEffect, useState } from "react";
import slide1 from "../assets/slide1.png";
import slide2 from "../assets/slide2.png";
import slide3 from "../assets/slide3.png";
import slide4 from "../assets/slide4.png";
import "./Slideshow.css";

const images = [slide1, slide2, slide3, slide4];

const Slideshow = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slideshow">
      <img src={images[current]} alt={`Slide ${current + 1}`} className="slide-image" />
      <div className="overlay">
        <div className="iqac-text">
          <h1>IQAC</h1>
          <p>INTERNAL QUALITY ASSURANCE CELL</p>
        </div>
      </div>
    </div>
  );
};

export default Slideshow;
