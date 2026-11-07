import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { getSpriteCanvas } from "./sprites";

// Dibuja cualquier personaje de sprites.js en grande (para menús y tarjetas)
export default function SpriteIcon({ sprite, px = 5, flip = false, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const img = getSpriteCanvas(sprite, px, flip);
    const cv = ref.current;
    cv.width = img.width;
    cv.height = img.height;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0);
  }, [sprite, px, flip]);
  return <canvas ref={ref} className={`sprite-icon ${className}`} />;
}

SpriteIcon.propTypes = {
  sprite: PropTypes.object.isRequired,
  px: PropTypes.number,
  flip: PropTypes.bool,
  className: PropTypes.string,
};
