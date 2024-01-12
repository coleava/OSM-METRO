import React, { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import metro from './sh.json'

const MapComponent = () => {
  useEffect(() => {
    // 创建地图实例
    const mapContainer = document.getElementById('map')

    if (mapContainer && !mapContainer.hasChildNodes()) {
      const map = L.map('map').setView([51.505, -0.09], 13)

      // 添加地图图层
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      }).addTo(map)

      // 自定义Marker的Icon
      const customIcon = L.icon({
        iconUrl: 'path/to/icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })

      // 加载GeoJSON数据
      const geojsonData = {
        // GeoJSON数据
      }

      // 遍历GeoJSON数据并添加Marker标注
      L.geoJSON(metro, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, { icon: customIcon }).addTo(map)
        },
      })
    }
  }, [])

  return <div id="map" style={{ height: '400px' }}></div>
}

export default MapComponent
