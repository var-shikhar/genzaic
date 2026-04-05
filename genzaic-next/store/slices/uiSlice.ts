import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UIState {
  sidebarOpen: boolean
  activeTab: string
}

const initialState: UIState = {
  sidebarOpen: true,
  activeTab: "overview",
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload
    },
  },
})

export const { setSidebarOpen, toggleSidebar, setActiveTab } = uiSlice.actions
export default uiSlice.reducer
