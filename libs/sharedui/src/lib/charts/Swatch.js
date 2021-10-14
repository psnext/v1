import React from "react";
import * as d3 from "d3";
import DOM from './DOM';

function entity(character) {
  return `&#${character.charCodeAt(0).toString()};`;
}

export default function Swatch({
  color,
  columns = null,
  format = x => x,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0
}) {
  const id = DOM.uid().id;

  if (columns !== null) {

    return <div style={{display: 'flex', alignItems: 'center', marginLeft: marginLeft, minHeight: '33px', font: '10px sans-serif'}}>
    <style>{`
      .${id}-item {
        break-inside: avoid;
        display: flex;
        align-items: center;
        padding-bottom: 1px;
      }
      .${id}-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: calc(100% - ${swatchWidth}px - 0.5em);
      }
      .${id}-swatch {
        width: ${swatchWidth}px;
        height: ${swatchHeight}px;
        margin: 0 0.5em 0 0;
      }`}
    </style>
    <div style={{width: '100%', columns: columns}}>
      {color.domain().map(value => {
        const label = format(value);
        return <div className={`${id}-item`}>
          <div className={`${id}-swatch`} style={{background:`${color(value)}`}}></div>
          <div className={`${id}-label"`} title={`${label?.replace(/["&]/g, entity)}`}>{label}</div>
        </div>;
      })}
    </div>
  </div>;
  }

  return <div style={{display: 'flex', alignItems: 'center', minHeight: 33, marginLeft: `${+marginLeft}px`, font: '10px sans-serif'}}>
    <style>{`
      .${id} {
        display: inline-flex;
        align-items: center;
        margin-right: 1em;
      }

      .${id}::before {
        content: "";
        width: ${+swatchWidth}px;
        height: ${+swatchHeight}px;
        margin-right: 0.5em;
        background: var(--color);
      }`}
    </style>
    {color.domain().map(value => <span className={`${id}`} style={{"--color": `${color(value)}`}}>{format(value)}</span>)}
  </div>;
}
