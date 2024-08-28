import './App.css';
import Homepage from "./pages/home-page/homepage";
import {useEffect, useState} from "react"; 
import { API_URL } from "./constants/constants";
import axios from "axios"; 


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [user, setUser] = useState(()=> 
    JSON.parse(localStorage.getItem("user"))
);

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
      {!isLoggedIn && (
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          type="email" 
          onChange={(event)=> setEmail(event.target.value)}>
        </input>
        <label>Password</label>
        <input 
          type="password" 
          onChange={(event)=> setPassword(event.target.value)}>
        </input>
        <button type="submit">Login</button>
      </form>
        )}
      {isLoggedIn && (
      <Homepage setIsLoggedIn={setIsLoggedIn} user={user}></Homepage>
      )}
    </div>
  );
}


export default App;
