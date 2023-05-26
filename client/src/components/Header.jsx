import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { Link } from 'react-router-dom';

const Header = () => {
    const { userInfo } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useLogoutMutation();

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header>
            <Link to='/'>FRENDS</Link>
        
            <nav>
                {userInfo ? (
                    <>
                        <p>{userInfo.username}</p>
                        <Link to='/profile'>Profile</Link>
                        <Link onClick={logoutHandler}>Logout</Link>
                    </>    
                ) : (
                    <>
                        <Link to='/login'>Sign In</Link>
                        <Link to='/register'>Sign Up</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;