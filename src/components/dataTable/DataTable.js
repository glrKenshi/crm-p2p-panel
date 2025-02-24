import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRequests, filtredRequestSelector, updateStatus } from "../slices/requestsSlice";
import useHttp from "../hooks/http.hook";
import { formatString } from "../../service/formatString";
import { Drawer, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider } from "@mui/material";
import {Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress, Stack, MenuItem, Select, Pagination, List, ListItem, Typography} from "@mui/material";
import { Box, styled } from "@mui/system";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from '@mui/icons-material/Done';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import BlockIcon from '@mui/icons-material/Block';

const StyledTableCell = styled(TableCell)({
  whiteSpace: "nowrap",
});

const DataTable = () => {
    
    const dispatch = useDispatch();

    const key = useSelector((state) => state.user.key);
    const role = useSelector((state) => state.user.role);
    const requestsLoadingStatus = useSelector((state) => state.requests.requestsLoadingStatus);
    const currentData = useSelector(filtredRequestSelector);
    const {request} = useHttp(key)

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [openDrawer, setOpenDrawer] = useState(false)
    const [drawerRequest, setDrawerRequest] = useState(null)

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [openProblemDialog, setOpenProblemDialog] = useState(false);
    const [selectedProblemRequest, setSelectedProblemRequest] = useState(null);

    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedEditRequest, setSelectedEditRequest] = useState(null);

    useEffect(() => {
        dispatch(fetchRequests(key));

        document.body.style.overflowX = 'hidden';

        // Возврат исходного состояния при размонтировании компонента
        return () => {
            document.body.style.overflowX = 'visible';
        };

        // eslint-disable-next-line
    }, [key]);

    const handleOpenEditModal = (data) => {
        setSelectedEditRequest(data);
        setOpenEditModal(true);
    };
    
    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setSelectedEditRequest(null);
    };

    const handleOpenDrawer = (data) => {    
        setDrawerRequest(data)
        setOpenDrawer(true)
    }

    const handleCloseDrawer = () => {
        setOpenDrawer(false); 
        setTimeout(() => {
            setDrawerRequest(null); 
        }, 200);
    }

    const handleOpenDialog = (requestId, username, currentStatus, totalAmount) => {
        setSelectedRequest({ requestId, username, status: 'closed', currentStatus, totalAmount });
        setOpenDialog(true);
    };
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRequest(null);
    };
    
    const handleConfirmClosedStatus = () => {
        if (selectedRequest) {
            onChangeStatus(selectedRequest.requestId, selectedRequest.username, selectedRequest.status, selectedRequest.currentStatus);
            request(`http://127.0.0.1:8000/user/recharge/${selectedRequest.username}?balance=-${selectedRequest.totalAmount}`, 'POST')
        }
        handleCloseDialog();
    };

    const handleOpenProblemDialog = (requestId, username, currentStatus) => {
        setSelectedProblemRequest({ requestId, username, status: 'problem', currentStatus });
        setOpenProblemDialog(true);
    };

    const handleCloseProblemDialog = () => {
        setOpenProblemDialog(false);
        setSelectedProblemRequest(null);
    };

    const handleConfirmProblemStatus = () => {
        if (selectedProblemRequest) {
            onChangeStatus(selectedProblemRequest.requestId, selectedProblemRequest.username, selectedProblemRequest.status, selectedProblemRequest.currentStatus);
        }
        handleCloseProblemDialog();
    };

    const onChangeStatus = (requestId, username, status, currentStatus) => {  
        if (currentStatus !== status) {
            request(`http://127.0.0.1:8000/applications/${username}/status?status=${status}`, 'PUT')
            .then(dispatch(updateStatus({
                requestId,
                changes: {  
                    status: status
                }
            })))
        }
    }

    const formatData = (dateString) => {
        const date = new Date(dateString);
        
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); 
        const year = date.getUTCFullYear();
    
        return `${minutes}:${hours} ${day}-${month}-${year}`;
    }
    
    const tableHeader = useMemo(() => ([
        'requestId',
        'partner',
        'status',
        'currency',
        'cardHolder',
        'cardNumber',
        'bankName',
        'amount', 
        'exchangeRate',
        'USDT amount',
        'createdAt',
    ]), [])

    const transformedData = currentData.map(({username, amount, exchangeRateId, cardNumber, requestId, cardHolder, externalBankName, iban, phoneNumber, email, other, status, created_at, closed_at, currency, totalAmount}) => {
        return {
            requestId,
            username,
            status,
            exchangeRateId,
            cardHolder,
            cardNumber,
            externalBankName,
            amount, 
            currency,
            totalAmount,
            createdAt: created_at,
            comment: other
        }
    });

    console.log(transformedData)

    const indexOfLastItem = page * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = transformedData.slice(indexOfFirstItem, indexOfLastItem);


    return (
        <Box sx={{ mt: 4, px: 2, width:"100%", display: 'flex', flexDirection:'column', alignItems: 'center'}}>
            {requestsLoadingStatus === 'loaded' ? (
                <>
                    <Table sx={{ width: '90%', margin: '0 auto' }}>
                        <>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>Action</StyledTableCell>
                                    {tableHeader.map(key => {
                                        return (<StyledTableCell key={key}>{formatString(key)}</StyledTableCell>)
                                    })} 
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.length === 0 ? (
                                    <TableRow>
                                        <StyledTableCell colSpan={tableHeader.length} align="center">
                                            there are no requests
                                        </StyledTableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((data) => (
                                        <TableRow key={data.requestId}>
                                            <StyledTableCell>
                                                <Stack spacing={1.5}>
                                                    <Stack direction='row' spacing={1.5} >
                                                        <Button 
                                                            onClick={() => handleOpenDrawer(data)}
                                                            size="medium" 
                                                            variant="contained" 
                                                            color="primary" 
                                                            sx={{ width: "40px" }}>
                                                            <ErrorOutlineIcon fontSize="medium" />
                                                        </Button>
                                                    </Stack>
    
                                                    {role === 'admin' || role === 'superadmin' ? (
                                                        <>
                                                            <Stack direction='row' spacing={1.5}>
                                                                <Button 
                                                                    name='workBtn'
                                                                    disabled={data.status === 'closed' || data.status === 'problem' ? true : false}
                                                                    onClick={() => onChangeStatus(data.requestId, data.username, 'work', data.status)}  
                                                                    size="medium" 
                                                                    variant="contained" 
                                                                    color="secondary"
                                                                    sx={{ width: "40px"  }}>
                                                                    <RestartAltIcon fontSize="medium" />
                                                                </Button>
                                                                <Button 
                                                                    name='closedBtn'
                                                                    disabled={data.status === 'closed' || data.status === 'problem' ? true : false}
                                                                    onClick={() => handleOpenDialog(data.requestId, data.username, data.status, data.totalAmount)}  
                                                                    size="medium" 
                                                                    variant="contained" 
                                                                    color="success" 
                                                                    sx={{ width: "40px" }}>
                                                                    <DoneIcon fontSize="medium" />
                                                                </Button>
                                                            </Stack>

                                                            <Stack direction='row' spacing={1.5}>
                                                                <Button 
                                                                    name="problemBtn"
                                                                    disabled={data.status === 'closed' || data.status === 'problem' ? true : false}
                                                                    onClick={() => handleOpenProblemDialog(data.requestId, data.username, data.status)}
                                                                    size="medium" 
                                                                    variant="contained" 
                                                                    color="error" 
                                                                    sx={{ width: "40px" }}>
                                                                    <BlockIcon fontSize="medium" />
                                                                </Button>
                                                                <Button 
                                                                    name="editBtn"
                                                                    onClick={() => handleOpenEditModal(data)}
                                                                    size="medium" 
                                                                    variant="contained" 
                                                                    color="primary" 
                                                                    sx={{ width: "40px" }}>
                                                                    <EditIcon fontSize="medium" />
                                                                </Button>
                                                            </Stack>
                                                        </>
                                                    ): null}
                                                </Stack>
                                            </StyledTableCell>
                                            {Object.values(data).map((value, index) => {
                                                if (value === data.comment) return undefined
                                                return (<StyledTableCell key={index}>{value}</StyledTableCell>)
                                            })}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </>
                    </Table>
                </>
            ) : (
                    <Box sx={{display: 'flex', justifyContent:'center'}}>
                        <CircularProgress />
                    </Box>
                )}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <span>Заявок на странице:</span>
                <Select value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)} variant='standard'>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                </Select>
                <Pagination
                    count={Math.ceil(transformedData.length / rowsPerPage)}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    sx={{ mt: 2 }}
            />
            </Stack>
         
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>Подтверждение действия</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите закрыть эту заявку? Это действие нельзя отменить.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleConfirmClosedStatus} color="error">
                        Закрыть заявку
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openProblemDialog}
                onClose={handleCloseProblemDialog}
            >
                <DialogTitle>Подтверждение действия</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите изменить статус заявки на "проблема"? Это действие нельзя отменить.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProblemDialog} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleConfirmProblemStatus} color="error">
                        Изменить статус
                    </Button>
                </DialogActions>
            </Dialog>

            <Drawer open={openDrawer} onClose={handleCloseDrawer}>
                <List sx={{ p: 6 }}>
                    {Object.keys(drawerRequest || {}).map((key, index) => (
                        <>
                            <ListItem key={key}>
                                <Typography sx={{width: '180px', fontSize: '1.3rem'}}>{key}</Typography>
                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                <Typography sx={{textAlign: 'start', fontSize: '1.3rem'}}>{drawerRequest[key]}</Typography>
                            </ListItem>
                            {index < Object.keys(drawerRequest).length - 1 && <Divider />}
                        </>
                    ))}
                </List>
            </Drawer>

            <Dialog
                open={openEditModal}
                onClose={handleCloseEditModal}
            >
                <DialogTitle>Редактирование заявки</DialogTitle>
                <DialogContent>
                    {selectedEditRequest && (
                        <List sx={{ p: 6 }}>
                            {Object.keys(selectedEditRequest).map((key, index) => (
                                <>
                                    <ListItem key={key}>
                                        <Typography sx={{width: '180px', fontSize: '1.3rem'}}>{key}</Typography>
                                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                        <Typography sx={{textAlign: 'start', fontSize: '1.3rem'}}>{selectedEditRequest[key]}</Typography>
                                    </ListItem>
                                    {index < Object.keys(selectedEditRequest).length - 1 && <Divider />}
                                </>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditModal} color="primary">
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DataTable;



