const express = require('express');
const app = express();
const geojson = require('geojson');
const washington = [-77.105665, 38.861637];

function getPoints(count) {
    const markers = [];
    for(var i=0; i<count; i++) {
        markers.push({
            lat: washington[1] + (Math.random() * 10),
            lng: washington[0] + (Math.random() * 10),
        });
    }

    return markers;
}

function getPolygonPoints(radius) {
    const points = [];
    for(var x=-radius; x<radius; x++) {
        points.push([
            washington[0] + (x - radius/10),
            washington[1] + (x*x - radius/5)
        ]);
    }

    return points;
}

app.use(express.static('.'));

app.get('/api/tile/:x/:y/:z', (req, res) => {
    res.sendFile('data/sample-tile.png', { root: __dirname });
})
// minx, miny, maxx, maxy = bounding box of the currently shown area on a map
app.get('/api/markers/:minx/:miny/:maxx/:maxy/:zoomLevel', (req, res) => {
    const markers = getPoints(100);
    res.send(geojson.parse(markers, { Point: ['lat', 'lng'] }));
});

app.get('/api/density/:minx/:miny/:maxx/:maxy/:zoomLevel', (req, res) => {
    const polygon = [
        {
            polygon: [
                getPolygonPoints(4)
            ],
            weight: 4
        },        
        {
            polygon: [
                getPolygonPoints(3)
            ],
            weight: 3
        },
        {
            polygon: [
                getPolygonPoints(2)
            ],
            weight: 2
        }
    ];
    res.send(geojson.parse(polygon, { Polygon: 'polygon' }));
});

app.listen(3000, function () {
  console.log('App listening on port 3000');
});