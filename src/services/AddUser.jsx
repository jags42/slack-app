import React, { useState } from 'react';
import UserService from '../../services/UserService';

function AddUserForm({ user }) {
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '', // assuming you're setting a password
        // other user fields
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const addedUser = await UserService.addUser(newUser, user);
        if (addedUser) {
            // Handle the success case, like updating the UI or redirecting
            console.log('User successfully added:', addedUser);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
            />
            <button type="submit">Add User</button>
        </form>
    );
}

export default AddUserForm;
