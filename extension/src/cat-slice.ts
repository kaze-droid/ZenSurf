import { createSlice } from "@reduxjs/toolkit"
 
export interface CounterState {
  mood: string
}
 
const counterSlice = createSlice({
  name: "mood",
  initialState: { mood: "yes" },
  reducers: {
    increment: (state) => {
        if (state.mood == "no"){
            state.mood = "yes"
        } else {
            state.mood = "no"
        }
    },
    decrement: (state) => {
      state.mood = "no"
    }
  }
})
 
export const { increment, decrement } = counterSlice.actions
 
export default counterSlice.reducer