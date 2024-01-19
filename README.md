采用leaflet库实现

1. 获取geo数据 ，包括上海市地铁线路及对应线路的站点数据
2. 安装axios leaflet leaflet-iconmaterial  leaflet-providers 

# 地铁线路及对应站点数据 因各个平台提供的有差异 
这里以以OSM本身导出的数据和百度地图提供的数据为例

subway.json是通过OSM查询并导出的geo格式的地理数据
station.json是通过高德地图获取到的站点geo地理数据

差异: 
  格式上有差异
  经纬度对应的点位有差异(误差)

实现: 
 1. 将高德地图地铁线路数据转为OSM相对应格式的数据
 2. 加载地图 
 
 const mapContainer = document.getElementById('map')
 L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map) 

 3. 加载geo数据
 L.geoJSON(metro, {
      // ...options
  }).addTo(map)
  L.geoJSON(stationsGeoJson, {
        pointToLayer: setIcon,
  }).addTo(map)

  
