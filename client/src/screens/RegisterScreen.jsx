import { useState, useEffect } from 'react';
import FormContainer from '../components/FormContainer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';

const RegisterScreen = () => {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [account_type, setAccountType] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [register, { isLoading }] = useRegisterMutation();

    // const { userInfo } = useSelector((state) => state.auth);

    // useEffect(() => {
    // if (userInfo) {
    //     navigate('/');
    // }
    // }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
        console.error('Passwords do not match');
    } else {
        try {
            const res = await register({ first_name, last_name, username, email, password, account_type }).unwrap();
            // dispatch(setCredentials({ ...res }));
            // navigate('/');
            navigate('/login');
        } catch (err) {
            console.error(err?.data?.message || err.error);
        }
    }
  };

  return (
    <>
    {/* <FormContainer>
      
    </FormContainer> */}
      <div className="relative">
        <header className="fixed flex justify-between items-center w-full px-8 pt-3">
            <h1 className="font-black text-2xl">
                <Link to="/">Frends!</Link>
            </h1>
            <nav>
                <ul className="flex flex-row font-semibold gap-3 md:gap-8 mt-1">
                    <li><a href="#" className="hover:opacity-50 transition ease-in duration-400">Find Friends</a></li>
                    <li><Link to="/login" className="hover:opacity-50 transition ease-in duration-400">Sign In</Link></li>
                    <li><Link to="/register" className="hover:opacity-50 transition ease-in duration-400">Sign Up</Link></li>
                    </ul>
            </nav>
        </header>
        <main className="md:grid md:grid-cols-2">
            <section className="hidden min-h-screen bg-yellow-400 md:flex flex-col justify-between pt-28 md:pt-20 pb-16 px-8">
                <h2 className="font-black text-4xl w-3/4"><span className="text-5xl">Frends!</span> is your<span className="text-yellow-900"> #1</span> spot to connect with friends.</h2>

                <div className="flex flex-row justify-around w-3/4">
                    <a href="#" className="bg-black hover:bg-gray-300 text-white hover:text-black transition ease-in duration-500 py-3 px-6 uppercase text-xs tracking-[0.2em] font-black rounded cursor-pointer">Find Friends</a>
                    <Link to="/login" className="bg-black hover:bg-gray-300 text-white hover:text-black transition ease-in duration-500 py-3 px-6 uppercase text-xs tracking-[0.2em] font-black rounded cursor-pointer">Sign In</Link>
                </div>

                <p className="text-lg">
                    Reconnect with old friends like you never lost touch.
                    <br />
                    Keep in touch with your current friends.
                </p>

                <footer className="">
                    <span className="text-xs font-light hidden md:block">&copy; 2023 Frends!</span>
                </footer>
            </section>

            <section className="md:min-h-screen py-8 flex flex-col items-center justify-center gap-1">
                <div className="flex justify-center self-center">
                    <div className="p-12 mx-auto rounded-2xl w-96 ">
                        <div className="mb-4">
                            <h3 className="font-semibold text-2xl text-gray-800">Sign Up </h3>
                        </div>
                        
                        <form onSubmit={submitHandler} className="space-y-2">
                            <div className="flex gap-2">
                              <div className="space-y-2">
                                <input value={first_name} type="text" className=" w-full text-base px-4 py-2 border  border-gray-300 rounded focus:outline-none focus:border-yellow-400" placeholder="First name" onChange={(e) => setFirstName(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <input value={last_name} type="text" className=" w-full text-base px-4 py-2 border  border-gray-300 rounded focus:outline-none focus:border-yellow-400" placeholder="Last name" onChange={(e) => setLastName(e.target.value)} />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                                <input value={username} type="text" className=" w-full text-base px-4 py-2 border  border-gray-300 rounded focus:outline-none focus:border-yellow-400" placeholder="Username" onChange={(e) => setUserName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <input value={email} type="email" className=" w-full text-base px-4 py-2 border  border-gray-300 rounded focus:outline-none focus:border-yellow-400" placeholder="Email address" onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <input value={password} type="password" className="w-full content-center text-base px-4 py-2 border  border-gray-300 rounded focus:outline-none focus:border-yellow-400" placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <input value={confirmPassword} type="password" className="w-full content-center text-base px-4 py-2 border  border-gray-300 rounded focus:outline-none focus:border-yellow-400" placeholder="Re-enter your password" onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <div className='font-bold'>Type:</div>
                                <div  className="flex justify-between">
                                  <div>
                                    Personal
                                    <input value="individual" className="w-10 text-center" type="radio" onChange={(e) => setAccountType(e.target.value)} />
                                  </div>
                                  <div>
                                    Business
                                    <input value="enterprise" className="w-10 text-center" type="radio" onChange={(e) => setAccountType(e.target.value)} />
                                  </div>
                                </div>
                                
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                                <button disabled={isLoading} type="submit" href="#" className="w-full flex justify-center bg-black hover:bg-gray-300 text-white hover:text-black transition ease-in duration-500 py-3 px-6 uppercase text-xs tracking-[0.2em] font-black rounded cursor-pointer">Sign Up</button>
                            </div>

                            <div className="flex flex-row justify-end">
                                <div className="text-sm">
                                    <Link to="/login" className="text-yellow-700 hover:text-yellow-500">
                                      Sign In
                                    </Link>
                                </div>
                            </div>
                        </form>
                        {isLoading && <Loader />}
                    </div>
                </div>
            </section>
        </main>

        <footer className="w-full px-8 mb-6 md:mb-0">
            <span className="text-xs font-light block md:hidden">&copy; 2023 Frends!</span>
        </footer>
      </div>
    </>
  );
};

export default RegisterScreen;