import { useState, useRef, useLayoutEffect } from "react";

function getDimensionObject(node) {
    const rect = node.getBoundingClientRect();

    return {
        width: rect.width,
        height: rect.height,
        top: "x" in rect ? rect.x : rect.top,
        left: "y" in rect ? rect.y : rect.left,
        x: "x" in rect ? rect.x : rect.left,
        y: "y" in rect ? rect.y : rect.top,
        right: rect.right,
        bottom: rect.bottom,
        parent:null
    };
}

function useDimensions({ liveMeasure = true} = {}) {
    const [dimensions, setDimensions] = useState({});
    const ref= useRef(null);

    useLayoutEffect(() => {
        if (ref.current) {
            const measure = () =>
                window.requestAnimationFrame(() =>{
                    const dim = getDimensionObject(ref.current);
                    if (ref.current.parentNode) {
                      dim.parent =  getDimensionObject(ref.current.parentNode);
                    }
                    setDimensions(dim);
                });
            measure();

            if (liveMeasure) {
                window.addEventListener("resize", measure);
                window.addEventListener("scroll", measure);

                return () => {
                    window.removeEventListener("resize", measure);
                    window.removeEventListener("scroll", measure);
                };
            }
        }
    }, [ref, liveMeasure]);

    return [ref, dimensions];
}

export default useDimensions;
