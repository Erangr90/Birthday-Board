import { useDispatch, useSelector } from "react-redux"
import {
  Button,
  Dialog,
  DialogTrigger,
  Popover,
} from "react-aria-components"
import type { AppDispatch, RootState } from "../store"
import {
  resetAccessibilityPreferences,
  setHighContrast,
  setLargeText,
  setReduceMotion,
  setStrongFocus,
} from "../slices/accessibility/accessibilityReducer"

function AccessibilityPanel() {
  const dispatch = useDispatch<AppDispatch>()
  const { highContrast, largeText, reduceMotion, strongFocus } = useSelector(
    (state: RootState) => state.accessibility
  )

  return (
    <DialogTrigger>
      <Button className="a11y-trigger" aria-label="Accessibility options">
        <span className="a11y-trigger-icon" aria-hidden="true">
          ♿
        </span>
      </Button>

      <Popover className="app-popover" placement="left">
        <Dialog className="a11y-panel" aria-label="Accessibility options">
          <h2 className="a11y-panel-title">Accessibility options</h2>

          <label className="a11y-option">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(event) => dispatch(setHighContrast(event.target.checked))}
            />
            High contrast
          </label>

          <label className="a11y-option">
            <input
              type="checkbox"
              checked={largeText}
              onChange={(event) => dispatch(setLargeText(event.target.checked))}
            />
            Larger text
          </label>

          <label className="a11y-option">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(event) => dispatch(setReduceMotion(event.target.checked))}
            />
            Reduce motion
          </label>

          <label className="a11y-option">
            <input
              type="checkbox"
              checked={strongFocus}
              onChange={(event) => dispatch(setStrongFocus(event.target.checked))}
            />
            Strong focus highlight
          </label>

          <button
            type="button"
            className="a11y-reset"
            onClick={() => dispatch(resetAccessibilityPreferences())}
          >
            Reset
          </button>
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}

export default AccessibilityPanel
