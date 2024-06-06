import { create } from 'zustand'

export const useStore = create<any>((set) => ({
    authData: localStorage.getItem('authData') ? JSON.parse(localStorage.getItem('authData')) : null,
    setAuthData: (newAuthData)=> set(state=> ({authData: newAuthData})),
}))