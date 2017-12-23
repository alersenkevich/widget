const hexToRgb = hex =>
  hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => `#${r + r + g + g + b + b}`)
    .substring(1)
    .match(/.{2}/g)
    .map(x => parseInt(x, 16))

const luminanace = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928
      ? v / 12.92
      : ((v + 0.055) / 1.055) ** 2
  })

  return (a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722)
}

export const renderStage = (correlation, ctx) => {
  const { scaledStage } = store.state
  if (window.eventID == 8754) {
    const backgroundLocation = new Image()
    backgroundLocation.src = 'background-location.png'
    ctx.drawImage(backgroundLocation, 0, 0, scaledStage.width, scaledStage.height)
  }
  const width = 10 * correlation
  let prices = {}
  const places = store.getState().places.forEach((value) => {
    if (value.status === '10' && prices[value.price] === undefined) prices[value.price] = value.color

    let textColor = 0x000000
    if (value.status === '10' /*|| basketExists !== -1*/) {
      const rgb = hexToRgb(`#${value.color}`)
      const lum = luminanace(...rgb)
      textColor = (lum < 0.228) ? '#FFFFFF' : '#000000'
    }
    else {
      textColor = '#AE9EA6'
    }
    let marg
    if (value.name.length > 2) marg = store.state.zoomed.placeLength * store.state.zoomed.correlation.marg[2]
    else if (value.name.length > 1) marg = store.state.zoomed.placeLength * store.state.zoomed.correlation.marg[1]
    else marg = store.state.zoomed.placeLength * store.state.zoomed.correlation.marg[0]


    ctx.fillStyle = (value.status === '10') ? `#${value.color}` : '#BFB2B2'
    ctx.fillRect(value.x*correlation, value.y*correlation, width, width)
    ctx.fillStyle = textColor
    ctx.font = `${store.state.zoomed.placeLength * store.state.zoomed.correlation.textToPlace}px Arial`
    ctx.fillText(value.name, value.x*correlation+marg, value.y*correlation+(store.state.zoomed.placeLength * store.state.zoomed.correlation.top))
  })
  window.prices = prices
}

export const renderLoader = (x, y, ctx, place) => {
  const { placeWidth, correlation } = store.getState().scaledStage
  ctx.clearRect(x*correlation, y*correlation, placeWidth, placeWidth)
  ctx.strokeStyle = `#${place.color}`
  ctx.strokeRect(x*correlation+1, y*correlation+1, placeWidth-2, placeWidth-2)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(x*correlation, y*correlation, placeWidth, placeWidth)
  ctx.drawImage(clock, x*correlation+placeWidth*0.1, y*correlation+placeWidth*0.1, placeWidth*0.8, placeWidth*0.8)
}

export const renderAdded = (x, y, ctx, place) => {
  const { placeWidth, correlation } = store.getState().scaledStage
  ctx.clearRect(x*correlation, y*correlation, placeWidth, placeWidth)
  // ctx.strokeStyle = `#${place.color}`
  // ctx.strokeRect(x*correlation, y*correlation, placeWidth, placeWidth)
  ctx.fillStyle = '#4C7D4C'
  ctx.fillRect(x*correlation, y*correlation, placeWidth, placeWidth)
  ctx.drawImage(added, x*correlation+placeWidth*0.2, y*correlation+placeWidth*0.2, placeWidth*0.6, placeWidth*0.6)
}

export const renderPlace = (ctx, place) => {
  const { placeWidth, correlation } = store.getState().scaledStage
  let textColor = 0x000000
  if (place.status === '10') {
    const rgb = hexToRgb(`#${place.color}`)
    const lum = luminanace(...rgb)
    textColor = (lum < 0.228) ? '#FFFFFF' : '#000000'
  }
  else {
    textColor = '#AE9EA6'
  }
  let marg
  if (place.name.length > 2) marg = store.state.zoomed.placeLength * store.state.zoomed.correlation.marg[2]
  else if (place.name.length > 1) marg = store.state.zoomed.placeLength * store.state.zoomed.correlation.marg[1]
  else marg = store.state.zoomed.placeLength * store.state.zoomed.correlation.marg[0]

  ctx.clearRect(place.x*correlation, place.y*correlation, placeWidth, placeWidth)
  ctx.fillStyle = (place.status === '10') ? `#${place.color}` : '#BFB2B2'
  ctx.fillRect(place.x*correlation, place.y*correlation, placeWidth, placeWidth)
  ctx.fillStyle = textColor
  ctx.font = `${store.state.zoomed.placeLength * store.state.zoomed.correlation.textToPlace}px Arial`
  ctx.fillText(place.name, place.x*correlation+marg, place.y*correlation+(store.state.zoomed.placeLength * store.state.zoomed.correlation.top))
}