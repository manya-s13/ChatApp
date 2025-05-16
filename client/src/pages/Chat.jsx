import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Paper, Typography, Grid, AppBar, Toolbar } from '@mui/material';
import UserList from './UserList';
import io from 'socket.io-client';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/verify', { withCredentials: true });
        setCurrentUser(response.data.user);
      } catch (error) {
        navigate('/');
      }
    };
    checkAuth();

    const newSocket = io('http://localhost:3000', {
        withCredentials: true
      });
    setSocket(newSocket);

    newSocket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => newSocket.disconnect();
  }, [navigate]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/messages/${selectedUser._id}/${selectedUser._id}`, 
            { withCredentials: true }
          );
          setMessages(response.data);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    try {
        const response = await axios.post('http://localhost:3000/api/messages/send', {
          content: message,
          receiver: selectedUser._id
        }, { withCredentials: true });
        
        setMessages(prev => [...prev, response.data.data]);
        setMessage('');
        
        if (socket) {
            socket.emit('sendMessage', {
              sender: response.data.data.sender,
              receiver: selectedUser._id,
              content: message
            });
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Chat App
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 2 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid item size={3}>
            <UserList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
          </Grid>
          <Grid item size={9}>
            <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedUser ? `Chat with ${selectedUser.name}` : 'Select a user to chat'}
              </Typography>
              <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                {messages.map((msg, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography>{msg.content}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message"
                  disabled={!selectedUser}
                />
                <Button variant="contained" onClick={sendMessage} disabled={!selectedUser}>
                  Send
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Chat;
