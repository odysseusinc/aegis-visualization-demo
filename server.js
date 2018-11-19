const express = require('express');
const app = express();
const geojson = require('geojson');
const odysseusLocation = [-74.9323, 40.2283];
const fs = require('fs');

function getPoints(count) {
    const markers = [];
    for(var i=0; i<count; i++) {
        markers.push({
            lat: odysseusLocation[1] + (Math.random() * 10),
            lng: odysseusLocation[0] + (Math.random() * 10),
        });
    }

    return markers;
}

app.use(express.static('.'));

// minx, miny, maxx, maxy = bounding box of the currently shown area on a map
app.get('/api/markers/:minx/:miny/:maxx/:maxy/:zoomLevel', (req, res) => {
    const markers = getPoints(100);
    res.send(geojson.parse(markers, { Point: ['lat', 'lng'] }));
});

app.get('/api/density/:minx/:miny/:maxx/:maxy/:zoomLevel', (req, res) => {
    res.sendFile('data/h.json', { root: __dirname });    
});

app.listen(3000, function () {
  console.log('App listening on port 3000');
});