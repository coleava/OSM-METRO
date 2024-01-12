import React, { useEffect, useState } from 'react'
// import { Map, TileLayer, GeoJSON, Marker, Tooltip } from 'react-leaflet'
import L, { Icon, divIcon } from 'leaflet'
import metro from './sh.json'
import './osm.css'
import 'leaflet/dist/leaflet.css'

import station from './station.json'
import subway from './subway.json'
import _ from 'lodash'

export default () => {
  const [selectedLine, setSelectedLine] = useState({})
  const [selected, setSelected] = useState(false)
  const [container, setMap] = useState(null)
  const [stationArray, setStationArray] = useState([])
  const [selectStation, setSelectedStation] = useState({})
  const stationConvert = () => {
    var geojson = {
      type: 'FeatureCollection',
      features: [],
    }
    let res = station['l']
    var stations = {}
    for (let i = 0; i < res.length; i++) {
      const r = res[i]
      let kn = r['kn']
      // let ln = r['ln']
      // let cl = r['cl']
      // let ls = r['ls']
      let st = r['st']

      for (let j = 0; j < st.length; j++) {
        let s = st[j]

        // 站点去重
        if (!stations[s['poiid']]) {
          stations[s['poiid']] = true
          let lineInfo = {
            name: s.n,
            description: kn,
            altitudeMode: 'clampToGround',
            tessellate: '-1',
            extrude: '0',
            visibility: '-1',
            snippet: '',
            id: s['poiid'],
          }
          var coords = s.sl.split(',').map(Number)
          var properties = lineInfo
          geojson.features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: coords,
            },
            properties: properties,
          })
        }
      }
    }
    return geojson
  }

  const convertSubway = () => {
    var geojson = {
      type: 'FeatureCollection',
      features: [],
    }
    let res = subway['l']
    for (var i = 0; i < res.length; i++) {
      const r = res[i]
      var st = r['st']
      var coords = []
      for (let j = 0; j < st.length; j++) {
        var s = st[j]
        var _coords = s.sl?.split(',')?.map(Number)
        _coords && coords.push(_coords)
      }
      geojson.features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
        properties: r,
      })
    }
    return geojson
  }

  useEffect(() => {
    loadMap()
  }, [])

  const loadMap = () => {
    const mapContainer = document.getElementById('map')

    if (mapContainer && !mapContainer.hasChildNodes()) {
      let map = L.map('map').setView([31.2304, 121.4737], 11)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map)
      L.geoJSON(metro, {
        style: setColor,
        filter: filterOption,
      }).addTo(map)

      let { stationsGeoJson, _stationArray } = objectConvertArray()
      L.geoJSON(stationsGeoJson, {
        pointToLayer: setIcon,
      }).addTo(map)
      setStationArray(_stationArray)
      setMap(map)
    }
  }

  const objectConvertArray = () => {
    const stationsGeoJson = stationConvert()

    let _stationArray = []
    const group = _.groupBy(stationsGeoJson.features, 'properties.description')
    _.keys(group).forEach((x) => {
      _stationArray.push({
        line: x,
        stations: group[x],
      })
    })

    return {
      stationsGeoJson,
      _stationArray,
    }
  }

  const clickLine = (selectedLine) => {
    setSelected(true)
    setSelectedLine(selectedLine)
  }

  const clickStation = (selectedStation) => {
    updateMarkerIcon(selectedStation.geometry.coordinates[1], selectedStation.geometry.coordinates[0])
    // let marker = L.marker(L.latLng(selectedStation.geometry.coordinates[1], selectedStation.geometry.coordinates[0]))
    // marker.setIcon()
  }

  const updateMarkerIcon = (lat, lng) => {
    container.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        var marker = layer
        var markerLatLng = marker.getLatLng()

        if (markerLatLng.lat === lat && markerLatLng.lng === lng) {
          marker.setIcon(
            L.icon({
              iconUrl: require('./icon/banglocation.png'),
              iconSize: [36, 36],
            })
          )
          marker.openPopup();
        }
      }
    })
  }

  const closeMarkerPopup = () => {
    container.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        layer.closePopup();
      }
    })
  }

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

  const setIcon = (node, latlng) => {
    // return L.marker(latlng, { icon:  customMarkerIcon(properties.Name)
    let icon = L.icon({
      iconUrl: require('./icon/banglocation.png'),
      iconSize: [24, 24],
      iconAnchor: [16, 32],
    })

    let marker = L.marker(latlng, {
      icon,
    })

    let { _stationArray } = objectConvertArray()

    let popup = L.popup().setLatLng(latlng).setContent(node.properties.name)
    marker.bindPopup(popup)
    marker
      .on('click', function () {
        if (marker.isPopupOpen()) {
          let findLine = _.find(_stationArray, (s) => s.line === node.properties.description)

          let station = _.find(findLine.stations, (x) => x.properties.name === node.properties.name)

          setSelected(true)
          clickLine(findLine)
          setSelectedStation(station)
          setTimeout(() => {
            let dom = document.querySelector(`#${station.properties.id}`)
            if (dom) {
              dom.style.backgroundColor = '#f0f0f0'
            }
          }, 100)

          marker.setIcon(
            L.icon({
              iconUrl: require('./icon/banglocation.png'),
              iconSize: [36, 36],
            })
          )
        }
      })
      .on('popupclose', () => {
        marker.setIcon(icon)
        setSelectedStation({})
        setSelected(false)
      })
    return marker
  }

  const back = ()=> {
    setSelected(false)
    setSelectedStation({})
    closeMarkerPopup()
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* <div style={{ position: 'relative', width: '100%', height: '100vh' }}> */}
      <div id="map" style={{ position: 'relative', width: '100%', height: '100vh' }}>
        {/* <Map center={[31.2304, 121.4737]} zoom={11} style={{ height: '100%' }}>
          <TileLayer
            // url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png"
            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            // attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          <GeoJSON data={metro} style={setColor} filter={filterOption} />
          <GeoJSON data={subwayData} pointToLayer={setIcon} />
        </Map> */}
      </div>
      {!selected && (
        <div className="line-list">
          {_.map(stationArray, (x, index) => (
            <h3 key={index} className="line-name" onClick={() => clickLine(x)}>
              {x.line}
            </h3>
          ))}
        </div>
      )}

      {selected && (
        <div className="line-station-list">
          <div style={{ fontSize: 18, marginBottom: 10, cursor: 'pointer' }} onClick={() => back()}>
            返回
          </div>
          <div style={{ height: 450, overflowY: 'auto' }}>
            {_.map(selectedLine.stations, (s) => {
              console.log('s', s)
              return (
                <div key={s.properties.id} id={s.properties.id} className="station" onClick={() => clickStation(s)}>
                  {s.properties.name}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
