import type {
  PlasmoCSConfig,
  PlasmoGetOverlayAnchor,
  PlasmoWatchOverlayAnchor
} from "plasmo"
import { Provider } from "react-redux"
import { PersistGate } from "@plasmohq/redux-persist/integration/react"
import { persistor, store } from "~store"
import PlasmoPricingExtra from "./overlay"

export const config: PlasmoCSConfig = {
  matches: ["*://*/*"]
}

export const watchOverlayAnchor: PlasmoWatchOverlayAnchor = (updatePosition) => {
  const interval = setInterval(() => {
    updatePosition()
  }, 420)

  return () => clearInterval(interval)
}

export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector(`body`)

const PlasmoPricingProvider = () => {
  
  const topLevelDomain = window.location.hostname.split('.').slice(-2).join('.')

  return (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <PlasmoPricingExtra domain={topLevelDomain} />
    </PersistGate>
  </Provider>
)
}
export default PlasmoPricingProvider
