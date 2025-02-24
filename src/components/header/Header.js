import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Container,
    Box,
    Typography,
    Divider,
    Stack,
    IconButton,
    Menu,
    TextField,
    Button,
} from '@mui/material';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import { useSelector } from 'react-redux';
import useHttp from '../hooks/http.hook';

function Header() {

    const key = useSelector(state => state.user.key)
    const balance = useSelector(state => state.user.balance)
    const role = useSelector(state => state.user.role)
    const {request} = useHttp(key)

    // Состояние для управления открытием/закрытием меню
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [username, setUsername] = useState("")
    const [amount, setAmount] = useState("")
  
    // Обработчик открытия меню
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
  
    // Обработчик закрытия меню
    const handleMenuClose = () => {
        if (username && amount) {   
            request(`http://127.0.0.1:8000/user/recharge/${username}?balance=${amount}`, 'POST')
            .catch(err => console.error(err))
        };
        setAnchorEl(null);
        setAmount("");
        setUsername("");
    };

  return (
    <>
      <AppBar position='static' sx={{
        boxShadow: 'none',
      }}>
        <Container>
          <Toolbar sx={{
            display: 'flex',
            justifyContent: 'space-between'
          }}> 

            <Box sx={{ display:'flex', alignItems:'center' }}>
              <CurrencyBitcoinIcon sx={{mr: 0.5, fontSize: 30}}/>
              <Typography 
                sx={{
                  fontSize: 20,
                  letterSpacing: 3,
                  lineHeight: '24px'
                }}
              >
                Rangers
              </Typography>
            </Box> 

            <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontSize={20}>{balance}</Typography>
                <AccountBalanceWalletIcon />
                {role === 'superadmin' || role === 'admin' ? (
                    <>
                        <IconButton
                            sx={{ color: 'white' }}
                            onClick={handleMenuOpen}
                            aria-label="edit"
                        >
                            <BorderColorIcon />
                        </IconButton>
                        {/* Меню */}
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <Box sx={{ p: 2, width: 300 }}>
                                <Stack spacing={2}>
                                    {/* Первый инпут */}
                                    <TextField
                                        onChange={(e) => setUsername(e.target.value)}
                                        value={username}
                                        label="username"
                                        variant="outlined"
                                        fullWidth
                                    />
                                    {/* Второй инпут */}
                                    <TextField
                                        onChange={(e) => setAmount(e.target.value)}
                                        value={amount}
                                        label="balance"
                                        variant="outlined"
                                        fullWidth
                                    />
                                    {/* Кнопка внизу справа */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleMenuClose}
                                        >
                                            Сохранить
                                        </Button>
                                    </Box>
                                </Stack>
                            </Box>
                        </Menu> 
                    </>
              ): null}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      <Divider />
    </>
  );
}

export default Header