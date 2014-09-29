L.mapbox.accessToken = 'pk.eyJ1Ijoia2VyYiIsImEiOiJpdXNnU0V3In0.EzvrG2coRiHt9Up-TpeRuw#18/45.67922/-111.03717';
// var namespace = 'kerb.h5cpkg76';

$(document).ready(function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        // user location not found
    }
});

// callback for getcurrentposition
function showPosition(position) {
    var map = L.mapbox.map('map', 'examples.map-20v6611k');
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    map.setView([latitude, longitude], 15);

    var usersLayer = createLayerData(JSON.parse(
            '{ "notifications" : [' +
            '{ "latitude":"' + latitude + '", "longitude":"' + longitude + '", "name":"User" } ]}'
            ));

    plotLocations(usersLayer, map);
    animate(usersLayer, map);

    // plotLocation(user);
    // animate(radius, updateinterval, layer, map);

    var nearByNotifications = getNearByNotifications(latitude, longitude);
    var notificationsLayer = createLayerData(nearByNotifications);

    // plotLocation(notifications)
    // animate(radius, updateinterval, layer, map);

    plotLocations(notificationsLayer, map);
    animate(notificationsLayer, map);


    // plotPositions(position.coords.latitude, position.coords.longitude, nearByNotifications);
}

function createLayerData(data) {
    var features = [];

    // Add all nearby notifications to feature list.
    for (var i = 0; i < data.notifications.length; i++) {
        features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [data.notifications[i].longitude, data.notifications[i].latitude]
            },
            properties: {
                'marker-color': '#000',
                'marker-symbol': 'circle',
                title: data.notifications[i].name,
                count: 20
            }
        });
    }

    var layer = {
        type: 'FeatureCollection',
        features: features
    };

    return layer;
}

function getNearByNotifications(userlat, userlong) {

    // use jqery ajax to call web service
    // send user latlong, and fetch notifcations with in certain radius

    /*
     $.ajax({
     url: "http://awsserver/webservice/getnearbynotifications.json?lat=userlat&long=userlong&rad=radius",
     type: "GET",
     cache: true,
     dataType: 'jsonp',
     error: function(jqXHR, textStatus, errorThrown) {
     // alert("failure-"+jqXHR.statusText+"-,"+jqXHR.responseText+","+errorThrown.name+","+errorThrown.stack+","+errorThrown.Message+","+textStatus);
     },
     success: function(data, statusText) {
     if(data.length > 0) {
     return data;
     } else {	
     // some error occurred
     }
     }
     }); */

    // hard coding the notifications for demo
    var notifications = '{ "notifications" : [' +
            '{ "latitude":"38.878832", "longitude":"-94.664753", "name":"Fitness Center" },' +
            '{ "latitude":"38.879618", "longitude":"-94.667264", "name":"Buffalo Wild Wings" },' +
            '{ "latitude":"38.873451", "longitude":"-94.666906", "name":"Face Fancies" } ]}';

    return JSON.parse(notifications);
}

function cycleThroughNotifications(markers) {
    var index = 0;
    function run() {
        if (++index > markers.length - 2)
            index = 0;
        markers[index].openPopup();
        window.setTimeout(run, 2000);
    }
    run();
}

function plotLocations(layer, map) {
    L.geoJson(layer, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 5
            })
        }
    }).addTo(map);
}

function animate(layer, map) {
    var circleRadius = 6;
    var reachedMaxRadius = false;
    var geoJson;
    var circleSizeUpdateInterval = 10; //milliseconds

    function run() {

        // plot circle marker
        geoJson = L.geoJson(layer, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: circleRadius,
                    color: "red"
                })
            }
        });

        geoJson.addTo(map);

        // update circle radius and redraw
        window.setTimeout(function () {
            map.removeLayer(geoJson);
            if (reachedMaxRadius === false)
                circleRadius = circleRadius + 1;
            else
                circleRadius = circleRadius - 1;

            if (circleRadius > 50) {
                circleSizeUpdateInterval = 120;
                reachedMaxRadius = true;
            }
            if (circleRadius < 10) {
                circleSizeUpdateInterval = 10;
                reachedMaxRadius = false;
            }

            run();
        }, circleSizeUpdateInterval);
    }
    run();

}