import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../constants/constants';

function AddUsersByEmail({ selectedChannel, user, setShowAddUsers }) {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddUsersByEmail() {
    setLoading(true);
    try {
      const emailList = emails.split(',').map(email => email.trim());

      const response = await axios.post(`${API_URL}/users/ids`, { emails: emailList }, {
        headers: {
          "Content-Type": "application/json",
          "access-token": user.accessToken,
          expiry: user.expiry,
          client: user.client,
          uid: user.uid,
        }
      });

      if (response.status === 200) {
        const userIds = response.data.user_ids;

        const addUsersResponse = await axios.post(`${API_URL}/channels/${selectedChannel}/users`, 
          { user_ids: userIds }, 
          {
            headers: {
              "Content-Type": "application/json",
              "access-token": user.accessToken,
              expiry: user.expiry,
              client: user.client,
              uid: user.uid,
            }
          }
        );

        if (addUsersResponse.status === 200) {
          console.log('Users added successfully:', addUsersResponse.data);
          setEmails("");
          setShowAddUsers(false);
        }
      }
    } catch (error) {
      console.error('Failed to add users by email:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-users-form">
      <h2>Add Users by Email</h2>
      <input 
        type="text"
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        placeholder="Enter emails separated by commas"
      />
      <button onClick={handleAddUsersByEmail} disabled={loading}>
        {loading ? 'Adding Users...' : 'Add Users'}
      </button>
      <button onClick={() => setShowAddUsers(false)}>Cancel</button>
    </div>
  );
}

export default AddUsersByEmail;
