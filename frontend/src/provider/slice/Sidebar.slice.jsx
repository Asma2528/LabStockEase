import { createSlice } from "@reduxjs/toolkit";

const SidebarSlice = createSlice({
    name: 'sidebar', // Use 'sidebar' here
    initialState: { 
        toggle: false,
        collapsed: false,
    },
    reducers: {
        toggleSidebar(state) {
            state.toggle = !state.toggle;
        },
        collapsedSidebar(state) {
            state.collapsed = !state.collapsed;
        },
    },
});
export const { toggleSidebar, collapsedSidebar } = SidebarSlice.actions;

export const SidebarSlicePath = (state) => state.sidebar;
export default SidebarSlice.reducer;