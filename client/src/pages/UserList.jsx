
import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import axios from '../api/axios';

const UserList = ({ onSelectUser, selectedUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/users', { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Paper sx={{ height: '100%', overflow: 'auto', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Users</Typography>
      <List>
        {users.map((user) => (
          <ListItem 
            component = "button" 
            key={user._id}
            selected={selectedUser?._id === user._id}
            onClick={() => onSelectUser(user)}
          >
            <ListItemText primary={user.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default UserList;
