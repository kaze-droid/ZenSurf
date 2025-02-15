import { createSlice } from "@reduxjs/toolkit"
 
export interface CounterState {
  mood: string
}

// possible values: good, bad, penalise, reward, confused, neutral, idle, streak  
const counterSlice = createSlice({
  name: "mood",
  initialState: { mood: "neutral" },
  reducers: {
    setNeutral: (state) => {
      state.mood = "neutral"
    },
    setGood: (state) => {
      state.mood = "good"
    },
    setBad: (state) => {
      state.mood = "bad"
    },
    setPenalise: (state) => {
      state.mood = "penalise"
    },
    setReward: (state) => {
      state.mood = "reward"
    },
    setConfused: (state) => {
      state.mood = "confused"
    },
    setIdle: (state) => {
      state.mood = "idle"
    },
    setStreak: (state) => {
      state.mood = "streak"
    }
  }
})
 
export const { setNeutral, setGood, setBad, setPenalise, setReward, setConfused, setIdle, setStreak } = counterSlice.actions
 
export default counterSlice.reducer