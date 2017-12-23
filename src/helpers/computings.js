import _ from 'lodash'
import toastr from 'toastr'
import { showMinimap, changeBackgroundLocation } from './dom'
import { renderLoader, renderAdded, renderPlace } from './renderer'
import { appendToBasket, basketClear } from './basket'


toastr.options = { positionClass: 'toast-top-full-width', preventDuplicates: true }


export const alignViewport = () => {
  const viewportDOM = document.getElementById('large-stage-viewport')
  const { width: startWidth, height: startHeight } = store.state.viewport
  const { offsetWidth: endWidth, offsetHeight: endHeight } = viewportDOM
  const distance = {
    x: Math.abs(startWidth - endWidth) / 2,
    y: Math.abs(startHeight - endHeight) / 2,
  }
  if (distance.x === 0 && distance.y === 0) {
    return false
  }
  const direction = {
    x: (endWidth < startWidth) ? 'left' : 'right',
    y: (endHeight < startHeight) ? 'up' : 'down',
  }

  const toX = (direction.x === 'right') ? viewportDOM.scrollLeft + distance.x : viewportDOM.scrollLeft - distance.x
  const toY = (direction.y === 'down') ? viewportDOM.scrollTop + distance.y : viewportDOM.scrollTop - distance.y
  store.state.viewport.currentScrollCoords = { x: toX, y: toY }
  viewportDOM.scrollTo(toX, toY)
  if (getComputedStyle(document.getElementById('first-img')).display === 'none') {
    showMinimap()
    applySmallViewport()
  }
}

export const applySmallViewport = () => {
  const miniViewport = document.getElementById('drag')
  const { scaledStage, minimap, viewport } = store.state
  const { currentScrollCoords } = viewport
  const correlation = minimap.image.width / scaledStage.width

  let x = (currentScrollCoords.x * correlation) + minimap.drag.distance.x + 4
  let y = (currentScrollCoords.y * correlation)

  miniViewport.style.left = x
  miniViewport.style.top = y
  store.state.minimap.drag.left = x
  store.state.minimap.drag.top = y
}

export const firstClick = (x, y) => {
  const { wholeStage, scaledStage, viewport } = store.state
  const correlation = scaledStage.width / wholeStage.width
  x -= (viewport.width - wholeStage.width) / 2
  y -= (viewport.height - wholeStage.height) / 2

  x *= correlation
  y *= correlation

  x += (!smart) ? 350 : 100
  y += (!smart) ? 350 : 100

  // store.state.viewport.currentScrollCoords = { x, y }
  if (!smart) x -= viewport.width - viewport.widthWithoutMinimap / 2
  else x -= viewport.width / 2
  y -= viewport.height / 2

  store.state.viewport.currentScrollCoords = { x, y }

  document.getElementById('first-img').style.display = 'none'
  document.getElementById('large-stage-container').style.display = 'block'
  document.getElementById('large-stage-viewport').scrollTo(x, y)
  if (!smart) {
    showMinimap()
    applySmallViewport()
  }
}

export const applyViewportPosition = ({x, y}) => {
  const { minimap } = store.state
  const { correlation } = minimap
  x -= minimap.drag.distance.x
  // y -= minimap.drag.distance.y

  x /= correlation
  y /= correlation

  const largeStageViewport = document.getElementById('large-stage-viewport')
  largeStageViewport.scrollTo(x, y)

  store.state.minimap.drag.left = x
  store.state.minimap.drag.top = y
  store.state.viewport.currentScrollCoords.x = largeStageViewport.scrollLeft
  store.state.viewport.currentScrollCoords.y = largeStageViewport.scrollTop
}

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

export const findPlaceByCoords = (x, y) => {
  const { places } = store.getState()
  const { correlation } = store.getState().scaledStage
  x /= correlation
  y /= correlation
  const place = _.find(places, (v) => {
    const edges = { x: v.x+10, y: v.y+10 }
    if ((v.x <= x && edges.x >= x) && (v.y <= y && edges.y >= y)) return v
  })
  if (place !== undefined) return place
  return null
}

export const clickToPlace = async (event, ctx, api) => {
  window.grabHappened = false
  const place = findPlaceByCoords(event.layerX, event.layerY)
  const basketPlace = (place !== null) ? _.find(store.getState().basket.places, val => val.id === place.id) : undefined
  if (place === null || (place.status !== '10' && basketPlace === undefined)) return false
  const { correlation } = store.getState().scaledStage
  const width = 10 * correlation

  if (basketPlace === undefined) {
    if (store.getState().basket.places.length >= 6) {
      if (!smart) {
        toastr.clear()
        toastr.error('Превышен лимит на количество выбранных мест', 'Предупреждение').css('width', `${window.innerWidth - 500}px`)
      }else{
        alert('Превышен лимит на количество выбранных мест')
      }
      return false
    }
    renderLoader(place.x, place.y, ctx, place)
    const section = _.find(store.getState().info.section, val => val.id === place.section_id)
    if (place.status === '10') {
      const response = await api.post({ action: 'basket_add', placeID: place.id })
      renderAdded(place.x, place.y, ctx, place)

      if (response.content.places.place[0].is_selected === 1) {
        store.getState().basket.places.push(place)
        appendToBasket()
      }
    }
  }
  else {
    renderLoader(place.x, place.y, ctx, place)
    const deleteResponse = await api.post({ action: 'basket_delete', placeID: place.id })
    if (deleteResponse.content === null) {
      basketClear()
      return false
    }
    if (deleteResponse.content.places.place[0].is_unselected === 1 || deleteResponse.result.code === -100) {
      let key = false
      const foundPlace = _.find(store.getState().places, (v, k) => {
        if (v.id === place.id) {
          key = k
        }
      })
      let q = false
      const basketExists = _.find(store.getState().basket.places, (v,k) => {
        if (v.id === place.id) {
          q = k
        }
      })
      delete store.getState().basket.places[q]
      store.getState().basket.places = store.getState().basket.places.filter(z => typeof z !== 'undefined')
      store.getState().places[key].status = '10'
      renderPlace(ctx, place)
      appendToBasket()
    }
  }
}

export const mouseMovingOnStage = (event) => {
  clearTimeout(window.setTimeoutID)
  const place = findPlaceByCoords(event.layerX, event.layerY)
  if (place !== undefined && place !== null) {
    const existsInBasket = _.find(store.getState().basket.places, basketPlace => basketPlace.id === place.id)
    document.getElementById('large-stage-container').style.cursor = (place.status === '10' || existsInBasket !== undefined) ? 'pointer' : 'default'
    if (!smart) {
      window.setTimeoutID = setTimeout(function(){
        showHint(place, event)
      }, 500)
    }
  } else {
    if (!smart) document.getElementById('hint').style.display = 'none'
    document.getElementById('large-stage-container').style.cursor = 'move'
  }
}

const getHintSets = (place, correlation, hint) => ({
  top: {
    left: ((place.x + 5) * correlation) - 100,
    top:  place.y * correlation - (place.status === '10' ? 60 : 50),
    css: `{
      top: 100%;
      left: 50%;
    }`,
  },
  left: {
    top: (place.y+4) * correlation - (place.status === '10' ? 25 : 15),
    left: place.x * correlation - (hint.width + 5),
    css: `{
      top: 50%;
      left:0%;
    }`,
  },
  leftbottom: {
    top: (place.y+8) * correlation + 8,
    left: place.x * correlation - (hint.width - 10 ),
    css: `{
      top:100%;
      left:0;
    }`
  },
  lefttop: {
    top: place.y * correlation - ( place.status === '10' ? 58 : 38),
    left: place.x * correlation - (hint.width - 5),
    css: `{
      top:0;
      left:0;
    }`
  },
  right: {
    top: (place.y + 4) * correlation - (place.status === '10' ? 22 : 15),
    left: ((place.x + 8) * correlation) + 14,
    css: `{
      top:50%;
      right:0;
    }`,
  },
  rightbottom: {
    left: ((place.x + 8) * correlation) + 9,
    top: (place.y + 8) * correlation + 8,
    css: `{
      top:100%;
      right:0;
    }`,
  },
  righttop: {
    left: ((place.x + 8) * correlation) + 9,
    top: place.y * correlation - (place.status === '10' ? 58 : 42),
  },
  bottom: {
    left: ((place.x + 5) * correlation) - 100,
    top: ((place.y + 8) * correlation) + 24,
    css: `{
      top: 110%;
      left:50%;
    }`,
  }
})

const determineHintCoords = (hint, event, place) => {
  const bigStage = document.getElementById('large-stage-viewport')
  const scrolltop = bigStage.scrollTop
  const scrollleft = bigStage.scrollLeft
  const { correlation } = store.getState().scaledStage
  const { x, y } = place
  const scaledX = x * correlation - scrollleft + 100 + 250
  const scaledY = y * correlation - scrolltop + 100
  const { width: VWidth, height: VHeight } = store.getState().viewport

  let showKind = ''
  if (scaledX > (VWidth - (hint.width + 20) / 2) ) {
    showKind += 'left'
  } else if (scaledX < (hint.width + 20) / 2) {
    showKind += 'right'
  }

  if (scaledY < 50 + ((hint.height + 20) / 2)) {
    showKind += 'bottom'
  } else if (scaledY > (VHeight - ((hint.height + 20) / 2)) ) {
    showKind += 'top'
  }

  return showKind
}

export const showHint = (place, event) => {
  const { correlation } = store.getState().scaledStage
  
  hint.classList.forEach((val, key) => {
    hint.classList.remove(val)
  })
  const hintOpts = { width: 200, height: 60, padding: 10 }
  const hintSets = getHintSets(place, correlation, hintOpts)

  let locationType = determineHintCoords(hintOpts, event, place)

  if (locationType === '') locationType = 'top'

  hint.style.position = 'absolute'
  hint.style.left = hintSets[locationType].left + 100 + 250
  hint.style.top = hintSets[locationType].top + 100 + 245
  hint.style.lineHeight = '15px'
  hint.style.width = 180
  hint.style.height = place.status === '10' ? 55 : 40
  hint.style.fontSize = 14
  hint.style.padding = '3px'
  hint.style.fontFamily = 'Arial'
  hint.style.border = '1px solid #666'
  hint.style.zIndex = 99999999999999999
  hint.style.background = 'rgba(255, 255, 255, .85)'
  hint.style.display = 'block'
  // hint.style.borderRadius = '5px'
  // hint.style.boxShadow = '0px 1px 10px 0px rgba(50, 50, 50, 1)'
  hint.style.textAlign = 'center'
  hint.classList.add(locationType)
  const existsInBasket = _.find(store.getState().basket.places, basketPlace => basketPlace.id === place.id)
  document.getElementById('large-stage-container').style.cursor = (place.status === '10' || existsInBasket !== undefined) ? 'pointer' : 'default'
  const section = _.find(store.getState().info.section, val => val.id === place.section_id)

  hint.innerHTML = `${section.title}<br>Ряд ${place.status} Место ${place.name} ${place.status === '10' ? `<br>Цена <strong>${place.price}</strong>` : ''}`
  hint.style.display = 'block'
}

