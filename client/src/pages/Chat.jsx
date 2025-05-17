import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import io from 'socket.io-client';

// Icons
import { 
  Menu, 
  X, 
  MoreVertical, 
  LogOut, 
  User, 
  Send, 
  ChevronLeft
} from 'lucide-react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  // Scrolls to the bottom of messages
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setMenuOpen(false);
  };

  const handleEditProfile = () => {
    navigate('/profile');
    setMenuOpen(false);
  };

  // Mock function to fetch users, replace with your actual implementation
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/users', { withCredentials: true });
      setUserList(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Handle incoming socket messages
  useEffect(() => {
    const checkAuth = async () => {
      try {1
        const response = await axios.get('http://localhost:3000/api/auth/verify', { withCredentials: true });
        setCurrentUser(response.data.user);
      } catch (error) {
        navigate('/');
      }
    };
    checkAuth();
    fetchUsers();

    const newSocket = io('http://localhost:3000', {
      withCredentials: true
    });
    setSocket(newSocket);

    newSocket.on('newMessage', (message) => {
      // Add the new message to both current messages and cached messages
      if (selectedUser && (message.sender === selectedUser._id || message.receiver === selectedUser._id)) {
        setMessages(prev => [...prev, message]);
      }
      
      // Update conversations map
      const conversationId = message.sender === currentUser?._id ? message.receiver : message.sender;
      setConversationsMap(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message]
      }));
    });

    return () => newSocket.disconnect();
  }, [navigate, currentUser]);

  // Store messages for each conversation
  const [conversationsMap, setConversationsMap] = useState({});

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          // Check if we already have cached messages for this user
          if (!conversationsMap[selectedUser._id]) {
            const response = await axios.get(`http://localhost:3000/api/messages/${currentUser?._id}/${selectedUser._id}`, 
              { withCredentials: true }
            );
            // Update the conversations map with the fetched messages
            setConversationsMap(prev => ({
              ...prev,
              [selectedUser._id]: response.data
            }));
            setMessages(response.data);
          } else {
            // Use cached messages
            setMessages(conversationsMap[selectedUser._id]);
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUser, currentUser, conversationsMap]);

  const sendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    try {
      const response = await axios.post('http://localhost:3000/api/messages/send', {
        content: message,
        receiver: selectedUser._id
      }, { withCredentials: true });
      
      const newMessage = response.data.data;
      
      // Update both the current messages and the cached messages
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation map to store the new message
      setConversationsMap(prev => ({
        ...prev,
        [selectedUser._id]: [...(prev[selectedUser._id] || []), newMessage]
      }));
      
      setMessage('');
      
      if (socket) {
        socket.emit('sendMessage', {
          sender: newMessage.sender,
          receiver: selectedUser._id,
          content: message
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white">
      {/* Mobile sidebar toggle */}
      <div className={`md:hidden fixed top-4 ${sidebarOpen ? 'left-64' : 'left-4'} z-50`}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-black rounded-full p-2 text-white"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-40 w-64 h-full bg-[#212121] backdrop-blur-md shadow-lg`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5.5">
          <div className="flex items-center">
            {/* <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-2"> */}
              <img src='/logo.png' alt='logo' className='h-8 w-8' />
            {/* </div> */}
            <h1 className="text-xl font-semibold pl-2">Direct Chat</h1>
          </div>
        </div>

        {/* Users list */}
        <div className="overflow-y-auto h-full pb-20">
          <h2 className="text-gray-400 text-sm font-medium px-4 py-2 sticky top-0 bg-[#212121]">
            Conversations
          </h2>
          {userList.length > 0 ? (
            userList.map((user) => (
              <div 
                key={user._id} 
                onClick={() => setSelectedUser(user)}
                className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-600 transition-colors duration-200 ${selectedUser && selectedUser._id === user._id ? 'bg-gray-600' : ''}`}
              >
                <div className="h-10 w-10 rounded-full bg-violet-500 flex items-center justify-center mr-3">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-400">
                    {user.status || 'Online'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-sm px-4 py-2">No users available</div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Nav Bar */}
      <div className="bg-[#212121] p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <img src={currentUser?.profilePic || '/avatar.jpg'}  alt='avatar' height={50} width={50} className='rounded-full' />
          <h2 className="font-medium pl-2">{currentUser?.name}</h2>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-600 rounded-md shadow-lg z-50 py-1">
              <button 
                onClick={handleEditProfile}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700"
              >
                <User size={16} className="mr-2" />
                Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-700 text-red-400"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>


        {/* Header */}
        <div className="bg-[#3b3b3b] p-4 flex items-center justify-between shadow-md">
          {selectedUser ? (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-violet-500 flex items-center justify-center mr-3">
                {selectedUser.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="font-medium">{selectedUser.name}</h2>
                <p className="text-sm text-gray-400">
                  {selectedUser.status || 'Online'}
                </p>
              </div>
            </div>
          ) : (
            <h2 className="font-medium">Select a conversation</h2>
          )}

          {/* Menu button */}
         
        </div> 

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 bg-black/60">
          {selectedUser ? (
            messages.length > 0 ? (
              <div className="flex flex-col space-y-3">
                {messages.map((msg, index) => {
                  const isMine = msg.sender === currentUser?._id;
                  const messageDate = new Date(msg.timestamp).toDateString();
                  const prevMessageDate =
                  index > 0 ? new Date(messages[index - 1].timestamp).toDateString() : null;
              
                const showDate =
                  index === 0 || messageDate !== prevMessageDate;
              
                  return (

                    <React.Fragment 
                      key={index} >
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                            {new Date(msg.timestamp).toLocaleDateString(undefined, {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          isMine ? 'bg-indigo-800' : 'bg-gray-600'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <span className="text-xs text-gray-400 block mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messageEndRef} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No messages yet. Start a conversation!</p>
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <img src='/logo.png' alt='logo' width={300} height={300}/>
              <h3 className="text-xl font-medium mb-2">Welcome to Direct Chat</h3>
              <p className="text-gray-400 text-center max-w-md">
                Select a User to start chatting
              </p>
            </div>
          )}
        </div>

        {/* Message input */}
        {selectedUser && (
          <div className="bg-[#3b3b3b] p-4 border-t border-[#3b3b3b]">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-black/100 border border-black/60 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className={`p-2 rounded-full ${
                  message.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-black/100 cursor-not-allowed'
                } transition-colors duration-200`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;