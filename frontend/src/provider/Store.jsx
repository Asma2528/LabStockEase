// Import necessary functions and utilities from Redux Toolkit and RTK Query
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import slices and API service definitions from their respective files
import UserSlice from "./slice/user.slice"; // Slice for managing user-related state
import SidebarSlice from "./slice/Sidebar.slice"; // Slice for managing sidebar state
import { AuthApi } from "./queries/Auth.query"; // RTK Query API service for authentication
import { ChemicalsApi } from "./queries/Chemicals.query"; // RTK Query API service for chemicals data
import { ConsumablesApi } from "./queries/Consumables.query"; 
import { EquipmentsApi } from "./queries/Equipments.query"; 
import { OthersApi } from "./queries/Others.query"; 
import { GlasswaresApi } from "./queries/Glasswares.query"; 
import { BooksApi } from "./queries/Books.query"; 
import { ChemistryDashboardApi } from "./queries/Chemistry.dashboard.query"; // RTK Query API service for chemistry dashboard data
import {RequisitionApi } from "./queries/Requisition.query";
import {OrderRequestApi } from "./queries/Order.Request.query";
import { VendorApi } from "./queries/Vendors.query";
import { StockNotificationApi,RequisitionNotificationApi,NotificationApi } from "./queries/Notification.query";
import { OrderApi } from "./queries/Orders.query";
import { ProjectApi } from "./queries/Projects.query";
import { PracticalApi } from "./queries/Practical.query";
import { OtherApi } from "./queries/Other.query";
import { GeneralApi } from "./queries/General.query";
import {NewIndentApi } from "./queries/New.Indent.query";
import {InvoiceApi } from "./queries/Invoice.query";
import {InwardsApi } from "./queries/Inwards.query";
// Configure the Redux store
export const store = configureStore({
    reducer: {
        // Add slices for user and sidebar state management
        user: UserSlice, // Slice for managing user state
        sidebar: SidebarSlice, // Slice for managing sidebar state

        // Add RTK Query API services reducers to the store
        [AuthApi.reducerPath]: AuthApi.reducer,
        [VendorApi.reducerPath]: VendorApi.reducer,
         // Reducer for AuthApi, handles authentication-related API state
        [ChemicalsApi.reducerPath]: ChemicalsApi.reducer, // Reducer for ChemicalsApi, handles chemicals-related API state
        [ConsumablesApi.reducerPath]: ConsumablesApi.reducer, // Reducer for ChemicalsApi, handles chemicals-related API state
        [EquipmentsApi.reducerPath]: EquipmentsApi.reducer,
        [GlasswaresApi.reducerPath]: GlasswaresApi.reducer,
        [BooksApi.reducerPath]: BooksApi.reducer,
        [OthersApi.reducerPath]: OthersApi.reducer,   
        [ChemistryDashboardApi.reducerPath]: ChemistryDashboardApi.reducer, // Reducer for ChemistryDashboardApi, handles chemistry dashboard-related API state
        [RequisitionApi.reducerPath]: RequisitionApi.reducer,
        [OrderRequestApi.reducerPath]: OrderRequestApi.reducer,
        [NewIndentApi.reducerPath]: NewIndentApi.reducer,
        [StockNotificationApi.reducerPath]: StockNotificationApi.reducer,
        [RequisitionNotificationApi.reducerPath]: RequisitionNotificationApi.reducer,
        [NotificationApi.reducerPath]: NotificationApi.reducer,
        [OrderApi.reducerPath]: OrderApi.reducer,
        [ProjectApi.reducerPath]: ProjectApi.reducer,
        [GeneralApi.reducerPath]: GeneralApi.reducer,
        [OtherApi.reducerPath]: OtherApi.reducer,
        [PracticalApi.reducerPath]: PracticalApi.reducer,
        [InvoiceApi.reducerPath]: InvoiceApi.reducer,
        [InwardsApi.reducerPath]: InwardsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        // Configure middleware for the store
        getDefaultMiddleware()
            .concat(AuthApi.middleware) // Add middleware for AuthApi
            .concat(ChemicalsApi.middleware) // Add middleware for ChemicalsApi
            .concat(ConsumablesApi.middleware)
            .concat(BooksApi.middleware)
            .concat(EquipmentsApi.middleware)
            .concat(OthersApi.middleware)
            .concat(GlasswaresApi.middleware)
            .concat(ChemistryDashboardApi.middleware)
            .concat(RequisitionApi.middleware)
            .concat(OrderRequestApi.middleware)
            .concat(NewIndentApi.middleware)
            .concat(StockNotificationApi.middleware)
            .concat(RequisitionNotificationApi.middleware)
            .concat(NotificationApi.middleware)
            .concat(VendorApi.middleware)
            .concat(OrderApi.middleware)
            .concat(ProjectApi.middleware)
            .concat(PracticalApi.middleware)
            .concat(GeneralApi.middleware)
            .concat(OtherApi.middleware)
            .concat(InvoiceApi.middleware)
            .concat(InwardsApi.middleware),
});

// Set up listeners for RTK Query to handle automatic refetching and other actions
setupListeners(store.dispatch);

// Export the configured store for use in the application
export default store;


/*
This code is used to configure a Redux store for a React application that uses Redux Toolkit. Redux Toolkit is a library that simplifies Redux usage by providing utilities for creating and managing the store, slices, and asynchronous logic.
*/