import {useEffect, useState} from "react"; 
import UserService from "../../services/UserService"; 
import "./homepage.css";

function Homepage(props) {
  const { setIsLoggedIn, user} = props 
  const [userList, setUserList] = useState([]); 
  useEffect(()=>{
    async function fetchUsers(){
      const users = await UserService.getUsers(user); 
      setUserList(users); 
    }
    if (userList.length === 0) {
      fetchUsers(); 
    }
  })

  function logout(){
    localStorage.clear();
    setIsLoggedIn(false); 
  }
  return (
    <div>
      <h1>This is my dashboard</h1>
      {userList && userList.map((students)=> {
        const {id, email} = students; 
        return (
        <div key={id}>
          <p>ID: {id}</p>
          <p>Email: {email}</p>
        </div>
        );
    })}
    {!userList && <div>No Users Available </div>}
    <button onClick={logout}></button>
    </div>
  ); 
}

export default Homepage;

// const Homepage = () => {
//   return (
//     <div class="home-page">
//       homepage works
//     </div>
//   );
// };


