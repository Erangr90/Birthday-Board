import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export const ACCESSIBILITY_STORAGE_KEY = "accessibility-preferences"

export interface AccessibilityState {
  highContrast: boolean
  largeText: boolean
  reduceMotion: boolean
  strongFocus: boolean
}

const defaultState: AccessibilityState = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  strongFocus: false,
}

function readStoredAccessibilityState(): AccessibilityState {
  if (typeof window === "undefined") {
    return defaultState
  }

  try {
    const raw = window.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)

    if (!raw) {
      return defaultState
    }

    const parsed = JSON.parse(raw) as Partial<AccessibilityState>

    return {
      highContrast: Boolean(parsed.highContrast),
      largeText: Boolean(parsed.largeText),
      reduceMotion: Boolean(parsed.reduceMotion),
      strongFocus: Boolean(parsed.strongFocus),
    }
  } catch {
    return defaultState
  }
}

const accessibilitySlice = createSlice({
  name: "accessibility",
  initialState: readStoredAccessibilityState(),
  reducers: {
    setHighContrast: (state, action: PayloadAction<boolean>) => {
      state.highContrast = action.payload
    },
    setLargeText: (state, action: PayloadAction<boolean>) => {
      state.largeText = action.payload
    },
    setReduceMotion: (state, action: PayloadAction<boolean>) => {
      state.reduceMotion = action.payload
    },
    setStrongFocus: (state, action: PayloadAction<boolean>) => {
      state.strongFocus = action.payload
    },
    resetAccessibilityPreferences: () => defaultState,
  },
})

export const {
  setHighContrast,
  setLargeText,
  setReduceMotion,
  setStrongFocus,
  resetAccessibilityPreferences,
} = accessibilitySlice.actions

export default accessibilitySlice.reducer
