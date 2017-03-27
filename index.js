var Slideout = require('slideout');
var mapboxgl = require('mapbox-gl');
var GeocoderArcGIS = require('geocoder-arcgis');
var _ = require('lodash');
var bbox = require('@turf/bbox');

var thisSlideout = new Slideout({
  'panel': document.getElementById('map-container'),
  'menu': document.getElementById('menu'),
  'touch': true,
  'padding': 320,
  'tolerance': 70
});

// Toggle button
document.querySelector('.toggle-button').addEventListener('click', function() {
  thisSlideout.toggle();
});

var geocode_search = document.getElementById('search_geocoder')

// TODO: Listen for suggest
geocode_search.addEventListener('input', function(){
  console.log(geocode_search.value)
})

var geocoder = new GeocoderArcGIS({
  endpoint: "http://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer"
})

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
    // sort them alphabetically
    return _.sortBy(uniqueFeatures, [function(f) { return f.properties.name; }]);
}

// i found this on stack overflow. extends the DOM to add a .remove() function for a NodeList
// https://stackoverflow.com/questions/3387427/remove-element-by-id
Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

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

// do all the things when the map loads
map.on('load', function() {

  var info_window = document.getElementById('info')

  // add park and rec center sources
  map.addSource('parks', {
    type: 'geojson',
    data: 'https://gis.detroitmi.gov/arcgis/rest/services/DoIT/ParksDEV/FeatureServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })
  map.addSource('rec-centers', {
    type: 'geojson',
    data: 'https://gis.detroitmi.gov/arcgis/rest/services/DoIT/ParksDEV/FeatureServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=5&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  })

  // add parks fill & line layer
  map.addLayer({
    "id": "parks-fill",
    "type": "fill",
    "source": "parks",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
        "fill-color": "green",
        "fill-opacity": {
          stops: [
            [8, 0.05],
            [18, 0.3]
          ]
        }
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

  // add a rec center point layer
  map.addLayer({
    "id": "rec-center-symbol",
    "type": "symbol",
    "source": "rec-centers",
    "layout": {
        "icon-image": "star-15",
        "icon-allow-overlap": true,
        "text-field": "{name}",
        "text-size": {
          stops: [
            [10, 12],
            [20, 24]
          ]
        },
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0.5,0.5 ],
        "text-anchor": "left"
      },
    "paint": {
        "text-color": "rgba(0,0,0,0.9)",
        "text-halo-color": "rgba(255,255,255,0.9)",
        "text-halo-width": 2.5,
        "icon-color": "red"
    }
  })

  function featClicked(feat){
    console.log(feat.properties);
    switch (feat.layer.id){
      case 'parks-fill':
        var amenities = []
        Object.keys(feat.properties).forEach(function(p){
          if(feat.properties[p] == 1){
            console.log(p)
            amenities.push(FILTERS[p])
          }
          // console.log(p, feat.properties[p])
        })
        console.log(amenities)
        var html = `
          <span class=""><b>Park: ${feat.properties.name}</b></span><br/>
          <span class=""><b>Address:</b> ${feat.properties.address}</span><br/>
          <span class=""><b>Amenities:</b> ${amenities.join(', ')}</span><br/>
          `;
        break;
      case 'rec-center-symbol':

        var html = `
          <span class=""><b>Rec Center: ${feat.properties.name}</b></span><br/>
          <span class="b">Address: ${feat.properties.address}</span><br/>
          `;
        break;
    }
    console.log(html)
    info_window.innerHTML = html;
  }

  function flyToPolygon(p){
    var fb = bbox(p.geometry);
    var flybox = [[fb[0], fb[1]], [fb[2], fb[3]]]
    map.fitBounds(flybox, { padding: 100, maxZoom: 15.25 })
    featClicked(p)
  }

  geocode_search.addEventListener('keypress', function(e){
    if(e.key == "Enter"){
      url = `http://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=${geocode_search.value.replace(' ','+')}&outSR=4326&f=json`
      fetch(url).then(function(response) {
        return response.json();
      }).then(function(data) {
        console.log(data['candidates'][0]['location']);
        var coords = data['candidates'][0]['location']
        map.flyTo({
          center: [coords['x'],coords['y']],
          zoom: 14
        });
      }).catch(function() {
        console.log("Booo");
      });
    }
  })


  map.on('click', function (e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['parks-fill', 'rec-center-symbol'] });
      if (!features.length) {
          return;
      }
      flyToPolygon(features[0])
      featClicked(features[0])
  });


  map.on('moveend', function() {
    var qu_parks = map.queryRenderedFeatures({
      layers: ['parks-fill'],
    });
    var qu_centers = map.queryRenderedFeatures({
      layers: ['rec-center-symbol'],
    });
    var parks_to_show = getUniqueFeatures(qu_parks, 'ogc_fid');
    var centers_to_show = getUniqueFeatures(qu_centers, 'ogc_fid');

    var parkList = document.getElementById('parks')
    while (parkList.firstChild) {
      parkList.removeChild(parkList.firstChild);
    }
    centers_to_show.forEach(function(c){
      var rec = document.createElement('p');
      rec.innerHTML = `<b><span class="rec-center-name">&#x2605; ${c.properties.name}</b></span> (${c.properties.address})<br /><i>Rec Center</i><br /><i>(${c.properties.opening_hours})</i>`;
      rec.addEventListener('mousedown', function() {
        flyToPolygon(c);
      });
      parkList.appendChild(rec)
    })
    parks_to_show.forEach(function(p){
      var park = document.createElement('p');
      park.innerHTML = `<b>${p.properties.name}</b><br /><i>${p.properties.class} Park</i><br /><i>(${p.properties.address})</i>`;
      park.addEventListener('mousedown', function() {
        flyToPolygon(p);
      });
      parkList.appendChild(park)
    })
  });
})
