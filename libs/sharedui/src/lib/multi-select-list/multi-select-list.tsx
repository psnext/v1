/* eslint-disable @typescript-eslint/ban-types */

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListSubheader from '@mui/material/ListSubheader';
import { useTheme } from '@mui/material/styles';
import { VariableSizeList } from 'react-window';
import {MenuItem, Checkbox, ListItemText} from '@mui/material';

const LISTBOX_PADDING = 8; // px

function renderRow(props:any) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref:any) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data:any) {
  const ref = React.useRef<any>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props:any, ref:any) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 48 : 52;

  const getChildSize = (child:any) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 52;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});


/* eslint-disable-next-line */
export interface MultiSelectListProps<D extends object> {
  options:Array<D>,
  value:Array<D>,
  getOptionLabel:(o:D)=>any,
  getOptionSubLabel?:any,
  onChange:any,
  itemProps:any,
  textProps?:any
}

export function MultiSelectList<D extends object>(props: MultiSelectListProps<D>) {
  const {options, value=[], getOptionLabel=(o:any)=>o, getOptionSubLabel=(o:any)=>null, onChange=console.log, itemProps={}, textProps={}} = props;
  const [filterValue, setFilterValue] = React.useState('');

  const handleFilterValueChange = (e: { target: { value: React.SetStateAction<string>; }; }) =>{
    setFilterValue(e.target.value);
  }

  const toggleSelected = (option:any)=>{
    const idx=value.indexOf(option);
    if (idx===-1){
      const items=[...value, option];
      onChange(items);
    } else {
      const selected=[...value]
      selected.splice(idx,1)
      onChange(selected);
    }
  }
  return <>
    <TextField fullWidth variant="outlined" size="small"
      placeholder="Filter list..."
      value={filterValue} onChange={handleFilterValueChange}
      {...textProps}
    />
    <ListboxComponent >
      {options
        .filter((o:any)=>getOptionLabel(o).toLowerCase().indexOf(filterValue.toLowerCase())!==-1)
        .map((option:any, i:number)=><MenuItem key={option.id||i} sx={itemProps.sx}>
        <Checkbox checked={value.indexOf(option)!==-1} onChange={()=>toggleSelected(option)}/>
        <ListItemText primary={getOptionLabel(option)} secondary={getOptionSubLabel(option)}
          onClick={()=>toggleSelected(option)}/>
      </MenuItem>)}
    </ListboxComponent>
  </>
}

export default MultiSelectList;
