import { useEffect, useState } from "react";
import { API_URL } from "../../constants/constants";
import UserService from "../../services/UserService";
import logo from "../../assets/avionchat.png";
import "./homepage.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

function Homepage(props) {
  const { setIsLoggedIn, user } = props;
  const [userList, setUserList] = useState([]);
  const [channels, setChannels] = useState([]);
  const [showChannels, setShowChannels] = useState(false);
  const [showDirectMessages, setShowDirectMessages] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Define states for Create Channel and Add Users to Channel
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [showAddUsers, setShowAddUsers] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [usersToAdd, setUsersToAdd] = useState([]);
  const [message, setMessage] = useState("");
  const [channelMessages, setChannelMessages] = useState([]);

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

        if (response.status === 200 && Array.isArray(response.data.data)) {
          setChannels(response.data.data);
        } else if (response.data.errors) {
          console.error("Error fetching channels:", response.data.errors);
          setChannels([]); // Set channels to an empty array
        } else {
          console.error("Unexpected response format:", response);
          setChannels([]); // Set channels to an empty array if unexpected format
        }
      } catch (error) {
        console.error("Failed to fetch channels", error);
        setChannels([]); // Optionally set an empty array in case of an error
      }
    }
    fetchChannels();
  }, [user]);

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (!selectedChannel) {
      alert("Please select a channel.");
      return;
    }

    handleAddUsersToChannel();
  }

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();

      const intervalId = setInterval(() => {
        fetchMessages();
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [selectedUser]);

  function handleUserSelect(user) {
    setSelectedUser(user);
    setSelectedChannel(null);
    setShowCreateChannel(false);
  }

  function handleChannelSelect(channel){
    setSelectedChannel(channel);
    setSelectedUser(null);
    setShowCreateChannel(false);
  }

  async function fetchMessages() {
    if (selectedUser) {
      try {
        const headers = {
          "access-token": user.accessToken,
          expiry: user.expiry,
          client: user.client,
          uid: user.uid,
        };

        const response = await axios.get(
          `${API_URL}/messages?receiver_id=${selectedUser.id}&receiver_class=User`,
          { headers }
        );
        if (response.status === 200) {
          setMessages(response.data.data);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    }
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

        const response = await axios.post(
          `${API_URL}/messages`,
          {
            receiver_id: selectedUser.id,
            receiver_class: "User",
            body: newMessage,
          },
          { headers }
        );

        if (response.status === 200) {
          fetchMessages();
          setNewMessage("");
        }
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  }

  async function handleCreateChannel(e) {
    e.preventDefault();

    try {
      const headers = {
        "Content-Type": "application/json",
        "access-token": user.accessToken,
        expiry: user.expiry,
        client: user.client,
        uid: user.uid,
      };

      const response = await axios.post(
        `${API_URL}/channels`,
        {
          name: channelName,
        },
        { headers }
      );

      if (response.status === 200) {
        console.log("Channel created successfully:", response.data);
        setMessage("Channel created successfully!");
        setTimeout(() => setMessage(""), 3000); //clear msg after 3secs
        setShowCreateChannel(false);
        setChannelName("");
      }
    } catch (error) {
      console.error("Failed to create channel", error);
      setMessage("Failed to create channel.");
      setTimeout(() => setMessage(""), 3000);
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
      const response = await axios.post(
        `${API_URL}/channel/add_member`,
        {
          user_ids: usersToAdd,
          channel_id: selectedChannel,
        },
        { headers }
      );

      if (response.status === 200) {
        setMessage("Users added successfully!");
        setShowAddUsers(false);
        setTimeout(() => setMessage(""), 3000); //clear msg after 3secs
      }
    } catch (error) {
      console.error("Failed to add users to channel", error);

      setMessage("Failed to add users. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  useEffect(() => {
    if (selectedChannel) {
      fetchChannelMessages();
  
      const intervalId = setInterval(() => {
        fetchChannelMessages();
      }, 1000);
  
      return () => clearInterval(intervalId);
    }
  }, [selectedChannel]);
  
  async function fetchChannelMessages() {
    if (selectedChannel) {
      try {
        const headers = {
          "access-token": user.accessToken,
          expiry: user.expiry,
          client: user.client,
          uid: user.uid,
        };
  
        const response = await axios.get(
          `${API_URL}/messages?receiver_id=${selectedChannel.id}&receiver_class=Channel`,
          { headers }
        );
  
        if (response.status === 200) {
          setChannelMessages(response.data.data);
        } else {
          console.error("Failed to fetch channel messages");
        }
      } catch (error) {
        console.error("Failed to fetch channel messages", error);
      }
    }
  }

  async function sendMessage() {
    if ((selectedUser || selectedChannel) && newMessage.trim()) {
      try {
        const headers = {
          "Content-Type": "application/json",
          "access-token": user.accessToken,
          expiry: user.expiry,
          client: user.client,
          uid: user.uid,
        };
  
        const payload = {
          body: newMessage,
        };
  
        if (selectedUser) {
          payload.receiver_id = selectedUser.id;
          payload.receiver_class = "User";
        } else if (selectedChannel) {
          payload.receiver_id = selectedChannel.id;
          payload.receiver_class = "Channel";
        }
  
        const response = await axios.post(
          `${API_URL}/messages`,
          payload,
          { headers }
        );
  
        if (response.status === 200) {
          selectedUser ? fetchMessages() : fetchChannelMessages();
          setNewMessage("");
        }
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  }
  function logout() {
    localStorage.clear();
    setIsLoggedIn(false);
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
                <a onClick={() => setShowChannels(!showChannels)}>
                  Channels{" "}
                  <i
                    className={`fas fa-caret-${showChannels ? "up" : "down"}`}
                  ></i>
                </a>
                {showChannels && (
                  <ul className="dropdown">
                    {channels.map((channel) => (
                      <li key={channel.id}>
                        <a
                          style={{ cursor: "pointer" }}
                          onClick={() => handleChannelSelect(channel)}
                        >
                          {channel.name}
                        </a>
                      </li>
                    ))}
                      <li>
                        <a onClick={() => {
                          setShowCreateChannel(true);
                          setSelectedChannel(false);
                        }}>
                          Create New Channel
                        </a>
                      </li>
                  </ul>
                )}
              </li>
              <li>
                <div
                  className="sidenav-dropdown"
                  onClick={() => setShowDirectMessages(!showDirectMessages)}
                >
                  Direct Messages{" "}
                  <i
                    className={`fas fa-caret-${
                      showDirectMessages ? "up" : "down"
                    }`}
                  ></i>
                </div>
                {showDirectMessages && (
                  <ul className="dropdown-users">
                    {userList.length > 0 ? (
                      userList.map((student) => (
                        <li key={student.id}>
                          <div
                            className={`dropdown-users-results ${
                              selectedUser?.id === student.id ? "selected" : ""
                            }`}
                            onClick={() => handleUserSelect(student)}
                          >
                            {student.email}
                          </div>
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
            <button className="primary-btn logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {message && <div className="message-box">{message}</div>}

        {selectedUser ? (
          <div className="messages-section">
            <h2>Chat with {selectedUser.email}</h2>
            <div className="messages-list">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div key={index} className="message-item">
                    {msg.body}
                  </div>
                ))
              ) : (
                <p>No messages yet.</p>
              )}
            </div>
            <div className="send-message">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message"
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        ) : selectedChannel ? (
        <div className="messages-section">
          <h2>Channel Name: {selectedChannel.name}</h2>
          <button onClick={() => setShowAddUsers(true)}>
                  Add Users to Channel
                </button>
                {showAddUsers && (
                  <div className="add-users-section">
                    <h2>Add Users to Channel</h2>
                    <form onSubmit={handleFormSubmit}>
                      <div className="user-list">
                        {userList.map((user) => (
                          <div key={user.id}>
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              value={user.id}
                              onChange={(e) => {
                                const userId = e.target.value;
                                setUsersToAdd((prevUsers) =>
                                  e.target.checked
                                    ? [...prevUsers, userId]
                                    : prevUsers.filter((id) => id !== userId)
                                );
                              }}
                            />
                            <label htmlFor={`user-${user.id}`}>
                              {user.email}
                            </label>
                          </div>
                        ))}
                      </div>
                      <button type="submit">Add Users</button>
                      <button onClick={() => setShowAddUsers(false)}>
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
          <div className="messages-list">
            {channelMessages.length > 0 ? (
              channelMessages.map((msg, index) => (
                <div key={index} className="message-item">
                  {msg.body}
                </div>
              ))
            ) : (
              <p>No messages yet.</p>
            )} 
             </div>
             <div className="send-message">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      ) : (
          <>
            {showCreateChannel && (
              <div className="create-channel-section">
                <h2>Create a New Channel</h2>
                <form onSubmit={handleCreateChannel}>
                  <input
                    type="text"
                    placeholder="Channel Name"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                  />
                  <button type="submit">Create</button>
                  <button onClick={() => setShowCreateChannel(false)}>
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Homepage;
