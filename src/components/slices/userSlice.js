import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import useHttp from "../hooks/http.hook";

const userAdapter = createEntityAdapter()

const initialState = userAdapter.getInitialState({
    isAuthorized: 0,
    username: '',
    role: '',
    balance: null,
    id: '',
    key: localStorage.getItem('authKey') || ''
})

const fetchUser = createAsyncThunk(
    'user/fetchUser',
    async (apiKey) => {
        const {request} = useHttp(apiKey)
        return request('http://127.0.0.1:8000/auth/me')
    }
)

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        resetAuth: (state) => {
            state.isAuthorized = 0 
            state.key = ''
            localStorage.removeItem('authKey')
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.fulfilled, (state, action) => {  
                state.isAuthorized = true

                state.key = action.payload.api_key
                localStorage.setItem('authKey', action.payload.api_key)
                state.username = action.payload.username
                state.role = action.payload.role
                state.balance = action.payload.balance
                state.id = action.payload.id
            })
            .addCase(fetchUser.rejected, state => {state.isAuthorized = false})
    }
})

const {actions, reducer} = userSlice

export default reducer
export const { resetAuth, setKey, changeBalance } = actions

export {fetchUser}