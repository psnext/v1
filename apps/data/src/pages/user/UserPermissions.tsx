import React from 'react';
import { Alert, Box, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useUserPermissions } from '../../hooks/userApi';

export function UserPermissions(props: { id: string; }) {
  const { permissions = [], isLoading, error } = useUserPermissions(props.id);

  if (error) {
    console.error(error);
    return <Alert severity="error">Unable to load permissions.</Alert>;
  }
  return <Box>
    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Permission</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {permissions.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>
                {p.display_name}
                <p><em>{p.description}</em></p>
                <strong>{p.condition}</strong>
              </TableCell>
            </TableRow>
          ))}
          {isLoading ? (<TableRow key='loading'>
            <TableCell><Skeleton variant='text' animation="wave" /></TableCell>
            <TableCell><Skeleton variant='text' animation="wave" /></TableCell>
          </TableRow>) : null}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>;
}
