import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, resetAuth} from "../slices/userSlice";

import { TextField, Button, Box, Paper, Typography, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router";

const AuthForm = () => {
  
  const isAuthorized = useSelector(state => state.user.isAuthorized)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [inputValue, setInputValue] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const routeOnManePage = () => { 
    if (isAuthorized === false) { 
      setOpenSnackbar(true)
      setInputValue("")
      dispatch(resetAuth())
    } else if (isAuthorized) { 
      navigate("/")
    }
  }

  useEffect(() => {
    routeOnManePage()

    // eslint-disable-next-line
  }, [isAuthorized, navigate])

  return (
    <Box  
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f4f4f4"
    >
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography variant="h5" mb={2} fontWeight="bold">
          Авторизация
        </Typography>
        <TextField
          label="Введите код"
          variant="outlined"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          onClick={() => {
            dispatch(fetchUser(inputValue))
          }}
          variant="contained"
          color='primary'
          fullWidth
          disabled={!inputValue.trim()}
        >
          Войти 
        </Button>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error">
            Невернный ключ авторизации
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}

export default AuthForm
