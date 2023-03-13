import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import MoonLoader from "react-spinners/MoonLoader"
import usePersist from "../../hooks/usePersist"
import useTitle from "../../hooks/useTitle"
import { useLoginMutation } from "./authApiSlice"
import { setCredentials } from "./authSlice"

const Login = () => {

    useTitle('Frends | Login')

    const userRef = useRef()
    const errRef = useRef()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const [persist, setPersist] = usePersist()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [login, { isLoading }] = useLoginMutation()

    useEffect(() => {
        userRef.current.focus()
    }, [])
    
    useEffect(() => {
        setErrMsg('')
    }, [username, password])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { accessToken } = await login({ username, password }).unwrap()
            dispatch(setCredentials({ accessToken }))
            setUsername('')
            setPassword('')
            navigate('/home')
        } catch (err) {
            if (!err.status) {
                setErrMsg('No server response')
            } else if (err.status === 400) {
                setErrMsg('Missing username or password')
            } else if (err.status === 401) {
                setErrMsg('unauthorized')
            } else {
                setErrMsg(err.data?.message)
            }
            errRef.current.focus
        }
    }

    const handleUserInput = (e) => setUsername(e.target.value)
    const handlePasswordInput = (e) => setPassword(e.target.value)
    const handleToggle = () => setPersist(prev => !prev)

    const errClass = errMsg ? 'errMsg' : 'offscreen'

    if (isLoading) return <MoonLoader
        color={color}
        // loading={loading}
        // cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        // data-testid="loader"
    />

    const content = (
        <section>
            <header>
                <h1>User Login</h1>
            </header>
            <main>
                <p ref={errRef} className={errClass} aria-live="assertive">{errMsg}</p>

                <form onSubmit={handleSubmit}>
                    <input type="text" ref={userRef} value={username} />
                    <input type="password" onChange={handlePasswordInput} value={password} />

                    <button>Sign In</button>

                    <input 
                        type="checkbox" 
                        id="persist" 
                        onChange={handleToggle} 
                        checked={persist}
                    />
                    Trust This Device
                </form>
            </main>
        </section>
    )

    return content
}

export default Login