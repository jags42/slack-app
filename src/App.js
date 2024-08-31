import './App.css';
import Homepage from "./pages/home-page/homepage";
import {useEffect, useState} from "react"; 
import { API_URL } from "./constants/constants";
import logo from '../src/assets/avionchat.png';
import axios from "axios"; 


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [user, setUser] = useState(()=> 
    JSON.parse(localStorage.getItem("user"))
);
// const [errorMessage, setErrorMessage] = useState("");
const [errorMessage] = useState("");

  useEffect(()=>{
    if(user){
      setIsLoggedIn(true)
      localStorage.setItem("user", JSON.stringify(user))
    }
  }, [user])
  // will put local storage here 

  async function handleSubmit(event){
    event.preventDefault(); 
    if (!email || !password){
      return alert("Invalid Credentials");
    }
    try {
      const loginCredentials = {
        email, password
      }
      const response = await axios.post(`${API_URL}/auth/sign_in`, loginCredentials)
      const {data, headers} = response; 

      if (data && headers) {
        const accessToken = headers["access-token"]; 
        const expiry = headers["expiry"];
        const client = headers["client"];
        const uid = headers["uid"]

        setUser({
          accessToken,
          expiry,
          client,
          uid,
          id: data.data.id 
        })

        setIsLoggedIn(true)
      }
    } catch (error) {
      if(error.response.data.errors){
        return alert("Invalid Credentials"); 
      }
    }
  }
  return (


    <div className="App">
    {!isLoggedIn ? (
      <div className="login-container">
        <div className="login-box">
          <img src={logo} alt="Avion Bank Logo" className="logo" />
          <h2 className="loginGreeting">Welcome Back!</h2>
          <h3 className="loginAction">Let's Sign You In.</h3>
          <form onSubmit={handleSubmit}>
            <input
              className="emailForm"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="passwordForm"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <a href="/forget" className="forgot-password">
              Forgot Password?
            </a>

            <button type="submit">Sign In</button>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>
        </div>
      </div>
    ) : (
      <Homepage setIsLoggedIn={setIsLoggedIn} user={user} />
    )}
  </div>
  );
}


export default App;
