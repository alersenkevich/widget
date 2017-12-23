import { dragInit, moveElem, destroy, grabStage } from './draggable'
import { firstClick, clickToPlace, minimapClickTeleport, mouseMovingOnStage } from './computings'
import { basketClear } from './basket'
import { makeOrder, showRules, hideRules, showMap } from './dom'


export const listenersInit = (ctx) => {
  window.grabHappened = false
  const { api } = store.getState()
  const largeStageViewport = document.getElementById('large-stage-viewport')
  const largeStageContainer = document.getElementById('large-stage-container')
  const largeStageCanvas = document.getElementById('large-stage-canvas')
  let draggingOrGrabbing = false // false means — minimap dragging, true means — stage grabbing
  window.grabCoords = { x: 0, y: 0 }

  document.getElementById('drag').onmousedown = (e) => { dragInit(e.currentTarget); return false }
  document.getElementById('first-img').addEventListener('click', event => firstClick(event.layerX, event.layerY))
  document.getElementById('mapImg').addEventListener('click', event => minimapClickTeleport(event.layerX, event.layerY))
  document.onmousemove = (e) => {
    if (e.clientX < 1 || e.clientY > window.innerHeight-1) {
      draggingOrGrabbing = false
      return
    }
    if (draggingOrGrabbing) grabStage(e, largeStageViewport)
    else moveElem(e)
  }
  document.onmouseup = () => destroy()

  largeStageContainer.addEventListener('mousedown', (event) => { draggingOrGrabbing = true; window.grabCoords = { x: event.layerX, y: event.layerY }})
  largeStageContainer.addEventListener('mouseup', (event) => { draggingOrGrabbing = false; grabHappened = false; }) // eslint-disable-line no-return-assign

  document.getElementById('basket-clear').addEventListener('click', (event) => basketClear(ctx))
  document.getElementById('make-order').addEventListener('click', (event) => makeOrder(ctx))
  document.getElementById('back-fon').addEventListener('click', (event) => hideRules())
  document.getElementById('win_close_button').addEventListener('click', (event) => hideRules())
  document.getElementById('close-popup-x').addEventListener('click', (event) => hideRules())
  document.getElementById('order-go-back').addEventListener('click', (event) => showMap())
  document.getElementById('win_button').addEventListener('click', (event) => { event.preventDefault(); showRules(event) })

  largeStageCanvas.addEventListener('mousemove', event => (!draggingOrGrabbing) ? mouseMovingOnStage(event) : document.getElementById('hint').style.display = 'none')
  largeStageCanvas.addEventListener('mouseup', async event => (!grabHappened) ? clickToPlace(event, ctx, api) : false)

  document.getElementById('main-header').addEventListener('mousemove', (event) => draggingOrGrabbing = false)
  document.getElementById('map-parent').addEventListener('mousemove', (event) => draggingOrGrabbing = false)
  document.getElementById('info-container').addEventListener('mousemove', (event) => draggingOrGrabbing = false)
  document.getElementById('footer').addEventListener('mousemove', (event) => draggingOrGrabbing = false)
}

export const mobileListenersInit = (ctx) => {
  const { api } = store.getState()
  const largeStageViewport = document.getElementById('large-stage-viewport')
  const largeStageContainer = document.getElementById('large-stage-container')
  const largeStageCanvas = document.getElementById('large-stage-canvas')

  document.getElementById('first-img').addEventListener('click', event => firstClick(event.layerX, event.layerY))


  document.getElementById('basket-clear').addEventListener('click', (event) => basketClear(ctx))
  document.getElementById('make-order').addEventListener('click', (event) => makeOrder(ctx))
  document.getElementById('back-fon').addEventListener('click', (event) => hideRules())
  document.getElementById('win_close_button').addEventListener('click', (event) => hideRules())
  document.getElementById('close-popup-x').addEventListener('click', (event) => hideRules())
  document.getElementById('order-go-back').addEventListener('click', (event) => showMap())
  document.getElementById('win_button').addEventListener('click', (event) => { event.preventDefault(); showRules(event) })

  largeStageCanvas.addEventListener('click', async event => clickToPlace(event, ctx, api))
}