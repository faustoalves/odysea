mapboxgl.accessToken =
  "pk.eyJ1IjoiZmF1c3RvYWx2ZXMiLCJhIjoiY2xkbm44ZjBjMGwzMTNvbWQwYnR1aTJtdyJ9.YyJ8xvjm-pYMGIkAP0Sz8A";
var origin = [-122.434, 37.7353];
var building;
const map = new mapboxgl.Map({
  container: "map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/dark-v9",
  center: origin,
  zoom: 15.4,
  pitch: 64.9,
  bearing: 172.5,
  antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
});

// eslint-disable-next-line no-undef
const tb = (window.tb = new Threebox(map, map.getCanvas().getContext("webgl"), {
  defaultLights: true,
}));

map
  .on("style.load", () => {
    map.addLayer({
      id: "custom-threebox-model",
      type: "custom",
      renderingMode: "3d",
      onAdd: function () {
        const scale = 4;
        const options = {
          obj: "assets/redbull.glb",
          type: "gltf",
          scale: { x: scale, y: scale, z: scale },
          units: "meters",
          rotation: { x: 90, y: 180, z: 0 },
        };

        tb.loadObj(options, (model) => {
          building = model.setCoords(origin);
          building.addEventListener("ObjectChanged", onObjectChanged, false);
          tb.add(building);
        });
      },

      render: function () {
        tb.update();
      },
    });
  })
  .on("click", function (e) {
    var pt = [e.lngLat.lng, e.lngLat.lat];
    travelPath(pt);
  });

function onObjectChanged(e) {
  let model = e.detail.object; //here's the object already modified
  let action = e.detail.action; //here's the action that changed the object
}

function travelPath(destination) {
  console.log(destination);
  // request directions. See https://docs.mapbox.com/api/navigation/#directions for details

  var url =
    "https://api.mapbox.com/directions/v5/mapbox/driving/" +
    [origin, destination].join(";") +
    "?geometries=geojson&access_token=" +
    "pk.eyJ1IjoiZmF1c3RvYWx2ZXMiLCJhIjoiY2xkbm44ZjBjMGwzMTNvbWQwYnR1aTJtdyJ9.YyJ8xvjm-pYMGIkAP0Sz8A";

  fetchFunction(url, function (data) {
    // extract path geometry from callback geojson, and set duration of travel
    var options = {
      path: data.routes[0].geometry.coordinates,
      duration: data.routes.length * 4000,
    };

    // start the truck animation with above options, and remove the line when animation ends
    building.followPath(options, function () {
      // tb.remove(line);
    });
    origin = destination;
  });
}

//convenience function for fetch

var btn1 = document.getElementById("position-1");
var btn2 = document.getElementById("position-2");
var btn3 = document.getElementById("position-3");

btn1.addEventListener("click", function () {
  gotoSpecificPosition([-122.43314482931885, 37.73850828742469], 19);
});

btn2.addEventListener("click", function () {
  gotoSpecificPosition([-122.46408978997538, 37.69862195234562], 17);
});

btn3.addEventListener("click", function () {
  gotoSpecificPosition([-122.41986100784132, 37.699307492595025], 18);
});

function gotoSpecificPosition(destination, zoom) {
  travelPath(destination);
  map.flyTo({
    center: destination,
    speed: 0.75,
    curve: 1,
    zoom: zoom,
  });
}

function fetchFunction(url, cb) {
  fetch(url).then(function (response) {
    if (response.status === 200) {
      response.json().then(function (data) {
        cb(data);
      });
    }
  });
}
