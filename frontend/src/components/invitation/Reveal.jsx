import React from "react";
import useReveal from "../../hooks/useReveal";

// Generic reveal wrapper — fades/rises content into view on scroll.
export default function Reveal({ children, className = "", delay = 0, as: Tag = "div", ...rest }) {
  const [ref, inView] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
