const express = require('express');
const app = express();
const geojson = require('geojson');

function getPoints(count = 100) {
    const washington = [-77.105665, 38.861637];
    const markers = [];
    for(var i=0; i<count; i++) {
        markers.push({
            lat: washington[1] + (Math.random() * 10),
            lng: washington[0] + (Math.random() * 10),
            weight: Math.ceil(Math.random() * 10),
        });
    }

    return geojson.parse(markers, { Point: ['lat', 'lng', 'weight'] });
}

app.use(express.static('.'));

app.get('/api/tile/:x/:y/:z', (req, res) => {
    res.sendFile('data/sample-tile.png', { root: __dirname });
})
app.get('/api/markers', (req, res) => {
    res.send(getPoints());
});

app.get('/api/density', (req, res) => {
    res.send(getPoints(20));
});

app.listen(3000, function () {
  console.log('App listening on port 3000');
});