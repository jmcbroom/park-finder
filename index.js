var mapboxgl = require('mapbox-gl');
var _ = require('lodash');
var bbox = require('@turf/bbox')

mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjaXZvOWhnM3QwMTQzMnRtdWhyYnk5dTFyIn0.FZMFi0-hvA60KYnI-KivWg';

// here are the filters
var FILTERS = {
  "aerobics": "Aerobics",
  "archery": "Archery",
  "baseball": "Baseball",
  "basketball": "Basketball",
  "boxing": "Boxing",
  "chess": "Chess",
  "dance": "Dance",
  "dog_run": "Dog Park",
  "golf": "Golf",
  "horseshoes": "Horseshoes",
  "lacrosse": "Lacrosse",
  "nature": "Nature",
  "racquetball": "Racquetball",
  "picnic": "Picnic Tables",
  "playground": "Playground",
  "pool": "Pool",
  "restrooms": "Restrooms",
  "sled_hill": "Sled Hill",
  "soccer": "Soccer",
  "tennis": "Tennis",
  "trails": "Trails",
  "volleyball": "Volleyball",
  "walking": "Walking",
  "weights": "Weights",
  "yoga": "Yoga",
  "zumba": "Zumba"
}

// make a map objects
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/cityofdetroit/cix0w7n08000v2qpb2q15raq1',
    doubleClickZoom: false,
    zoom: 10.7,
    center: [-83.091, 42.350],
    // :triangular_ruler:
    bearing: -1.25,
    minZoom: 9,
    maxBounds: [
        [-83.611, 42.100],
        [-82.511, 42.600]
    ]
});

var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-left');

var popup = new mapboxgl.Popup({
    closeButton: false
});


map.on('load', function() {
  map.addSource('parks', {
    type: 'geojson',
    data: 'http://gis.detroitmi.gov/arcgis/rest/services/Parks/ParksAndRec/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })

  map.addLayer({
    "id": "parks-fill",
    "type": "fill",
    "source": "parks",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
        "fill-color": "green",
        "fill-opacity": 0.25
    }
  })
  map.addLayer({
    "id": "parks-line",
    "type": "line",
    "source": "parks",
    "layout": {
      "visibility": "visible",
      "line-join": "round"
    },
    "paint": {
        "line-color": "black",
        "line-opacity": 0.8,
        "line-width": {
            stops: [
                [8, 0.1],
                [11, 0.5],
                [13, 1.5],
                [17, 2.5],
                [22, 4]
            ]
        }
    }
  })

  // attach ze filters
  var filterPicker = document.getElementById('filter-picker');
  var filterPickerContainer = document.getElementById('filter-picker-container');
  var parkList = document.getElementById('list-container');
  var filter = ['any'];
  var pickedFilters = [];

  function getUniqueFeatures(array, comparatorProperty) {
      var existingFeatureKeys = {};
      // Because features come from tiled vector data, feature geometries may be split
      // or duplicated across tile boundaries and, as a result, features may appear
      // multiple times in query results.
      var uniqueFeatures = array.filter(function(el) {
          if (existingFeatureKeys[el.properties[comparatorProperty]]) {
              return false;
          } else {
              existingFeatureKeys[el.properties[comparatorProperty]] = true;
              return true;
          }
      });

      return uniqueFeatures;
  }

  function listUpdateHandler() {
    var parks = map.queryRenderedFeatures({
        layers: ['parks-fill'],
        filter: filter
      });
    while (parkList.firstChild) {
      parkList.removeChild(parkList.firstChild);
    }
    console.log(getUniqueFeatures(parks, 'ogc_fid'))
    var features = getUniqueFeatures(parks, 'ogc_fid')
    if (features) {
      features.forEach(function(p){
        // console.log(p.geometry.coordinates[0][0])
        var park = document.createElement('span');
        park.innerHTML = `<b>${p.properties.name}</b><br /><i>(${p.properties.address})</i>`
        park.addEventListener('mouseover', function() {
            console.log(p);
            console.log(bbox(p.geometry))
            // Highlight corresponding feature on the map
            popup.setLngLat(p.geometry.coordinates[0][0])
                .setText(p.properties.name + ' (' + p.properties.address + ')')
                .addTo(map);
        });
        park.addEventListener('click', function() {
          var flyBbox = bbox(p.geometry)
            map.fitBounds([
              [flyBbox[0], flyBbox[1]],
              [flyBbox[2], flyBbox[3]]
            ]);
        });
        parkList.appendChild(park)
      })
    }
  }

  function filterUpdateHandler() {
    filter = ['any']
    pickedFilters.forEach(function(f){
      filter.push(['==', f, 1])
    });
    map.setFilter('parks-fill', filter);
    map.setFilter('parks-line', filter);
  }

  function addFilterHandler(e){
    var selected = document.createElement('span')
    selected.textContent = e.target.value + " ";
    selected.className = "filter-item";
    selected.onclick = function(){
      removeFilterHandler(e.target.selectedOptions[0].id)
      this.parentNode.removeChild(this);
    }
    filterPickerContainer.appendChild(selected);
    pickedFilters.push(e.target.selectedOptions[0].id)
    filterUpdateHandler();
    listUpdateHandler();
  };

  function removeFilterHandler(id){
    console.log(id)
    _.remove(pickedFilters, function(d){
      return d == id;
    });
    console.log(pickedFilters)
    filterUpdateHandler();
    listUpdateHandler();
    // setTimeout(function(){ listUpdateHandler() }, 100);
  };

  filterPicker.addEventListener('change', function(e){ addFilterHandler(e)} );

  map.on('moveend', function() {listUpdateHandler()});

  Object.keys(FILTERS).forEach(function(f){
    var option = document.createElement('option');
    option.innerHTML = FILTERS[f];
    option.id = f;
    filterPicker.appendChild(option);
  })

})
