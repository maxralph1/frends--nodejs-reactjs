import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { useUpdateProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';

const ProfileScreen = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { userInfo } = useSelector((state) => state.auth);

    const dispatch = useDispatch();

    const [updateProfile, { isLoading }] = useUpdateProfileMutation();

    useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
    }, [userInfo.email, userInfo.name]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            console.error('Passwords do not match');
        } else {
            try {
                const res = await updateProfile({
                    _id: userInfo._id,
                    name,
                    email,
                    password,
                }).unwrap();
                dispatch(setCredentials({ ...res }));
                console.success('Profile updated successfully');
            } catch (err) {
                console.error(err?.data?.message || err.error);
            }
        }
    };

    return (
        <FormContainer>
        <h1>Update Profile</h1>

        <form onSubmit={submitHandler}>
            <div className='my-2' controlid='name'>
            <label>Name</label>
            <p
                type='name'
                placeholder='Enter name'
                value={name}
                onChange={(e) => setName(e.target.value)}
            ></p>
            </div>
            <div className='my-2' controlid='email'>
            <label>Email Address</label>
            <p
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            ></p>
            </div>
            <div className='my-2' controlid='password'>
            <label>Password</label>
            <p
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            ></p>
            </div>

            <div className='my-2' controlid='confirmPassword'>
            <label>Confirm Password</label>
            <p
                type='password'
                placeholder='Confirm password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            ></p>
            </div>

            <button type='submit' variant='primary' className='mt-3'>
            Update
            </button>
        </form>
        </FormContainer>
    );
};

export default ProfileScreen;