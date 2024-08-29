import { useEffect, useState } from "react";
import UserService from "../../services/UserService";
import logo from '../../assets/avionchat.png';
import "./homepage.css";
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome

function Homepage(props) {
  const { setIsLoggedIn, user } = props;
  const [userList, setUserList] = useState([]);
  const [showChannels, setShowChannels] = useState(false);
  const [showDirectMessages, setShowDirectMessages] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const users = await UserService.getUsers(user);
      setUserList(users);
    }
    if (userList.length === 0) {
      fetchUsers();
    }
  }, [userList.length, user]);

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
                <a
                  href="#"
                  onClick={() => setShowChannels(!showChannels)}
                >
                  Channels{" "}
                  <i className={`fas fa-caret-${showChannels ? "up" : "down"}`}></i>
                </a>
                {showChannels && (
                  <ul className="dropdown">
                    <li><a href="/channel/1">Channel 1</a></li>
                    <li><a href="/channel/2">Channel 2</a></li>
                    <li><a href="/channel/3">Channel 3</a></li>
                    {/* Add more channels as needed */}
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
                        <li key={student.id}><a href={`/dm/${student.id}`}>{student.email}</a></li>
                      ))
                    ) : (
                      <li>No Direct Messages Available</li>
                    )}
                  </ul>
                )}
              </li>
            </ul>
          </div>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="main-content">
        <h1>This is my dashboard</h1>
      </div>
    </div>
  );
}

export default Homepage;
