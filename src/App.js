import './App.css'
import L from 'leaflet'
import React, { useEffect } from 'react'
import meterGeo from './shanhai.json'

function App() {
  // const [geoData, setGeoData] = useState({})
  useEffect(() => {
    // setGeoData(meterGeo)
    loadMap(meterGeo)
  }, [])

  const loadMetroGeoData = async () => {
    //     const payload = `[out:json];
    // area[name='上海'];
    // (
    //   relation[network='上海地铁']
    // );
    // out geom;`
    //     let cfg = {
    //       baseURL: 'https://overpass-api.de/api/interpreter',
    //       method: 'POST',
    //       responseType: 'json',
    //       headers: {
    //         'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    //       },
    //       data: 'data=' + encodeURIComponent(payload),
    //     }
    //     let response = await axios(cfg)
    //     console.log(response.data)
  }

  const loadMap = (geojson) => {
    // let container = L.map('map11').setView([31.2304, 121.4737], 11)

    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    // }).addTo(container)

    // L.geoJSON(geojson, {
    //   style: function (feature) {
    //     var color = getLineColor(feature.properties)
    //     return { color: color }
    //   },
    //   filter: function (feature) {
    //     console.log('feature', feature)
    //     return feature.geometry.type !== 'Point'
    //   },
    // }).addTo(container)
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

  return <div id="map11"></div>
}

export default App
