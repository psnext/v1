
import React from "react";
import * as d3 from "d3";
import { Popover } from '@mui/material';
import { Box } from "@mui/system";
import Swatch from "./Swatch";

export const mapPieColors =(colors, data)=>d3.scaleSequentialQuantile(
    d3.scaleSequential(colors)
  ).domain(data.map(d=>d.name||d));

const PieChart = ({data, onClick, options={}})=>{
  const {width, height, margin={top:0, left:0, right:0, bottom:0}} = options;
  const svgRef = React.useRef(null);
  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);

    const arc = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2 - 1);

    const radius = Math.min(width, height) / 2 * 0.8;
    const arcLabel = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius);

    const pack = d3.pie()
      .sort(null)
      .value(d => d.value)

    const color = options.color || ( d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse())
    )

    const total = data.reduce((s,v)=>s+v.value,0)
    const formatP=(d)=>{
      const p=Math.trunc( d.value*100/total)
      return `${p} %`;
    }
    const arcs = pack(data);

    svg.attr("viewBox", [-width / 2, -height / 2, width, height]);

    svg.selectAll("g.pc-pie")
        .attr("stroke", "white")
      .selectAll("path")
      .data(arcs)
      .join("path")
        .attr("fill", d => d.data.color||color(d.data.name))
        .attr("d", arc)
      .append("title")
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

    if (options.showLabels) {
      svg.select("g.pc-pielabels")
          .attr("font-family", "sans-serif")
          .attr("font-size", 12)
          .attr("text-anchor", "middle")
        .selectAll("text")
        .data(arcs)
        .join("text")
          .attr("transform", d =>`translate(${arcLabel.centroid(d)})`)
          .call(text => text.append("tspan")
              .attr("y", "-0.4em")
              .attr("font-weight", "bold")
              .text(formatP) )
          .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
              .attr("x", 0)
              .attr("y", "0.7em")
              .attr("fill-opacity", 0.7)
              .text(d => d.data.value.toLocaleString()));
    }
  },[data, width, height,options]);

  return <svg ref={svgRef} width={svgWidth} height={svgHeight} onClick={onClick}>
    <g className='pc-pie'></g>
    <g className='pc-pielabels'></g>
  </svg>;
}

export const PopupPieChart=({data, popupOptions, options, ...otherProps})=>{
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'piechart-popover' : undefined;

  popupOptions.color=options.color || ( d3.scaleOrdinal()
    .domain(data.map(d => d.name))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse())
  )

  return <>
    <PieChart onClick={handleClick} data={data} options={options} {...otherProps}/>
    {popupOptions?(
    <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box display='flex' p={2}>
          <PieChart data={data} options={popupOptions} {...otherProps}/>
          <Box p={1}/>
          <Swatch color={popupOptions.color} columns={1}/>
          <Box p={1}/>
        </Box>
    </Popover>):null}
  </>;
}

export default PieChart;
