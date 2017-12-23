import { hideFirstImage, showMinimap } from './dom'
import { applyViewportPosition } from './computings.js'


export const applyDragWindow = () => {
  const miniViewport = document.getElementById('drag')
  const { minimap } = store.state
  const { currentScrollCoords } = store.state.viewport
  const { correlation, coords } = store.state.minimap
  const minimapCorrelated = {
    width: minimap.container.width * correlation,
    height: minimap.container.height * correlation,
  }

  let x = (currentScrollCoords.x * correlation) - ((minimap.drag.width - minimapCorrelated.width - 100*correlation) / 2)
  let y = (currentScrollCoords.y * correlation) - ((minimap.drag.height - minimapCorrelated.height - (100 * correlation)) / 2)
  miniViewport.style.left = x
  miniViewport.style.top = y
  store.state.minimap.drag.left = x
  store.state.minimap.drag.top = y
}


export const firstClick = (x, y) => {
  hideFirstImage()
  const { viewport, wholeStage, scaledStage } = store.getState()
  const correlation = scaledStage.width / wholeStage.width
  store.state.viewport.currentScrollCoords = {
    x: ((x - ((viewport.width - wholeStage.width) / 2)) * correlation),
    y: ((y - ((viewport.height - wholeStage.height) / 2) - 20) * correlation) + 100
  }
  x = ((x - ((viewport.width - wholeStage.width) / 2)) * correlation) - (viewport.width / 2)
  y = ((y - ((viewport.height - wholeStage.height) / 2) - 20) * correlation) - (viewport.height / 2) + 100

  document.getElementById('large-stage-viewport').scrollTo(x+250, y+350/* + 250*/)
  //showMinimap()
  //applyDragWindow()
}

/*export const applyViewportPosition = ({x, y}) => {
  const { viewport } = store.state
  const { correlation } = store.state.minimap
  const largeStageViewport = document.getElementById('large-stage-viewport')
  largeStageViewport.scrollTo(x/correlation-100, y/correlation+200)
  store.state.minimap.drag.left = x
  store.state.minimap.drag.top = y
  store.state.viewport.currentScrollCoords.x = largeStageViewport.scrollLeft - 250 + (viewport.width / 2)
  store.state.viewport.currentScrollCoords.y = largeStageViewport.scrollTop - 350 + (viewport.height / 2)
}*/

export const minimapClickTeleport = (x, y) => {
  const { minimap } = store.state
  const { drag, paddingTop, paddingLeft, paddingBottom, correlation, coords } = store.state.minimap
  const dragDOM = document.getElementById('drag')
  const minimapCorrelated = {
    width: minimap.container.width * correlation,
    height: minimap.container.height * correlation,
  }
  x = (x + paddingLeft) - ((drag.width - minimapCorrelated.width) / 2)
  y = (y + paddingTop - paddingBottom) - ((drag.height - minimapCorrelated.height) / 2)
  dragDOM.style.left = x
  dragDOM.style.top = y
  applyViewportPosition({ x, y })
}

