import { Outlet, Navigate } from "react-router"
import { useSelector } from "react-redux"

const PrivateRoute = () => {  
    const isAuthorized = useSelector(state => state.user.isAuthorized)
    
    return (
        isAuthorized ? <Outlet /> : <Navigate to="/auth"/>
    )
}   

export default PrivateRoute