import { BrowserRouter as Router, Routes, Route } from "react-router";
import { lazy, useEffect } from "react"
import PrivateRouter from "../pages/PrivateRoute"
import { useDispatch } from "react-redux";
import { fetchUser } from "../slices/userSlice";

const RequestPage = lazy(() => import('../pages/RequestPage'))
const AuthPage = lazy(() => import('../pages/AuthPage'))

const App = () => { 

  const dispatch = useDispatch()

  
  useEffect(() => {
    const savedKey = localStorage.getItem('authKey')
    if (savedKey) {
      dispatch(fetchUser(savedKey)) // Автоматическая авторизация
    }
  }, [dispatch])

  return(
    <Router>  
      <Routes>
        <Route element={<PrivateRouter />}>
          <Route path="/" element={<RequestPage />}/> 
        </Route>
        <Route path="/auth" element={<AuthPage />}/>
      </Routes>
    </Router>
  )
}

export default App