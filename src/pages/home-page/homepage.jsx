import { useEffect, useState } from "react";
import { API_URL } from "../../constants/constants";
import UserService from "../../services/UserService";
import logo from '../../assets/avionchat.png';
import "./homepage.css";
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome
import axios from 'axios';

function Homepage(props) {
  const { setIsLoggedIn, user } = props;
  const [userList, setUserList] = useState([]);
  const [channels, setChannels] = useState([]); // Add state for channels
  const [showChannels, setShowChannels] = useState(false);
  const [showDirectMessages, setShowDirectMessages] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // State for selected user
  const [messages, setMessages] = useState([]); // State for messages
  const [newMessage, setNewMessage] = useState(""); // State for new message

    // Define states for Create Channel and Add Users to Channel
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [showAddUsers, setShowAddUsers] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [usersToAdd, setUsersToAdd] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const users = await UserService.getUsers(user);
      setUserList(users);
    }
    if (userList.length === 0) {
      fetchUsers();
    }
  }, [userList.length, user]);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const headers = {
          "access-token": user.accessToken,
          expiry: user.expiry,
          client: user.client,
          uid: user.uid,
        };
        const response = await axios.get(`${API_URL}/channels`, { headers });
        if (response.status === 200) {
          setChannels(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch channels', error);
      }
    }
    fetchChannels();
  }, [user]);

  // Define fetchMessages inside the Homepage component
  async function fetchMessages() {
    if (selectedUser) {
      try {
        const headers = {
          "access-token": user.accessToken,
          expiry: user.expiry,
          client: user.client,
          uid: user.uid,
        };

        const response = await axios.get(`${API_URL}/messages?receiver_id=${selectedUser.id}&receiver_class=User`, { headers });
        if (response.status === 200) {
          console.log('Fetched messages:', response.data); // Debugging line
          setMessages(response.data.data); // Ensure you're setting the correct data
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    }
  }

  useEffect(() => {
    fetchMessages(); // Call fetchMessages when selectedUser changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, user]);

  function handleUserSelect(user) {
    setSelectedUser(user);
  }

  async function sendMessage() {
    if (selectedUser && newMessage.trim()) {
      try {
        const headers = {
          "Content-Type": "application/json",
          "access-token": user.accessToken,
          expiry: user.expiry,
          client: user.client,
          uid: user.uid,
        };

        const response = await axios.post(`${API_URL}/messages`, {
          receiver_id: selectedUser.id,
          receiver_class: "User",
          body: newMessage // Ensure this matches your API's expected field name
        }, { headers });

        if (response.status === 200) {
          // Optionally, refetch the messages to ensure the list is updated
          fetchMessages(); // Call the fetchMessages function again to refresh the message list
          setNewMessage(""); // Clear the input field after sending
        }
      } catch (error) {
        console.error('Failed to send message', error);
      }
    }
  }

  function logout() {
    localStorage.clear();
    setIsLoggedIn(false);
  }

  async function handleCreateChannel(e) {
    e.preventDefault(); 
  
    try {
      const headers = {
        "Content-Type": "application/json",
        "access-token": user.accessToken, 
        expiry: user.expiry,
        client: user.client,
        uid: user.uid
      }; 

      const response = await axios.post(`${API_URL}/channels`, {
        name: channelName
      }, {headers}); 

      if (response.status === 200) {
        console.log('Channel created successfully:', response.data); 
        setShowCreateChannel(false);
        setChannelName(''); // Clear the input after channel creation
      }
    } catch (error) {
      console.error('Failed to create channel', error); 
    }
  }

  async function handleAddUsersToChannel() {
    try {
      const headers = {
        "Content-Type": "application/json",
        "access-token": user.accessToken,
        expiry: user.expiry,
        client: user.client,
        uid: user.uid,
      };
      const response = await axios.post(`${API_URL}/channels/${selectedChannel}/users`, { user_ids: usersToAdd }, { headers });
      if (response.status === 200) {
        console.log('Users added successfully:', response.data);
        setShowAddUsers(false);
        // Optionally refresh user lists or channel details
      }
    } catch (error) {
      console.error('Failed to add users to channel', error);
    }
  }


  return (
    <div className="home-container">
      <div className="sidenav-container">
        <div className="sidenav">
          <div className="sidenav-menu">
            <div className="sidenav-logo">
              <img src={logo} alt="Avion Bank Logo" />
            </div>
            <ul>
            <li>
                <a
                  href="#"
                  onClick={() => setShowChannels(!showChannels)}
                >
                  Channels{" "}
                  <i className={`fas fa-caret-${showChannels ? "up" : "down"}`}></i>
                </a>
                {showChannels && (
                  <ul className="dropdown">
                    {channels.map((channel) => (
                      <li key={channel.id}>
                        <a href={`/channel/${channel.id}`}>{channel.name}</a>
                      </li>
                    ))}
                    <li><a href='#' onClick={() => setShowCreateChannel(true)}>Create New Channel</a></li>
                    {/* Optionally, add a link to manage users */}
                    {channels.length > 0 && (
                      <li><a href='#' onClick={() => setShowAddUsers(true)}>Add Users to Channel</a></li>
                    )}
                  </ul>
                )}
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => setShowDirectMessages(!showDirectMessages)}
                >
                  Direct Messages{" "}
                  <i className={`fas fa-caret-${showDirectMessages ? "up" : "down"}`}></i>
                </a>
                {showDirectMessages && (
                  <ul className="dropdown">
                    {userList.length > 0 ? (
                      userList.map((student) => (
                        <li key={student.id}>
                          <a href="#" onClick={() => handleUserSelect(student)}>
                            {student.email}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li>No Direct Messages Available</li>
                    )}
                  </ul>
                )}
              </li>
            </ul>
          </div>
          <div className="logout-button">
            <button className="primary-btn logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {selectedUser && (
          <div className="messages-section">
            <h2>Chat with {selectedUser.email}</h2>
            <div className="messages-list">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div key={index} className="message-item">
                    {msg.body} {/* Ensure this matches the field name in your API response */}
                  </div>
                ))
              ) : (
                <p>No messages to display</p>
              )}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}

         {/* Conditionally Render Create Channel Form */}
         {showCreateChannel && (
          <div className="create-channel-form">
            <h2>Create a New Channel</h2>
            <form onSubmit={handleCreateChannel}>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Enter channel name"
                required
              />
              <button type="submit">Create Channel</button>
              <button onClick={() => setShowCreateChannel(false)}>Cancel</button>
            </form>
          </div>
        )}

         {/* Conditionally Render Add Users to Channel Form */}
         {showAddUsers && (
    <div className="add-users-form">
      <h2>Add Users to Channel</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleAddUsersToChannel(); }}>
        <select multiple value={usersToAdd} onChange={(e) => setUsersToAdd(Array.from(e.target.selectedOptions, option => option.value))}>
          {userList.map(user => (
            <option key={user.id} value={user.id}>{user.email}</option>
          ))}
        </select>
        <button type="submit">Add Users</button>
        <button onClick={() => setShowAddUsers(false)}>Cancel</button>
      </form>
    </div>
  )}
      </div>
    </div>
  );
}

export default Homepage;
