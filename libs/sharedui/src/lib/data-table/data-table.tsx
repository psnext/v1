/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import "./react-table-config.d.ts";
import React from "react";
import { useCallback, useMemo, useState} from 'react';
import * as rt from 'react-table';
import * as rw from 'react-window';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { AddBoxTwoTone, ArrowDropDownSharp, ArrowRightSharp, AutorenewRounded, Close, FilterListRounded, IndeterminateCheckBoxTwoTone, ViewColumnRounded } from '@mui/icons-material';
import {Button, ButtonGroup, Card, CardContent, Checkbox, Grid, IconButton, ListItem, ListItemButton, ListItemText, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PopupPanel from '../popup-panel/popup-panel';
import {matchSorter} from 'match-sorter';



// Define a default UI for filtering
function DefaultColumnFilter({
  column: { Header, filterValue, preFilteredRows, setFilter },
}:any) {
  const count = preFilteredRows.length

  return (
    <TextField variant="outlined" size="small" fullWidth focused
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`${Header} (${count})...`}
    />
  )
}

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}:any) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach((row:any) => {
      options.add(row.values[id])
    })
    return [...options.values()]
  }, [id, preFilteredRows])

  // Render a multi-select box
  return (
    <Select fullWidth sx={{minWidth:'25ch'}}
      value={filterValue}
      onChange={e => {
        setFilter(e.target.value || undefined)
      }}
    >
      <MenuItem value="">All</MenuItem>
      {options.map((option:any, i:number) => (
        <MenuItem key={i} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  )
}

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
    backgroundColor: '#f8fcff'
  },
  '&:hover': {
    backgroundColor: '#eff8ff',
    cursor:'pointer',
  },
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

const includes = function includes(rows:any, ids:any, filterValue:rt.FilterValue) {
  return rows.filter(function (row:any) {
    return ids.some(function (id:any) {
      const rowValue = row.values[id]||'';
      return rowValue.includes(filterValue);
    });
  });
};

includes.autoRemove = function (val:any) {
  return !val || !val.length;
};

function fuzzyTextFilterFn(rows:any, id:any, filterValue:rt.FilterValue) {
  return matchSorter(rows, filterValue, { keys: [(row:any) => row.values[id]] })
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val:any) => !val

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}:any) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = useState(globalFilter)
  const onChange = rt.useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <Stack direction="row" sx={{width:'100%', margin:"0.25em 0"}} alignItems="center">
      <TextField size="small" fullWidth
        value={value || ""}
        onChange={e => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`Search ${count} records...`}
        variant="outlined"
      />
    </Stack>
  )
}

const IndeterminateCheckbox = React.forwardRef(
  (props:any, ref) => {
    const { indeterminate, ...rest } = props;
    const defaultRef = React.useRef<any>()
    const resolvedRef:any = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <Checkbox ref={resolvedRef} {...rest} />
    )
  }
)
export interface DataTableProps<D extends object={}> {
  columns:rt.Column<D>[],
  data:Array<D>,
  initialState?: object,
  height?:number,
  onClick?:(row:any)=>void
  rowMenu?:any
}

export function DataTable<D extends object>(props: DataTableProps) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const { columns, data, initialState, height=500, onClick=()=>{} } = props;
    // Use the state and functions returned from useTable to build your UI
    const filterTypes = useMemo(
      () => {
        const filterTypes: rt.FilterTypes<D> = {
        includes,
        // Add a new fuzzyTextFilterFn filter type.
        fuzzyText: fuzzyTextFilterFn,
        // Or, override the default text filter to use
        // "startWith"
        text: (rows:Array<rt.Row<D>>, columnIds: Array<rt.IdType<D>>, filterValue:rt.FilterValue) => {
          return rows.filter((row:rt.Row<D>) => {
            const rowValue = row.values[columnIds[0]]
            return rowValue !== undefined
              ? String(rowValue)
                  .toLowerCase()
                  .startsWith(String(filterValue).toLowerCase())
              : true
          })
        },
      }
      return filterTypes;
    },
      []
    )

    const defaultColumn = useMemo(
      () => ({
        minWidth: 30,
        width: 150,
        maxWidth: 400,
        filter: "fuzzyText",
        Filter: DefaultColumnFilter
      }),
      []
    )

    const scrollBarSize = useMemo(() => scrollbarWidth(), [])

    const tableOptions:any = {
      columns,
      data,
      defaultColumn,
      initialState,
      filterTypes,
    };

    const {
      getTableProps,
      getTableBodyProps,
      getToggleAllRowsSelectedProps,
      toggleRowSelected,
      headerGroups,
      rows,
      allColumns,
      setAllFilters,
      visibleColumns,
      toggleHideColumn,
      prepareRow,
      state,
      preGlobalFilteredRows,
      setGlobalFilter,
    }:any = rt.useTable(
      tableOptions,
      rt.useFilters,
      rt.useGlobalFilter,
      rt.useGroupBy,
      rt.useSortBy,
      rt.useExpanded,
      rt.useRowSelect,
      rt.useBlockLayout,
      rt.useResizeColumns,
    )

    const handleReset = () => {
      allColumns.forEach((c:rt.Column)=>{
        if (!visibleColumns.find((vc:rt.Column)=>vc.id===c.id) && c.id) {
          toggleHideColumn(c.id);
        }
      })
      setAllFilters([]);
    };

    const handleRowSelection = (row:rt.Row<any>)=>{
      return (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(row.id + ` ${event.target.checked?'selected':'unselected'}`);
        toggleRowSelected(row.id, event.target.checked);
        console.log(state.selectedRowIds);
      }
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
            onClick={()=>onClick(row)}
          >
            {props.rowMenu?<StyledTableCell style={{width:50}}>
              {props.rowMenu}
            </StyledTableCell>:null}
            <StyledTableCell style={{width:50}}>
              <IndeterminateCheckbox checked={row.isSelected} onChange={handleRowSelection(row)}/>
            </StyledTableCell>
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
              {allColumns.map((c:rt.Column,i:number)=>(
                <ListItem key={i} disablePadding>
                  <ListItemButton onClick={()=>{toggleHideColumn(c.id as string)}}>
                  <Switch edge="start"
                    checked={visibleColumns.find((vc:rt.Column)=>vc.id===c.id)?true:false}
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
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="button">Filter</Typography>
                <Button onClick={()=>setAllFilters([])}>Reset</Button>
              </Stack>
              <Grid container sx={{alignItems:'flex-end'}} spacing={1}>
                {allColumns.map((column:any)=><Grid key={column.id} item xs={12} sm={6}>
                  <Box>
                    {column.canFilter ? column.render('Filter') : null}
                  </Box>
                </Grid>)}
              </Grid>
            </CardContent>
          </Card>
        </PopupPanel>
        <Button color="primary" size="small" onClick={handleReset}><AutorenewRounded/> Reset</Button>
        <Box mx={2}/>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}/>
      </Stack>
      <Box my={2}/>
      <StyledTable {...getTableProps()}>
        <div>
          {headerGroups.map((headerGroup:rt.HeaderGroup, i:number) => (
            <StyledTableRow key={i} style={{minWidth:'100%', width:'max-content', display:'flex'}}>
              {props.rowMenu?<StyledTableCell style={{width:50}}>
                #
              </StyledTableCell>:null}
              <StyledTableCell style={{width:50}}>
                <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
              </StyledTableCell>:
              {headerGroup.headers.map((column:any) => (
                <StyledTableCell key={column.id} style={{width:column.width}}>
                  {column.canGroupBy ? (
                    // If the column can be grouped, let's add a toggle
                    <span {...column.getGroupByToggleProps()}>
                      {column.isGrouped ? <AddBoxTwoTone /> : <IndeterminateCheckBoxTwoTone/>}
                    </span>
                  ) : null}
                  <PopupPanel buttonContent={column.render('Header')}>
                    <Card sx={{maxWidth:'100%'}}>
                      <CardContent>
                        <Stack spacing={1}>
                        <Typography variant="subtitle2">Sort {column.Header}</Typography>
                        <ButtonGroup color="primary" aria-label="outlined primary button group">
                          <Button startIcon={<ArrowDownwardIcon/>} variant={column.isSorted&&!column.isSortedDesc?'contained':'outlined'}
                            onClick={()=>column.toggleSortBy(false)}
                          >
                            Ascending</Button>
                          <Button startIcon={<ArrowUpwardIcon/>} variant={column.isSorted&&column.isSortedDesc?'contained':'outlined'}
                            onClick={()=>column.toggleSortBy(true)}
                          >
                            Descending</Button>
                        </ButtonGroup>
                        <hr/>
                        <Typography variant="subtitle2">Filter {column.Header}</Typography>
                        {column.canFilter ? column.render('Filter') : null}
                        </Stack>
                      </CardContent>
                    </Card>
                  </PopupPanel>
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
