import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../constants/constants";
import UserService from "../../services/UserService";
import logo from "../../assets/avionchat.png";
import welcomeImage from "../../assets/cuate.svg";
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
  const [showAddChannelMembers, setShowAddChannelMembers] = useState(false);
  const [channelMembers, setChannelMembers] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [usersToAdd, setUsersToAdd] = useState([]);
  const [message, setMessage] = useState("");
  const [channelMessages, setChannelMessages] = useState([]);

  const messagesEndRef = useRef(null); // Ref to the end of the messages list

  // New state for the welcome message
  const [welcomeMessage, setWelcomeMessage] = useState("");

  // Scroll to the bottom of the messages list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(
    () => {
      scrollToBottom(); // Scroll to bottom when messages array changes
    },
    [messages],
    [channelMessages]
  );

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
    // Set welcome message on initial login
    setWelcomeMessage(`Welcome ${user.uid}! Start chatting.`);
  }, [user]);

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

  //DISPLAY CHANNEL MEMBERS
  useEffect(() => {
    const fetchChannelMembers = async () => {
      if (selectedChannel) {
        try {
          const headers = {
            "access-token": user.accessToken,
            expiry: user.expiry,
            client: user.client,
            uid: user.uid,
          };

          const response = await axios.get(
            `${API_URL}/channels/${selectedChannel.id}`,
            { headers }
          );

          // Extract the channel_members array from the response data
          const members = response.data.data?.channel_members || [];

          // Map members to their corresponding user details from userList
          const membersWithDetails = members.map((member) => {
            const userDetails = userList.find(
              (user) => user.id === member.user_id
            );
            return {
              ...member,
              email: userDetails?.email || "Unknown", // Add email or 'Unknown' if not found
            };
          });

          setChannelMembers(membersWithDetails);
        } catch (error) {
          console.error("Error fetching channel members:", error);
          setChannelMembers([]); // Reset members list on error
        }
      } else {
        setChannelMembers([]); // Clear members if no channel is selected
      }
    };

    fetchChannelMembers();
  }, [selectedChannel, user, userList]);

  //LEAVE CHANNEL FUNCTION
  async function handleLeaveChannel() {
    if (!selectedChannel) {
      setMessage("No channel selected.");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        "access-token": user.accessToken,
        expiry: user.expiry,
        client: user.client,
        uid: user.uid,
      };

      const response = await axios.post(
        `${API_URL}/channel/remove_member`, //*******MAKE SURE THIS API ENDPOINT EXISTS */
        {
          id: selectedChannel.id, // Channel ID
          member_id: user.id, // User ID to remove (current user)
        },
        { headers }
      );

      if (response.status === 200) {
        setMessage("You have left the channel.");
        setSelectedChannel(null); // Clear the selected channel
        setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
      } else {
        console.error("Failed to leave the channel:", response.data);
        setMessage("Failed to leave the channel.");
      }
    } catch (error) {
      console.error("Error leaving the channel:", error);
      setMessage("Failed to leave the channel. Please try again.");
    }
  }

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

  function handleChannelSelect(channel) {
    setSelectedChannel(channel);
    setSelectedUser(null);
    setShowCreateChannel(false);
  }

  //FETCH MESSAGE
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

  //SEND MESSAGE
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
      // sets up headers for the API request, including a token for authentication.
      const headers = {
        "Content-Type": "application/json",
        "access-token": user.accessToken,
        expiry: user.expiry,
        client: user.client,
        uid: user.uid,
      };

      const response = await axios.post(
        `${API_URL}/channels`, //sends a POST request to API to create a new channel with the name provided in the form.
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
      // setMessage("Failed to create channel.");
      // setTimeout(() => setMessage(""), 3000);
    }
  }

  //ADD USERS TO CHANNEL
  async function handleAddUsersToChannel() {
    if (usersToAdd.length === 0) {
      setMessage("No users selected.");
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        "access-token": user.accessToken,
        expiry: user.expiry,
        client: user.client,
        uid: user.uid,
      };

      // Loop through usersToAdd array and make API calls for each user
      const addUserPromises = usersToAdd.map((userId) =>
        axios.post(
          `${API_URL}/channel/add_member?id=${selectedChannel.id}&member_id=${userId}`,
          null, // No body required since params are in the URL
          { headers }
        )
      );

      // Wait for all API calls to finish
      const responses = await Promise.all(addUserPromises);

      // Check if all users were added successfully
      if (responses.every((response) => response.status === 200)) {
        setMessage("Users added successfully!");
        setShowAddUsers(false);
        setTimeout(() => setMessage(""), 3000); // Clear msg after 3 seconds

        // Find the users in userList and add them to channelMembers
        const addedUsers = usersToAdd
          .map((userId) =>
            userList.find((user) => user.id === parseInt(userId))
          )
          .filter((user) => user !== undefined); // Filter out any undefined users

        setChannelMembers((prevMembers) => [...prevMembers, ...addedUsers]);

        // Clear the usersToAdd state
        setUsersToAdd([]);
      }
    } catch (error) {
      console.error("Failed to add users to channel", error);
      setMessage("Failed to add users. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  //NO STACKING OF SAME IDs
  function handleUserSelection(userId) {
    setUsersToAdd([userId]);
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

        const response = await axios.post(`${API_URL}/messages`, payload, {
          headers,
        });

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
                <div
                  className="sidenav-dropdown"
                  onClick={() => setShowChannels(!showChannels)}
                >
                  Channels{" "}
                  <i
                    className={`fas fa-caret-${showChannels ? "up" : "down"}`}
                  ></i>
                </div>

                {showChannels && (
                  <>
                    <div className="create-channel-button">
                      <button
                        className="channel-button"
                        onClick={() => {
                          setShowCreateChannel(true);
                          setSelectedChannel(false);
                        }}
                      >
                        Create New Channel
                      </button>
                    </div>

                    <ul className="dropdown-channels">
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
                    </ul>
                  </>
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
          <>
            <div className="messages-header">
              <h2>Chat with {selectedUser.email}</h2>
            </div>
            <div className="messages-section">
              <div className="messages-list">
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message-item ${
                        msg.sender.id === user.id ? "my-message" : ""
                      }`}
                    >
                      <div className="message-sender">
                        {msg.sender.email}{" "}
                        {/* Assuming the sender's email is available */}
                      </div>
                      <div className="message-body">{msg.body}</div>
                    </div>
                  ))
                ) : (
                  <p>No messages to display</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <button onClick={sendMessage}>Send Message</button>
              </div>
            </div>
          </>
        ) : selectedChannel ? (
          <>
            <div className="messages-header-channel">
              <h2>Channel Name: {selectedChannel.name}</h2>
              <div className="header-buttons">
              <button
                className="primary-button"
                onClick={() => setShowAddUsers(true)}
              >
                Add Users to Channel
              </button>
              <button
                className="primary-button"
                onClick={() => setShowAddChannelMembers(true)}
              >
                Channel Members
              </button>
              <button
                className="primary-button-red"
                onClick={handleLeaveChannel}
              >
                Leave
              </button>
              </div>
            </div>
            <div className="messages-section">
              <div className="messages-list">
                {channelMessages.length > 0 ? (
                  channelMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message-item ${
                        msg.sender.id === user.id ? "my-message" : ""
                      }`}
                    >
                      <div className="message-sender">
                        {msg.sender.email}{" "}
                        {/* Assuming the sender's email is available */}
                      </div>
                      <div className="message-body">{msg.body}</div>
                    </div>
                  ))
                ) : (
                  <p>No messages to display</p>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message"
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          </>
        ) : (
          // Show the welcome message when no user or channel is selected
          <div className="welcome-message">
            <h2 className="welcome-greeting">{welcomeMessage}</h2>
            <img className="welcome-image" src={welcomeImage} alt="Welcome illustration" />
          </div>
        )}
        {showAddUsers && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add Users to Channel</h2>
              <form className="add-users-form" onSubmit={handleFormSubmit}>
                <div className="user-list">
                  {userList.map((user) => (
                    <div key={user.id}>
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        value={user.id}
                        onChange={(e) => {
                          const userId = e.target.value;
                          setUsersToAdd(
                            (prevUsers) =>
                              e.target.checked
                                ? [...prevUsers, userId] // Add user ID if checked
                                : prevUsers.filter((id) => id !== userId) // Remove user ID if unchecked
                          );
                        }}
                      />
                      <label htmlFor={`user-${user.id}`}>{user.email}</label>
                    </div>
                  ))}
                </div>
                <div className="buttons-modal">
                  <button type="submit">Add Users</button>
                  <button type="button" onClick={() => setShowAddUsers(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showAddChannelMembers && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Channel Members</h2>
              <div className="member-list">
                {channelMembers.length > 0 ? (
                  channelMembers.map((member) => (
                    <div key={member.id}>
                      <span>{member.email}</span>
                      {/* Add more member details here, e.g., email */}
                    </div>
                  ))
                ) : (
                  <p>No members found in this channel.</p>
                )}
              </div>
              <div className="buttons-modal">
                <button
                  type="button"
                  onClick={() => setShowAddChannelMembers(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {showCreateChannel && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Create a New Channel</h2>
              <form onSubmit={handleCreateChannel}>
                <input
                  type="text"
                  placeholder="Channel Name"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  required
                />
                <div className="buttons-modal">
                  <button type="submit">Create</button>
                  <button
                    type="button"
                    onClick={() => setShowCreateChannel(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;
