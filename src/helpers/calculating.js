const calculateCoordExtremes = places => places.reduce((accumulator, place) => {
  const extremes = accumulator
  const { x, y } = place
  if (x > accumulator.x) extremes.x = x + 28
  if (y > accumulator.y) extremes.y = y + 28
  return extremes
}, { x: 0, y: 0 })

export const getViewportParams = () => {
  return {
    height: window.innerHeight - 100,
    width: (!smart) ? window.innerWidth - 210 : window.innerWidth,
    widthWithoutMinimap: window.innerWidth - 210 - store.state.minimap.container.width,
    heightWithoutMinimap: window.innerHeight - 100 - store.state.minimap.container.height,
  }
}

const getScaledStageParams = (viewport, extremes) => {
  const correlation = store.getState().zoomed.placeLength / 14
  const placeWidth = 10 * correlation
  const width = (correlation * extremes.x)  // + (200+385) // => padding from right and left => (200) && width of minimap inside div with canvas => 385
  const height = (correlation * extremes.y)  // + 200 // => padding from top and bottom inside the div with canvas 
  const instantlyShow = width < viewport.width && height < viewport.height

  return {
    correlation, width, height, instantlyShow, placeWidth,
  }
}

export const getWholeStageParams = (viewport, extremes) => {
  const { padding } = store.state.wholeStage
  const { x, y } = extremes
  let width = viewport.width - padding * 2
  let height = (y * width) / x

  if (height > viewport.height - padding * 2) {
    height  = viewport.height - padding * 2
    width = (x * height) / y
  }

  const correlation = width / x
  return { width, height, correlation, padding }
}

/*export const alignViewport = () => {
  const { viewport } = store.state
  let { x, y } = store.state.viewport.currentScrollCoords
  x -= (viewport.width / 2)
  y -= (viewport.height / 2)

  // ADDING MINIMAP PADDINGS
  x += 250
  y += 350

  document.getElementById('large-stage-viewport').scrollTo(x, y)
}*/

export const getMinimapSets = () => {
  const { minimap, viewport, scaledStage } = store.state
  const { width, height } = minimap.container
  const correlation = width / (scaledStage.width + (scaledStage.padding * 2))
  const minimapSets = {
    paddingTop: (height + scaledStage.padding) * correlation,
    paddingLeft: (width + scaledStage.padding) * correlation,
    paddingBottom: scaledStage.padding * correlation,
    paddingRight: scaledStage.padding * correlation,
    correlation,
    image: {
      height: height - (((height + scaledStage.padding) * correlation) + (scaledStage.padding * correlation)),
      width: width - (((width + scaledStage.padding) * correlation) + (scaledStage.padding * correlation)),
    },
    drag: {
      height: ((viewport.height) * correlation) - (scaledStage.padding * correlation),
      width: (viewport.width - width) * correlation,
      top: (minimap.coords !== undefined && minimap.coords.y !== undefined) ? minimap.coords.y * correlation : 0,
      left: (minimap.coords !== undefined && minimap.coords.x !== undefined) ? minimap.coords.x * correlation : 0,
      distance: { x: width * correlation , y: height * correlation - 4 }
    },
  }


  return minimapSets
}

export const getInitialSets = (places) => {
  const absoluteCoordExtremes = calculateCoordExtremes(places)
  const viewport = getViewportParams()
  const scaledStage = getScaledStageParams(viewport, absoluteCoordExtremes)
  const wholeStage = getWholeStageParams(viewport, absoluteCoordExtremes)

  store.dispatch({
    ...store.state,
    absoluteCoordExtremes,
    viewport: {
      ...store.state.viewport,
      ...viewport,
    },
    scaledStage: {
      ...store.state.scaledStage,
      ...scaledStage,
    },
    wholeStage,
    places,
  })

  const minimap = getMinimapSets()
  store.dispatch({ ...store.state,
    minimap: {
      ...store.state.minimap,
      ...minimap,
    },
  })

}