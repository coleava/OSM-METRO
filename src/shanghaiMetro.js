import React from 'react'
import { Map, TileLayer, GeoJSON } from 'react-leaflet'
import L, { divIcon } from 'leaflet'
import metro from './shanhai.json'

export default () => {
  const getLineColor = (tags) => {
    const colors = {
      1: '#DA291C',
      2: '#97D700',
      3: '#FFD700',
      4: '#0066CC',
      5: '#AA007C',
      6: '#D9027D',
      7: '#FF69B4',
      8: '#00C1F3',
      9: '#71C5E8',
      10: '#009C95',
      11: '#A41E32',
      12: '#007B5F',
      13: '#FFCD00',
      14: '#73C1E1',
      15: '#A15E3B',
      16: '#A757A8',
      17: '#FF6E4A',
      18: '#FF6666',
    }

    return colors[tags['ref']]
  }

  const setColor = ({ properties }) => {
    var color = getLineColor(properties)
    return { color: color, weight: 1 }
  }

  const filterOption = (node) => {
    return node.geometry.type !== 'Point'

  }

  const customMarkerIcon = (name) =>
    divIcon({
      html: name,
      className: 'icon',
    })

  const setIcon = ({ properties }, latlng) => {
    return L.marker(latlng, { icon: customMarkerIcon(properties.Name) })
  }

  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <Map center={[31.2304, 121.4737]} zoom={11} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' />
          <GeoJSON data={metro} style={setColor} filter={filterOption} />
        </Map>
      </div>
    </>
  )
}
