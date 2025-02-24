import { createSlice, createAsyncThunk, createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import useHttp from '../hooks/http.hook'

const requestsAdapter = createEntityAdapter({
    selectId: (request) => request.requestId,
})

const initialState = requestsAdapter.getInitialState({
    requestsLoadingStatus: 'idle',
    idFilter: "", 
    statusFilter: "",
    exchangeRates: {},
    exchangeRatesStatus: 'idle'
})

const fetchExchangeRates = createAsyncThunk(
    'requests/fetchExchangeRate',
    async (apiKey) => {
        const { request } = useHttp(apiKey);
        return request("http://127.0.0.1:8000/api/exchange_rates")
    }
)

const fetchRequests = createAsyncThunk(
    'requests/fetchRequests',
    async (apiKey) => { 
        const { request } = useHttp(apiKey);
        return request("http://127.0.0.1:8000/applications/all")
    }
)

const requestsSlice = createSlice({
    name: 'requests',
    initialState,
    reducers: { 
        requestCreated: (state, action) => {    
            requestsAdapter.addOne(state, action.payload)
        },
        setIdFilter: (state, action) => {
            state.idFilter = action.payload
        },
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload
        },
        updateStatus: (state, action) => {
            const { requestId, changes } = action.payload;
            requestsAdapter.updateOne(state, {
                id: requestId,
                changes,
            })
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRequests.pending, state => {state.requestsLoadingStatus = 'loading'})
            .addCase(fetchRequests.fulfilled, (state, action) => {
                state.requestsLoadingStatus = 'loaded';
                requestsAdapter.setAll(state, action.payload)
            })
            .addCase(fetchRequests.rejected, state => {state.requestsLoadingStatus = 'error'})

            .addCase(fetchExchangeRates.pending, (state) => {state.exchangeRatesStatus = 'loading'})
            .addCase(fetchExchangeRates.fulfilled, (state, action) => {
                state.exchangeRatesStatus = 'loaded'
                state.exchangeRates = action.payload
            })
            .addCase(fetchExchangeRates.rejected, (state) => {state.exchangeRatesStatus = 'error'})
            .addDefaultCase(() => {})
    }
})

const selectAllRequests = requestsAdapter.getSelectors(state => state.requests).selectAll

const filtredRequestSelector = createSelector(
    selectAllRequests,
    (state) => state.requests.idFilter,
    (state) => state.requests.statusFilter,
    (state) => state.user.role,
    (state) => state.user.username,
    (requests, requestId, status, role, username) => { 
        let filtredRequests = requests.reverse();

        // Если роль пользователя 'partner', фильтруем по username
        if (role === 'partner') {
            filtredRequests = filtredRequests.filter((request) => request.username === username);
        }

        // Фильтрация по requestId и status
        filtredRequests = filtredRequests.filter((request) => {
            return (requestId === "" || request.requestId.includes(requestId)) && (status === "" || request.status === status);
        });

        return filtredRequests;
    }
)

const {actions, reducer} = requestsSlice

export default reducer;
export const {
    requestCreated,
    setIdFilter,
    setStatusFilter,
    updateStatus
} = actions

export { fetchRequests, filtredRequestSelector, fetchExchangeRates }