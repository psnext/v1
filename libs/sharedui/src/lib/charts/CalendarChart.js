
import React from "react";
import * as d3 from "d3";
import { Box, Popover } from '@mui/material';
import Swatch from "./Swatch";

export const CalendarChart = ({data=[], onClick, options={}, sx={}})=>{
  const {
    weekday="sunday",
  } = options;
  const svgRef = React.useRef(null);
  // const svgWidth = width + margin.left + margin.right;
  // const svgHeight = height + margin.top + margin.bottom;


  React.useEffect(() => {
    const years = d3.groups(data, d => d.date.getUTCFullYear())//.reverse();
    console.log(years);
    const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
    const countDay = weekday === "sunday" ? (i) => i : (i) => (i + 6) % 7;

    const cellSize = 17;
    const height = (cellSize*9);

    function pathMonth(t) {
      const n = weekday === "weekday" ? 5 : 7;
      const d = Math.max(0, Math.min(n, countDay(t.getUTCDay())));
      const w = timeWeek.count(d3.utcYear(t), t);
      return `${d === 0 ? `M${w * cellSize},0`
          : d === n ? `M${(w + 1) * cellSize},0`
          : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${n * cellSize}`;
    }
    const formatValue = d3.format("+.2%");
    const formatClose = d3.format(",.2f");
    const formatDate = d3.utcFormat("%x");
    const formatDay = (i) => "SMTWTFS"[i];
    const formatMonth = d3.utcFormat("%b");

    const svg = d3.select(svgRef.current);

    svg.attr("viewBox", [0, 0, 928, (17*9)*years.length])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    const color = options.color||(()=>{
      const max = d3.quantile(data, 0.9975, d => Math.abs(d.value))||0;
      return d3.scaleSequential(d3.interpolateHsl('red','green')).domain([-max, +max]);
    })()


    const year = svg.selectAll('g.first')
    .data(years)
    .join("g")
      .attr("transform", (_d, i) => `translate(40.5,${height * i + cellSize * 1.5})`);

    year.append("text")
    .attr("x", -5)
    .attr("y", -5)
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .text(([key]) => key);

    year.append("g")
        .attr("text-anchor", "end")
      .selectAll("text")
      .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
      .join("text")
        .attr("x", -5)
        .attr("y", i => (countDay(i) + 0.5) * cellSize)
        .attr("dy", "0.31em")
        .text(formatDay);

    year.append("g")
      .selectAll("rect")
      .data(weekday === "weekday"
          ? ([, values]) => values.filter(d => ![0, 6].includes(d.date.getUTCDay()))
          : ([, values]) => values)
      .join("rect")
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("x", d => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5)
        .attr("y", d => countDay(d.date.getUTCDay()) * cellSize + 0.5)
        .attr("fill", d => color(d.value))
      .append("title")
        .text(d => `${formatDate(d.date)}
    ${formatValue(d.value)}${d.close === undefined ? "" : `
    ${formatClose(d.close)}`}`);


    const month = year.append("g")
      .selectAll("g")
      .data(([, values]) => {
        const months=d3.utcMonths(d3.utcMonth(values[values.length - 1].date), values[0].date);
        return months;
      })
      .join("g");

    month.filter((_d, i) => i).append("path")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("d", pathMonth);

    month.append("text")
        .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
        .attr("y", -5)
        .text(formatMonth);

  },[data, options, weekday]);

  return <Box sx={sx}>
    <svg ref={svgRef} width={'100%'} height={'100%'} onClick={onClick}>
      <g class='first'></g>
    </svg>
  </Box>;
}


export default CalendarChart;
