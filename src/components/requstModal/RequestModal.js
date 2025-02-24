import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useHttp from '../hooks/http.hook'

import { Stack, Typography, Backdrop, Modal, Fade, Button, TextField, CircularProgress, Autocomplete} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const RequestModal = ({open, onCloseModal}) => {    
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };
                                                                
    const exchangeRatesStatus = useSelector(state => state.requests.exchangeRatesStatus)
    const exchangeRates = useSelector(state => state.requests.exchangeRates)
    const username = useSelector(state => state.user.username)
    const key = useSelector(state => state.user.key)
    const {request} = useHttp(key)

    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        exchangeRateId: "",
        amount: "",
        cardHolder: "",
        cardNumber: "",
        bankName: "",
        iban: "",
        phoneNumber: "",
        email: "",
        comment: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (exchangeRatesStatus === 'loading') {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [exchangeRatesStatus]);  

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCurrencyChange = (event, newValue) => {
        setFormData({ ...formData, exchangeRateId: newValue || "" });
    };


    const validate = () => {
        let newErrors = {};
        if (!formData.exchangeRateId) newErrors.exchangeRateId = "Выберите валюту";
        if (!formData.amount || isNaN(formData.amount)) newErrors.amount = "Введите сумму";
        if (!formData.cardHolder.match(/^[A-Za-zА-Яа-яЁё ]+$/)) newErrors.cardHolder = "Некорректное имя";
        if (!formData.bankName) newErrors.bankName = "Введите название банка";

        if (!formData.cardNumber && !formData.phoneNumber) {
            newErrors.cardNumber = "Заполните номер карты или номер телефона";
            newErrors.phoneNumber = "Заполните номер карты или номер телефона";
        } else {
            if (formData.cardNumber && !formData.cardNumber.match(/^\d+$/)) newErrors.cardNumber = "Некорректный номер карты";
            if (formData.phoneNumber && !formData.phoneNumber.match(/^\+?[0-9]{10,15}$/)) newErrors.phoneNumber = "Некорректный номер телефона";
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (username) => {
        if (validate()) {
            setIsSubmitting(true)

            setFormData({ ...formData})
            const newRequest = {
                username,
                amount: +formData.amount, 
                exchangeRateId: formData.exchangeRateId,   
                cardNumber: formData.cardNumber,
                requestId: "",  
                cardHolder: formData.cardHolder,
                externalBankName: formData.bankName,
                iban: formData.iban,
                phoneNumber: formData.phoneNumber,
                email: "",
                other: formData.comment,
            };

            request("http://127.0.0.1:8000/applications/", "POST", JSON.stringify(newRequest))
                .then(data => {
                    onCloseModal()
                    setFormData({
                        amount: "",
                        exchangeRateId: "",
                        cardNumber: "",
                        cardHolder: "",
                        bankName: "",
                        iban: "",
                        phoneNumber: "",
                        email: "",
                        comment: "",
                    })
                }
                )
                .catch(err => {
                    console.error("Error:", err);
                    alert(err);
                })
                .finally(() => {
                    setIsSubmitting(false)
                })
        }
    };

    const exchangeRate = formData.exchangeRateId ? exchangeRates[formData.exchangeRateId] : "";
    const totalAmount = formData.amount && exchangeRate ? (formData.amount / exchangeRate).toFixed(2) : "";

    const handleClose = (event, reason) => {
        if (reason === 'backdropClick' && isSubmitting) {
            return; 
        }
        onCloseModal(); 
    };

    return(
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
            disableEscapeKeyDown={isSubmitting} 
        >
            <Fade in={open}>
                <Stack sx={modalStyle} spacing={2}>

                    <Typography variant='h6' component="h2" sx={{mb: 2}}>Write in the request information</Typography>
                    <Autocomplete
                        key={exchangeRatesStatus}
                        options={Object.keys(exchangeRates) || []}
                        value={formData.exchangeRateId}
                        onChange={handleCurrencyChange}
                        loading={isLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Currency"
                                error={!!errors.exchangeRateId}
                                helperText={errors.exchangeRateId}
                                fullWidth
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {exchangeRatesStatus === 'loading' ? <CircularProgress size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />



                    <TextField
                        label="Amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        error={!!errors.amount}
                        helperText={errors.amount}
                        fullWidth
                        size="small"
                    />

                    <TextField 
                        label="Ex. rate" 
                        name="exchangeRateId" 
                        value={exchangeRate} 
                        fullWidth size="small" 
                        InputProps={{ readOnly: true }}
                    />
                    
                    <TextField 
                        label="Total amount" 
                        name="totalAmount" 
                        value={totalAmount}     
                        fullWidth size="small" 
                        InputProps={{ readOnly: true }} />

                    {[

                        { label: "Card Holder", name: "cardHolder", error: errors.cardHolder },
                        { label: "Card Number", name: "cardNumber", error: errors.cardNumber },
                        { label: "Bank Name", name: "bankName", error: errors.bankName },
                        { label: "IBAN", name: "iban" },
                        { label: "Phone Number", name: "phoneNumber", error: errors.phoneNumber },
                        { label: "Email", name: "email" },
                        { label: "Comment", name: "comment", multiline: true, rows: 3 },
                    ].map(({ label, name, error, ...props }) => (
                        <TextField
                            key={name}
                            label={label}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            error={!!error}
                            helperText={error}
                            fullWidth
                            size="small"
                            {...props}
                        />
                    ))}

                    <Button variant='contained' 
                        sx={{ width: 120, alignSelf: 'end'}}
                        onClick={() => handleSubmit(username)}
                        disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24}/> : <AddIcon/>}
                    </Button>

                </Stack>
            </Fade>
      </Modal>
    )
}

export default RequestModal