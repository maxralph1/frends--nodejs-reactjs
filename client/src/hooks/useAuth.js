import jwtDecode from "jwt-decode"
import { useSelector } from "react-redux"
import { selectCurrentToken } from "../features/auth/authSlice"

const useAuth = () => {
    const token = useSelector(selectCurrentToken)
    let isEnterprise = false
    let isAdmin = false
    let status = 'Individual'

    if (token) {
        const decoded = jwtDecode(token)
        const { username, roles } = decoded.userInfo

        isEnterprise = roles.includes('Enterprise')
        isAdmin = roles.includes('Admin')

        return { username, roles, status, isEnterprise, isAdmin }
    }

    return { username: '', roles: [], isEnterprise, isAdmin, status }
}

export default useAuth