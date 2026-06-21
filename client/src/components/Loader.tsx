import type { CSSProperties } from "react"
import { ClipLoader } from "react-spinners"

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "blue",
}

function Loader({ loading }: { loading: boolean }) {
  const color = "#ffffff"
  return (
    <div role="status" aria-live="polite" aria-busy={loading}>
      <span className="visually-hidden">Loading content</span>
      <ClipLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={150}
        aria-hidden="true"
        data-testid="loader"
      />
    </div>
  )
}

export default Loader
