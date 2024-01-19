import React, { useEffect, useState } from 'react'
// import { Map, TileLayer, GeoJSON, Marker, Tooltip } from 'react-leaflet'
import L, { Icon, divIcon } from 'leaflet'
import metro from './sh.json'
import './osm.css'
import 'leaflet/dist/leaflet.css'

import station from './station.json'
import subway from './subway.json'
import _, { forEach } from 'lodash'
import coordtransform from 'coordtransform'

class Geojson {
  constructor(features = [], metaData = {}) {
    this.type = 'FeatureCollection'
    this.metadata = metaData
    this.features = features
  }
}
class Geometry {
  constructor(type, coordinates) {
    this.type = type
    this.coordinates = coordinates
  }
}
class Feature {
  constructor(geomType, properties, coordinates) {
    this.type = 'Feature'
    this.properties = properties
    this.geometry = new Geometry(geomType, coordinates)
  }
}

export default () => {
  const [selectedLine, setSelectedLine] = useState({})
  const [selected, setSelected] = useState(false)
  const [container, setMap] = useState(null)
  const [stationArray, setStationArray] = useState([])
  const [selectStation, setSelectedStation] = useState({})
  const [subwayLayer, setSubwayLayer] = useState(null)
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
    let l = station['l']
    let lines = [],
      stations = []
    l.forEach(({ kn, st }) => {
      let lineCoords = []
      st.forEach((d) => {
        const sl = d.sl.split(',').map(Number)
        lineCoords.push(sl)
        stations.push(new Feature('Point', d, sl))
        // lineCoords.push(coordtransform.bd09togcj02(sl[0],sl[1]))
        // stations.push(new Feature('Point', d, coordtransform.bd09togcj02(sl[0],sl[1])))
      })
      lines.push(new Feature('LineString', { kn }, lineCoords))
    })
    const linesGeojson = new Geojson(lines)
    const stationsGeojson = new Geojson(stations)
    return {
      linesGeojson,
      stationsGeojson,
    }
  }

  useEffect(() => {
    loadMap()
  }, [])

  useEffect(() => {
    if (!_.isEmpty(selectedLine)) {
      let layers = subwayLayer.getLayers()

      _.forEach(layers, (lay) => {
        let { feature } = lay
        let { properties } = feature
        let { kn } = properties
        if (kn.includes(selectedLine.line)) {
          lay.setStyle({
            weight: 8,
          })
        }
      })
    }
  }, [selectedLine])

  const loadMap = () => {
    const mapContainer = document.getElementById('map')

    if (mapContainer && !mapContainer.hasChildNodes()) {
      let map = L.map('map').setView([31.2304, 121.4737], 11)

      let { linesGeojson } = convertSubway()
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map)
      let subwayLayer = L.geoJSON(linesGeojson, {
        style: setColor,
        // filter: filterOption,
        onEachFeature: onEachFeature,
      }).addTo(map)

      let { stationsGeoJson, _stationArray } = objectConvertArray()

      L.geoJSON(stationsGeoJson, {
        pointToLayer: setIcon,
      }).addTo(map)
      setStationArray(_stationArray)
      setMap(map)
      setSubwayLayer(subwayLayer)
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

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: highlightFeature,
      mouseout: resetHighlight,
    })
  }

  const highlightFeature = (e) => {
    var layer = e.target
    layer.setStyle({
      weight: 10,
      opacity: 1,
    })

    setSelectedLine({
      line: layer.feature.properties.kn,
      stationArray: layer.feature.geometry.coordinates,
    })
  }

  const resetHighlight = (e) => {
    var layer = e.target
    layer.setStyle({
      weight: 3,
      opacity: 1,
    })
  }

  const clickLine = (selectedLine) => {
    setSelected(true)
    setSelectedLine(selectedLine)
  }

  const clickStation = (selectedStation) => {
    updateMarkerIcon(selectedStation.geometry.coordinates[1], selectedStation.geometry.coordinates[0])
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
          marker.openPopup()
        }
      }
    })
  }

  const closeMarkerPopup = () => {
    container.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        layer.closePopup()
      }
    })
  }

  const getLineColor = ({ kn }) => {
    const lineColors = [
      { line: '地铁1号线', color: '#FF0000' },
      { line: '地铁2号线', color: '#97D700' },
      { line: '地铁3号线', color: '#FFD700' },
      { line: '地铁4号线', color: '#6E3C8E' },
      { line: '地铁5号线', color: '#AA007C' },
      { line: '地铁6号线', color: '#C76395' },
      { line: '地铁7号线', color: '#FF5A00' },
      { line: '地铁8号线', color: '#0060A9' },
      { line: '地铁9号线', color: '#71C5E8' },
      { line: '地铁10号线', color: '#DA70D6' },
      { line: '地铁11号线', color: '#782F40' },
      { line: '地铁12号线', color: '#007B5F' },
      { line: '地铁13号线', color: '#FF69B4' },
      { line: '地铁14号线', color: '#BBA786' },
      { line: '地铁15号线', color: '#A15E3B' },
      { line: '地铁16号线', color: '#A757A8' },
      { line: '地铁17号线', color: '#FF6E4A' },
      { line: '地铁18号线', color: '#997B66' },
      { line: '磁悬浮', color: '#00A4E4' },
      { line: '轨道交通浦江线', color: '#DA291C' },
    ]

    let find = _.find(lineColors, (x) => kn.includes(x.line))
    return find.color
    // return colors[tags['ref']]
  }

  const setColor = ({ properties }) => {
    var color = getLineColor(properties)
    return { color, weight: 3, fillOpacity: 1 }
  }

  const filterOption = (node) => {
    return node.geometry.type !== 'Point'
  }

  const setIcon = (node, latlng) => {
    // return L.marker(latlng, { icon:  customMarkerIcon(properties.Name)
    let icon = L.icon({
      iconUrl: require('./icon/location.png'),
      iconSize: [24, 24],
      // iconAnchor: [16, 32], 图标偏移量
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
              iconUrl: require('./icon/location.png'),
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

  const back = () => {
    setSelected(false)
    setSelectedStation({})
    closeMarkerPopup()
    let layers = subwayLayer.getLayers()

    _.forEach(layers, (lay) => {
      lay.setStyle({
        weight: 3,
      })
    })
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
            <div
              style={{ display: 'flex', alignItems: 'center', margin: 0, backgroundColor: selectedLine && selectedLine.line === x.line ? '#f0f0f0' : '' }}
              onClick={() => clickLine(x)}
              className="line-list-item"
            >
              <h3 key={index} className="line-name" style={{ width: '60%' }}>
                {x.line}
              </h3>
              <span style={{ display: 'inline-block', backgroundColor: getLineColor({ kn: x.line }), width: 20, height: 4, marginLeft: 10 }}></span>
            </div>
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
