import { configureStore } from '@reduxjs/toolkit';
import itemsReducer from './item.store';

export const store = configureStore({
    reducer: {
        items: itemsReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
