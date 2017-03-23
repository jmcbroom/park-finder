var Slideout = require('slideout');
var mapboxgl = require('mapbox-gl');
var _ = require('lodash');
var centroid = require('@turf/centroid');
var bbox = require('@turf/bbox');

var thisSlideout = new Slideout({
  'panel': document.getElementById('map-container'),
  'menu': document.getElementById('menu'),
  'touch': true,
  'padding': 300,
  'tolerance': 70
});

// Toggle button
document.querySelector('.toggle-button').addEventListener('click', function() {
  thisSlideout.toggle();
});

mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mZGV0cm9pdCIsImEiOiJjaXZvOWhnM3QwMTQzMnRtdWhyYnk5dTFyIn0.FZMFi0-hvA60KYnI-KivWg';

// make a map object
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/cityofdetroit/cix0w7n08000v2qpb2q15raq1',
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

// lookup object for the filters.
var FILTERS = {
  // "aerobics": "Aerobics",
  // "archery": "Archery",
  "baseball": "Baseball",
  "basketball": "Basketball",
  // "boxing": "Boxing",
  "chess": "Chess",
  // "dance": "Dance",
  "dog_run": "Dog Park",
  "golf": "Golf",
  "horseshoes": "Horseshoes",
  // "lacrosse": "Lacrosse",
  "natural_area": "Nature Area",
  // "racquetball": "Racquetball",
  "picnic": "Picnic Tables",
  "playground": "Playground",
  // "pool": "Pool",
  "restrooms": "Restrooms",
  "sled_hill": "Sled Hill",
  "soccer": "Soccer",
  "tennis": "Tennis",
  "trails": "Trails",
  // "volleyball": "Volleyball",
  "walking": "Walking"
  // "weights": "Weights",
  // "yoga": "Yoga",
  // "zumba": "Zumba"
}

// add nav and geolocation controls to the map
var nav = new mapboxgl.NavigationControl();
var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    }
});
map.addControl(nav, 'bottom-right');
map.addControl(geolocate, 'bottom-right');

var popup = new mapboxgl.Popup({
    closeButton: false
});

// do all the things when the map loads
map.on('load', function() {
  // add the GeoJSON from our ArcServer
  map.addSource('parks', {
    type: 'geojson',
    data: 'https://gis.detroitmi.gov/arcgis/rest/services/DoIT/ParksDEV/FeatureServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })
  map.addSource('rec-centers', {
    type: 'geojson',
    data: 'https://gis.detroitmi.gov/arcgis/rest/services/DoIT/ParksDEV/FeatureServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })

  // add a fill layer
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
  // add an outline layer
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
  // add a fill layer
  map.addLayer({
    "id": "rec-center-fill",
    "type": "fill",
    "source": "rec-centers",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
        "fill-color": "blue",
        "fill-opacity": 0.25
    }
  })
  // add an outline layer
  map.addLayer({
    "id": "rec-centers-line",
    "type": "line",
    "source": "rec-centers",
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

})
