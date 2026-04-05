import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { authApi } from "./api/authApi"
import { productsApi } from "./api/productsApi"
import { storefrontApi } from "./api/storefrontApi"
import { salesApi } from "./api/salesApi"
import { payoutsApi } from "./api/payoutsApi"
import { kycApi } from "./api/kycApi"
import { userApi } from "./api/userApi"
import { checkoutApi } from "./api/checkoutApi"
import { buyerApi } from "./api/buyerApi"
import { onboardingApi } from "./api/onboardingApi"
import { aiApi } from "./api/aiApi"
import authReducer from "./slices/authSlice"
import uiReducer from "./slices/uiSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [storefrontApi.reducerPath]: storefrontApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    [payoutsApi.reducerPath]: payoutsApi.reducer,
    [kycApi.reducerPath]: kycApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [checkoutApi.reducerPath]: checkoutApi.reducer,
    [buyerApi.reducerPath]: buyerApi.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      authApi.middleware,
      productsApi.middleware,
      storefrontApi.middleware,
      salesApi.middleware,
      payoutsApi.middleware,
      kycApi.middleware,
      userApi.middleware,
      checkoutApi.middleware,
      buyerApi.middleware,
      onboardingApi.middleware,
      aiApi.middleware
    ),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
