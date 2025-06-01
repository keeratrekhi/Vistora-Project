import { createSlice, current } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User{
    id: string,
    username:string,
}

interface UserState{
    currentUser:User|null,
    error:string | null,
    loading : boolean
}

const initialState:UserState={
    currentUser:null,
    error:null,
    loading:false,
}

export const UserSlice=createSlice({
    name:'user',
    initialState,
    reducers:{
        //Signin or login reducers

        SignInStart:(state)=>{
            state.loading=true,
            state.error=null, 
            state.currentUser=null
        },
        SignInSuccess:(state,action:PayloadAction<User>)=>{
            state.loading=false,
            state.currentUser=action.payload,
            state.error=null
        },
        SignInFailure:(state,action:PayloadAction<string>)=>{
            state.loading=false,
            state.error=action.payload,
            state.currentUser=null
        },

        //signup reducers
        
        SignUpStart:(state)=>{
            state.loading=true,
            state.error=null,
            state.currentUser=null
        },
        SignUpSuccess:(state,action:PayloadAction<User>)=>{
            state.loading=false,
            state.error=null,
            state.currentUser=action.payload
        },
        SignUpFailure:(state,action:PayloadAction<string>)=>{
            state.loading=false,
            state.error=action.payload,
            state.currentUser=null
        },

        //signout reducers

        SignOutSuccess:(state)=>{
            state.loading=false,
            state.error=null,
            state.currentUser=null
        },
    }
})

export const {SignInStart,SignInFailure,SignInSuccess,SignUpFailure,SignUpStart,SignUpSuccess,SignOutSuccess}=UserSlice.actions

export default UserSlice.reducer