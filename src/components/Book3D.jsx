import { forwardRef } from 'react';

/** A real cover wrapped onto a 3D book: front, spine, page block, head and back. */
const Book3D = forwardRef(function Book3D({ image, title, author, ink = 'house', width = 220, ratio = 1.5, depth = 30, fluid = false, className = '', style, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={`book3d ${className}`}
      style={fluid ? { '--t': `${depth}px`, ...style } : { '--w': `${width}px`, '--h': `${Math.round(width * ratio)}px`, '--t': `${depth}px`, ...style }}
      {...rest}
    >
      <div className="book3d__inner">
        <img className="book3d__face book3d__front" src={image} alt={`Cover of ${title} by ${author}`} width="853" height="1280" draggable="false" />
        <div className="book3d__face book3d__back" data-ink={ink} />
        <div className="book3d__face book3d__spine" data-ink={ink}>
          <span>{title}</span>
        </div>
        <div className="book3d__face book3d__pages" />
        <div className="book3d__face book3d__head" />
      </div>
    </div>
  );
});

export default Book3D;
