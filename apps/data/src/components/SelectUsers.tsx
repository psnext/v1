/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { Card, Chip } from "@mui/material";
import { PopupPanel, MultiSelectList } from "@psni/sharedui";

export function SelectUsers(props: { users: Array<any>; selected: Array<any>; onChange: any; }) {
  const { users = [], selected = [], onChange = null } = props;

  const handleDelete = useCallback((u: any) => {
    const idx = selected.indexOf(u);
    if (idx !== -1) {
      const newlist = [...selected];
      newlist.splice(idx, 1);
      onChange(newlist);
    }
  }, [selected, onChange]);

  const handleChange = (selected: any) => {
    onChange(selected);
  };

  return (<PopupPanel buttonContent={<div>
    {selected.map((u: any) => <Chip key={u?.id || '0'} label={u?.name} onDelete={() => handleDelete(u)} />)}
  </div>}>
    <Card sx={{ p: 2, minWidth: 200 }}>
      <MultiSelectList
        value={selected}
        options={users}
        getOptionLabel={(o: any) => o.name}
        getOptionSubLabel={(o: any) => o.details.title}
        onChange={handleChange}
        itemProps={{ sx: { px: 0 } }} />
    </Card>
  </PopupPanel>
  );
}
