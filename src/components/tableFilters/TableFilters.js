import { Box, Container, Button, Typography, Input, FormControl, InputLabel, Select, MenuItem, Stack} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setIdFilter, setStatusFilter, fetchExchangeRates, fetchRequests } from '../slices/requestsSlice';
import RequestModal from '../requstModal/RequestModal';


const TableFilters = () => {

    const dispatch = useDispatch()

    const idFilter = useSelector(state => state.requests.idFilter)
    const statusFilter = useSelector(state => state.requests.statusFilter)
    const key = useSelector(state => state.user.key)
    
    useEffect(() => {
        // Функция для получения курсов валют
        const fetchRates = () => {
            dispatch(fetchExchangeRates(key));
        };

        // Вызываем сразу при монтировании компонента
        fetchRates();

        // Устанавливаем интервал для обновления каждые 30 секунд
        const intervalId = setInterval(fetchRates, 30000);

        // Очищаем интервал при размонтировании компонента
        return () => clearInterval(intervalId);

        // eslint-disable-next-line
    }, [dispatch, key])

    const [open, setOpen] = useState(false)

    const onOpenModal = () => { 
        setOpen(true)
    }

    const onCloseModal = () => {    
        setOpen(false)
    }

    const onChangeIdFilter = (e) => {
        dispatch(setIdFilter(e.target.value))
    }

    const onChangeStatusFilter = (e) => {
        dispatch(setStatusFilter(e.target.value))
    }

    return (
        <Box sx={{mt:20}}>
            <RequestModal open={open} onCloseModal={onCloseModal}/>

            <Container>
                <Stack direction="row" spacing={6} sx={{
                    alignItems: 'flex-end'
                }}>

                    <Box sx={{mr: 5}}>
                        <Typography sx={{ml:1, mb:0.5, fontSize: 12}}>ADD REQUEST</Typography>
                        <Button variant='contained' 
                            sx={{width: 120}}
                            onClick={onOpenModal}>
                            <AddIcon />
                        </Button>
                    </Box>

                    <Box sx={{mr: 5}}>
                        <Input 
                            placeholder='Request id'
                            sx={{ width: 150 }}
                            size='small'
                            onChange={onChangeIdFilter}
                            value={idFilter}/>  
                    </Box>

                    <FormControl variant="standard" sx={{ mr: 5, width: 150 }}>
                        <InputLabel id="status-label" sx={{ color: '#aea2a2' }}>Satus</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status" 
                            value={statusFilter}
                            onChange={onChangeStatusFilter}
                            label="Age"
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value='pending'>Pending</MenuItem>
                            <MenuItem value='work'>Work</MenuItem>
                            <MenuItem value='closed'>Closed</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{mr: 5}}>
                        <Typography sx={{ml:1, mb:0.5, fontSize: 12}}>UPDATE</Typography>
                        <Button 
                            onClick={() => dispatch(fetchRequests(key))}
                            variant='contained' 
                            sx={{width: 120}}>
                            <RestartAltIcon />
                        </Button>
                    </Box>

                </Stack>
            </Container>
        </Box>
    )
}

export default TableFilters