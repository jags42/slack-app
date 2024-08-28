import {API_URL} from "../constants/constants"
import axios from "axios"; 

// houses the API_URL...access the API 
// lahat ng array of objects, dito na mapupunta 
// API call to get all users 
// can be used in other pages and not just in one page 
// can be injected in other pages 
// the object that will store the user ids

const UserService = {
    getUsers: async function(user){
        try{
            const headers = {
                "access-token": user.accessToken, 
                expiry: user.expiry,
                client: user.client,
                uid: user.uid, 
            }
            const response = await axios.get(`${API_URL}/users`, {headers})
            const users = response.data.data; 
            return users.filter((user)=> user.id >= 5100)
        }   catch (error){
            if(error.response.data.errors){
                return alert("Cannot get users"); 
            }
        }
    }, 
}; 

export default UserService; 