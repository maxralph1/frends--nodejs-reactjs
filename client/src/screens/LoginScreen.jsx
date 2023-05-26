import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';

const LoginScreen = () => {
  const [username_email, setUsernameEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ username_email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/');
    } catch (err) {
      console.log(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <h1>Sign In</h1>

      <form onSubmit={submitHandler}>
        <div className='my-2' controlid='username_email'>
          <label>Username/Email Address</label>
          <input
            type='text'
            placeholder='Enter username or email'
            value={username_email}
            onChange={(e) => setUsernameEmail(e.target.value)}
          />
        </div>

        <div className='my-2' controlid='password'>
          <label>Password</label>
          <input
            type='password'
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          disabled={isLoading}
          type='submit'
          variant='primary'
          className='mt-3'
        >
          Sign In
        </button>
      </form>

      {isLoading && <Loader />}

      <div className='py-3'>
        <p>
          New Customer? <Link to='/register'>Register</Link>
        </p>
      </div>
    </FormContainer>
  );
};

export default LoginScreen;