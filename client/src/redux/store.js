import { configureStore } from '@reduxjs/toolkit';
import productReducer from './reducers/productReducer';

// Initial reducers
const rootReducer = {
  // Add your reducers here
  dummy: (state = {}, action) => state, // Temporary reducer to prevent the error
  productList: productReducer
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store; 