/* eslint-disable @typescript-eslint/ban-types */
import { useCallback, useMemo, useState } from 'react';
import './data-table.module.css';
import * as rt from 'react-table';
import * as rw from 'react-window';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { AddBoxTwoTone, ArrowDropDownSharp, ArrowRightSharp, AutorenewRounded, Close, FilterListRounded, IndeterminateCheckBoxTwoTone, ViewColumnRounded } from '@mui/icons-material';
import { Badge, Button, Card, CardContent, Grid, IconButton, ListItem, ListItemButton, ListItemText, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import d3 from 'd3';
import PopupPanel from '../popup-panel/popup-panel';




export function uniqueValues(values:Array<string>, keys:Array<string|null>) {
  const uv=new Map();
  keys.forEach(c=>uv.set(c,{name:c, value:0}));

  values.forEach(v=>{
    const s=uv.get(v)||{name:v, value:0, percent:0};
    s.value++;
    s.percent=Math.round(100*s.value/values.length)/100;
    uv.set(v,s);
  });
  return [...uv.values()];
}

export const scrollbarWidth = () => {
  // thanks too https://davidwalsh.name/detect-scrollbar-width
  const scrollDiv = document.createElement('div')
  scrollDiv.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position:absolute; top:-9999px;')
  document.body.appendChild(scrollDiv)
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  return scrollbarWidth
}


const StyledTable = styled('div')(({ theme }) => ({
  minWidth:'100%', width:'max-content',
  display: 'inline-block',
  borderSpacing: 0,
  borderCollapse: 'collapse',
}));

const StyledTableRow = styled('div')(({ theme }) => ({
  borderBottom: '1px solid lightgrey',
  width:'auto',
  minWidth:'100%',
  '&:first-of-type': {
    borderTop: '0px solid lightgrey',
  },
  '&:nth-of-type(2n)':{
    backgroundColor: '#f5f5f5'
  }
}));
const StyledTableCell = styled('div')(({theme }) => ({
  padding: theme.spacing(1),
  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  position:'relative',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  borderRight: '0px solid lightgrey',
  '&:first-of-type':{
    borderLeft: '0px solid lightgrey',
  }
}));



function renderColumnSelectionRow(props:any) {
  const { index, style } = props;

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton>
        <ListItemText primary={`Item ${index + 1}`} />
      </ListItemButton>
    </ListItem>
  );
}

export interface DataTableProps {
  columns:rt.Column[],
  data:Array<object>,
  initialState?: object,
  height?:number
}

export function DataTable(props: DataTableProps) {
    const { columns, data, initialState, height=500 } = props;
    // Use the state and functions returned from useTable to build your UI

    const defaultColumn = useMemo(
      () => ({
        minWidth: 30,
        width: 150,
        maxWidth: 400,
      }),
      []
    )

    const scrollBarSize = useMemo(() => scrollbarWidth(), [])

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      allColumns,
      visibleColumns,
      totalColumnsWidth,
      toggleHideColumn,
      prepareRow,
      state,
    } = rt.useTable(
      {
        columns,
        data,
        defaultColumn,
        initialState,
      },
      rt.useGroupBy,
      rt.useExpanded,
      rt.useBlockLayout,
      rt.useResizeColumns,
    )

    const handleReset = () => {
      allColumns.forEach(c=>{
        if (!visibleColumns.find(vc=>vc.id===c.id)) {
          toggleHideColumn(c.id);
        }
      })
    };

    const RenderRow = useCallback(
      ({ index, style }) => {
        const row:any = rows[index]
        prepareRow(row)
        return (
          <StyledTableRow
            {...row.getRowProps({
              style,
            })}
          >
            {row.cells.map((cell:any, rn:number) => {
              return (
                <StyledTableCell key={rn} style={{width:cell.column.width}}>
                  {cell.isGrouped ? (
                    // If it's a grouped cell, add an expander and row count
                    <Stack justifyContent="flex-start" alignItems="flex-start">
                      <div {...row.getToggleRowExpandedProps()} style={{display:'flex', alignItems:'center'}}>
                        {row.isExpanded ? <ArrowDropDownSharp/> : <ArrowRightSharp/>}
                        <Typography variant="body1" style={{fontSize:'0.75em'}}><strong>{cell.render('Cell')}</strong></Typography>
                      </div>
                      <div style={{paddingLeft:'24px'}}>
                        <Typography variant="caption" color="GrayText">
                          # <em>{row.subRows.length}</em>
                        </Typography>
                      </div>
                      </Stack>
                  ) : cell.isAggregated ? (
                    // If the cell is aggregated, use the Aggregated
                    // renderer for cell
                    cell.render('Aggregated')
                  ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                    // Otherwise, just render the regular cell
                    cell.render('Cell')
                  )}
                </StyledTableCell>
              )
            })}
          </StyledTableRow>
        )
      },
      [prepareRow, rows]
    )

    // Render the UI for your table
    return (<div style={{width:'100%', height:'100%', overflowX:'scroll', overflowY:'auto'}}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <PopupPanel buttonContent={<Button color="primary" size="small"><ViewColumnRounded/> Columns</Button>}>
          <Card>
            <CardContent>
              {allColumns.map((c,i)=>(
                <ListItem key={i} disablePadding>
                  <ListItemButton onClick={()=>{toggleHideColumn(c.id as string)}}>
                  <Switch edge="start"
                    checked={visibleColumns.find(vc=>vc.id===c.id)?true:false}
                    inputProps={{
                      'aria-labelledby': `switch-hidecolumn-label-${c.Header}`,
                    }}
                  />
                    <ListItemText primary={c.Header}/>
                  </ListItemButton>
                </ListItem>
              ))}
            </CardContent>
          </Card>
        </PopupPanel>
        <PopupPanel buttonContent={<Button color="primary" size="small"><FilterListRounded/> Filters</Button>}>
          <Card sx={{width:'470px', maxWidth:'100%'}}>
            <CardContent>
              <Grid container sx={{alignItems:'flex-end'}}>
                <Grid item xs={12} sm={1}><IconButton><Close/></IconButton></Grid>
                <Grid item xs={12} sm={4}><Select variant='standard' fullWidth placeholder="Select Column">
                  {allColumns.map(c=><MenuItem key={c.id}>{c.Header}</MenuItem>)}
                </Select></Grid>
                <Grid item xs={12} sm={3}><Select variant='standard' fullWidth placeholder="Select Column">
                  {allColumns.map(c=><MenuItem key={c.id}>{c.Header}</MenuItem>)}
                </Select></Grid>
                <Grid item xs={12} sm={4}><TextField fullWidth variant='standard' label='Value'/></Grid>
              </Grid>
            </CardContent>
          </Card>
        </PopupPanel>
        <Button color="primary" size="small" onClick={handleReset}><AutorenewRounded/> Reset</Button>
      </Stack>
      <StyledTable {...getTableProps()}>
        <div>
          {headerGroups.map((headerGroup:any, i) => (
            <StyledTableRow key={i} style={{minWidth:'100%', width:'max-content', display:'flex'}}>
              {headerGroup.headers.map((column:any) => (
                <StyledTableCell key={column.id} style={{width:column.width}}>
                  {column.canGroupBy ? (
                    // If the column can be grouped, let's add a toggle
                    <span {...column.getGroupByToggleProps()}>
                      {column.isGrouped ? <AddBoxTwoTone /> : <IndeterminateCheckBoxTwoTone/>}
                    </span>
                  ) : null}
                  {column.render('Header')}

                  {/* Use column.getResizerProps to hook up the events correctly */}
                  <Box
                    sx={{
                      display: 'inline-block',
                      background: 'lightgrey',
                      cursor:'col-resize',
                      width: '2px',
                      height: '100%',
                      position: 'absolute',right: 0, top: 0,
                      transform: 'translateX(50%) scale(1,1)',
                      zIndex: 1,
                      touchAction:'none',
                      '&.isResizing': {
                        background: 'grey',
                      }}}
                    {...column.getResizerProps()}
                    className={`resizer ${
                      column.isResizing ? 'isResizing' : ''
                    }`}
                    onMouseUp={console.log}
                  />
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </div>

        <div {...getTableBodyProps()}>
          <rw.FixedSizeList
            height={height}
            itemCount={rows.length}
            itemSize={48}
            width={'100%'}
          >
            {RenderRow}
          </rw.FixedSizeList>
        </div>
        {/* <pre>
          <code>{JSON.stringify(state, null, 2)}</code>
        </pre> */}
      </StyledTable>
      </div>
    )
  }

export default DataTable;
