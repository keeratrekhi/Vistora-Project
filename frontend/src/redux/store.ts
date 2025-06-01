import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { UserSlice } from './user/slice'
import { persistStore, persistReducer } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';

const rootReducers=combineReducers({
  user:UserSlice.reducer,
})

const persistconfig={
  key:'root',
  storage:localStorage,
  version:1,
}

const persistreducer= persistReducer(persistconfig,rootReducers)

export const store = configureStore({
  reducer: 
    persistreducer,
  middleware:(getDefaultMiddleware)=>
    getDefaultMiddleware({serializableCheck:false})  
})

export const persistor=persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch