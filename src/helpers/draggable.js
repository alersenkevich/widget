import { applyViewportPosition, applySmallViewport } from './computings'
import { showMinimap } from './dom'

// import { applyViewportPosition, applyDragWindowPosition } from './stage-moving'


let selected = null
let xPos = 0
let yPos = 0
let xElem = 0
let yElem = 0


export const grabStage = (e, stageDOM) => {
  window.grabHappened = true

  document.getElementById('hint').style.display = 'none'
  const { layerX: endX, layerY: endY } = e

  const { x: startX, y: startY } = window.grabCoords
  
  const distance = { x: Math.abs(endX - startX), y: Math.abs(endY - startY) }
  if (distance.x === 0 && distance.y === 0) return false // window.largeStageMoving = false
  const direction = {
    x: (endX < startX) ? 'right' : 'left',
    y: (endY < startY) ? 'down' : 'up',
  }

  const toX = (direction.x === 'right') ? stageDOM.scrollLeft + distance.x : stageDOM.scrollLeft - distance.x
  const toY = (direction.y === 'down') ? stageDOM.scrollTop + distance.y : stageDOM.scrollTop - distance.y
  store.state.viewport.currentScrollCoords = { x: toX, y: toY }
  stageDOM.scrollTo(toX, toY)
  // showMinimap()
  applySmallViewport()
}

export const moveElem = (e) => {
  const minimap = document.getElementById('map-parent')

  xPos = document.all ? window.event.clientX : e.pageX
  yPos = document.all ? window.event.clientY : e.pageY
  
  if (selected !== null) {
    
    if ((xPos - xElem > -2) && (
      (xPos - xElem) < (minimap.offsetWidth - (selected.offsetWidth /*/ 2*/)) /*+ 15*/)
    ) {
      selected.style.left = xPos - xElem
    }

    if ((yPos - yElem >= 0) && (
      yPos - yElem <= minimap.offsetHeight - (selected.offsetHeight /*/ 2*/) /*+ 15*/)
    ) {
      selected.style.top = yPos - yElem
    }

    applyViewportPosition({ x: selected.offsetLeft, y: selected.offsetTop })
  }
}

export const dragInit = (elem) => {
  selected = elem
  xElem = xPos - selected.offsetLeft
  yElem = yPos - selected.offsetTop
}

export const destroy = () => {
  if (selected !== null) {
    applyViewportPosition({ x: selected.offsetLeft, y: selected.offsetTop })
  }
  selected = null
}