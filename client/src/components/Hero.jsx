import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className='py-5'>
            <h1 className=''>FRENDS</h1>
            <div className=''>
                This is the hero section
            </div>
            <div>
                <Link to='/login'>Sign In</Link>
                <Link to='/register'>Sign Up</Link>
            </div>
        </div>
    )
};

export default Hero;