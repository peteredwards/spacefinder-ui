/**
 * Leaflet.js functions for spacefinder
 */
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

/**
 * Initialise map and set listeners to set up markers when loaded
 */
function initMap() {
    splog( 'initMap', 'map-leaflet.js' );
    document.addEventListener( 'sfmaploaded', checkGeo );
    document.addEventListener( 'filtersapplied', filterMarkers );
    document.addEventListener( 'spacesloaded', maybeSetupMap );
    document.addEventListener( 'filtersloaded', maybeSetupMap );
    document.addEventListener( 'sfmaploaded', maybeSetupMap );
    spacefinder.map = L.map( 'map' ).setView([spacefinder.currentLoc.lat, spacefinder.currentLoc.lng], spacefinder.startZoom );
    spacefinder.osm = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a target="attribution" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo( spacefinder.map );
    spacefinder.esri_sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
	    attribution: 'Tiles © Esri - Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    spacefinder.map.addControl(new L.Control.Fullscreen( { position: 'topright' } ));
    spacefinder.mapLoaded = true;
    spacefinder.viewdata = {
        'street': {
            btnText: 'Street',
            btnLabel: 'Switch to Street View',
            btnClass: 'maptype-street',
            tileLayer: spacefinder.osm
        },
        'satellite': {
            btnText: 'Satellite',
            btnLabel: 'Switch to Satellite View',
            btnClass: 'maptype-satellite',
            tileLayer: spacefinder.esri_sat
        }
    };

    document.dispatchEvent( new Event( 'sfmaploaded' ) );

    /**
     * Add click listeners
     */
    document.addEventListener( 'click', event => {
        /* Returns to list view from map "more info" button */
        if ( event.target.classList.contains('show-list') ) {
            event.preventDefault();
            document.dispatchEvent( new CustomEvent( 'viewchange', {
                bubbles: true,
                cancelable: true,
                composed: false,
                detail: {
                    view: 'list'
                }
            } ) );
        }
        /* prevents the close button on popups changing the anchor */
        if ( event.target.classList.contains( 'leaflet-popup-close-button' ) || event.target.parentNode.classList.contains( 'leaflet-popup-close-button' ) ) {
            event.preventDefault();
        }
    });

    /**
     * make sure the map knows about resizing, both of the main
     * window, and when a change in view happens (which may reduce
     * the area taken up by the map component)
     */
    window.addEventListener( 'resize', () => {
        clearTimeout( spacefinder.resizeTimeout );
        spacefinder.resizeTimeout = setTimeout( () => {
            splog( 'invalidating map size - resize event', 'map-leaflet.js' );
            spacefinder.map.invalidateSize( true );
        }, 200);
    });
    document.addEventListener( 'viewchange', () => {
        splog('view changed', 'map-leaflet.js');
        window.setTimeout( () => {
            splog( 'invalidating map size - viewchange event', 'map-leaflet.js' );
            spacefinder.map.invalidateSize( true );
        }, 500);
    });
}

/**
 * Sets up te map with markers for each space. Needs to run when
 * the map is fully loaded and the space data is fully loaded.
 */
function maybeSetupMap() {
    splog( 'maybeSetupMap', 'map-leaflet.js' );
    if ( spacefinder.mapLoaded && spacefinder.spacesLoaded && spacefinder.filtersLoaded ) {

        /* collect latLng coordinates here to define map bounds */
        let pointsArray = [];
        
        /**
         * Initialise marker cluster group
         * @see https://github.com/Leaflet/Leaflet.markercluster
         */
        spacefinder.markergroup = L.markerClusterGroup({
			disableClusteringAtZoom: 17,
			zoomToBoundsOnClick: true,
			spiderfyOnMaxZoom: false,
			polygonOptions: {
				color: '#c70000',
				fillColor: '#c70000'
			}
		});
        
        /* add each space to the map using a marker */
        for ( let i = 0; i < spacefinder.spaces.length; i++ ) {
            if ( spacefinder.spaces[i].lat && spacefinder.spaces[i].lng ) {
                var spacePosition = L.latLng( spacefinder.spaces[i].lat, spacefinder.spaces[i].lng );
                pointsArray.push( [ spacefinder.spaces[i].lat, spacefinder.spaces[i].lng ] );
                spacefinder.spaces[i].marker = L.marker( spacePosition, {
                    alt: spacefinder.spaces[i].title,
                    title: spacefinder.spaces[i].title,
                    icon: getSVGIcon( 'space-marker' )
                });
                spacefinder.markergroup.addLayer(spacefinder.spaces[i].marker);
                /* set the popup for the marker */
                spacefinder.spaces[i].popup = L.popup().setContent( getSpaceInfoWindowContent( spacefinder.spaces[i] ) );
                spacefinder.spaces[i].popup.spaceID = spacefinder.spaces[i].id;
                spacefinder.spaces[i].marker.bindPopup( spacefinder.spaces[i].popup );
            }
        }

        /* add the markers to the map */
        spacefinder.map.addLayer( spacefinder.markergroup );

        /* use popupopen and popupclose events to select and deselect spaces from map */
        spacefinder.map.on( 'popupopen', event => {
            zoomMapToSpace( event.popup.spaceID );
            document.dispatchEvent( new CustomEvent( 'spaceSelectedOnMap', { bubbles: true, detail: { id: event.popup.spaceID, src: 'map' } } ) );
        });
        spacefinder.map.on( 'popupclose', event => {
            document.dispatchEvent( new CustomEvent( 'spaceDeselectedFromMap', { bubbles: true, detail: { id: event.popup.spaceID } } ) );
        });

        /* respond to corresponding events from list */
        document.addEventListener( 'spaceSelected', event => { zoomMapToSpace( event.detail.id ) } );
        document.addEventListener( 'spaceDeselected', deselectSpacesFromMap );
    
        /* Make sure the map view encompasses all markers */
        if ( pointsArray.length ) {
            spacefinder.map.fitBounds( pointsArray );
        }

        /* save the map bounds and zoom to enable resetting */
        spacefinder.mapBounds = spacefinder.map.getBounds();
        spacefinder.mapZoom = parseInt( spacefinder.map.getZoom() );
        
        /**
         * Create a button to switch base layers between streets (OpenStreetMap)
         * and satellite (ESRI).
         */
        L.Control.mapTypeControl = L.Control.extend({
            onAdd: function(map) {
                let sd = spacefinder.viewdata.satellite;
                const mapTypeButton = document.createElement( 'button' );
                mapTypeButton.innerHTML = sd.btnText;
                mapTypeButton.classList.add('maptype-button');
                mapTypeButton.classList.add(sd.btnClass);
                mapTypeButton.setAttribute('aria-label', sd.btnLabel);
                mapTypeButton.setAttribute('title', sd.btnLabel);
                mapTypeButton.setAttribute('data-currentType', 'street');
                return mapTypeButton;
            },
            onRemove: function(map) {
                // Nothing to do here
            }
        });

        /* constructor */
        L.control.mapTypeControl = function(opts) {
            return new L.Control.mapTypeControl(opts);
        }

        /* add to map */
        L.control.mapTypeControl( { position: 'topright' } ).addTo( spacefinder.map );

        /* add listener to map type button to toggle base layer */
        document.addEventListener('click', event => {
            if ( event.target.matches('.maptype-button') ) {
                let currentType = event.target.getAttribute('data-currentType');
                let newType = currentType == 'street' ? 'satellite': 'street';
                let mapTypeButton = document.querySelector('button.maptype-button');
                if ( mapTypeButton ) {
                    mapTypeButton.classList.replace( spacefinder.viewdata[newType].btnClass, spacefinder.viewdata[currentType].btnClass );
                    mapTypeButton.innerHTML = spacefinder.viewdata[currentType].btnText;
                    mapTypeButton.setAttribute('aria-label', spacefinder.viewdata[currentType].btnLabel);
                    mapTypeButton.setAttribute('title', spacefinder.viewdata[currentType].btnLabel);
                    mapTypeButton.setAttribute('data-currentType', newType);
                    spacefinder.viewdata[currentType].tileLayer.removeFrom( spacefinder.map );
                    spacefinder.viewdata[newType].tileLayer.addTo( spacefinder.map );
                }
            }
        });
        
        /* let eveyone know we are ready */
        document.dispatchEvent( new Event( 'sfmapready' ) );
    }
}

/**
 * Returns HTML for an individual space's infoWindow 
 * @param {Object} space 
 * @returns {String} HTML content for space infoWindow
 */
function getSpaceInfoWindowContent( space ) {
	let info = [];
	info.push( space.space_type );
	if ( space.floor !== "" ) {
		info.push( space.floor );
	}
	if ( space.building !== "" ) {
		info.push( space.building );
	}
	let content = '<div class="spaceInfoWindow"><h3>'+space.title+'</h3>';
	content += '<p class="info">' + info.join(', ') + '</p>';
	content += '<p class="description">' + space.description + '</p>';
	content += '<button class="show-list">More info&hellip;</button></div>';
	return content;
}

/**
 * Returns an object to be used in the map to make a leaflet icon
 * @param {String} className CSS class to be used on the icon
 * @return {Object}
 */
function getSVGIcon( c ) {
	return L.divIcon({
  		html: `<svg width="32" height="32" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" stroke-width="6"></circle></svg>`,
		className: c,
  		iconSize: [32, 32],
  		iconAnchor: [16, 16]
	});
}


function recentreMap() {
    splog( 'recentreMap', 'map-leaflet.js' );
    let newCenter = geolocationActive() ? spacefinder.personLoc: spacefinder.currentLoc;
    spacefinder.map.panTo( newCenter );
    spacefinder.map.fitBounds( spacefinder.mapBounds );
}

/**
 * Zooms the map to show a particular space
 * @param {Object} space
 */
function zoomMapToSpace( spaceid ) {
    splog( 'zoomMapToSpace', 'map-leaflet.js' );
    let space = getSpaceById( spaceid );
    let newCenter = L.latLng( space.lat, space.lng );
    space.popup.setLatLng( newCenter ).openOn( spacefinder.map );
    spacefinder.map.setView( newCenter, 18 );
}


/**
 * Resets the map after a space has been selected
 * @param {Object} space
 */
 function deselectSpacesFromMap( recentre ) {
    splog( 'deselectSpacesFromMap', 'map-leaflet.js' );
    spacefinder.map.closePopup();
    /*if ( recentre ) {
        splog('recentring map', 'map-leaflet.js' );
        recentreMap();
    } else if ( spacefinder.map.getZoom() > 17 ) {
        spacefinder.map.zoomOut();
    }*/
}

/**
 * Filters the markers on the map
 */
function filterMarkers() {
    splog( 'filterMarkers', 'map-leaflet.js' );
    let markersToAdd = [];
    document.querySelectorAll('.list-space').forEach( element => {
        let space = getSpaceById( element.getAttribute('data-id') );
        if ( ! element.classList.contains('hidden') ) {
            markersToAdd.push( space.marker );
        }
    });
    spacefinder.markergroup.clearLayers();
    spacefinder.markergroup.addLayers( markersToAdd );
}

/*******************************************************************
 * GEOLOCATION
 *******************************************************************/

/**
 * Toggle the disabled attribute of the geolocation control
 * @param {boolean} enable which way to toggle
 */
function toggleGeolocation( enable ) {
    splog( 'toggleGeolocation', 'map-leaflet.js' );
    if ( enable ) {
        document.querySelectorAll( '.geo-button' ).forEach( element => element.disabled = false );
    } else {
        document.querySelectorAll( '.geo-button' ).forEach( element => element.disabled = true );
    }
}

/**
 * Toggle the active class of the geolocation control.
 * Also adds/removes the event listener to update the user's position
 * and adds / removes the person marker.
 * @param {boolean} activate which way to toggle
 */
function activateGeolocation( activate ) {
    splog( 'activateGeolocation', 'map-leaflet.js' );
    if ( activate ) {
        document.querySelectorAll( '.geo-button' ).forEach( element => {
            element.classList.add('active');
            element.setAttribute('aria-label','Stop using my location')
            element.setAttribute('title','Stop using my location')
        });
        document.addEventListener( 'userlocationchanged', movePersonMarker );
        document.dispatchEvent(new CustomEvent('sfanalytics', {
            detail: {
                type: 'geostart'
            }
        }));
    } else {
        document.querySelectorAll( '.geo-button' ).forEach( element => {
            element.classList.remove('active');
            element.setAttribute('aria-label','Use my location')
            element.setAttribute('title','Use my location')
        });
        document.removeEventListener( 'userlocationchanged', movePersonMarker );
        /* remove sorting indicator from all buttons */
        document.getElementById( 'sortdistance' ).setAttribute('data-sortdir', '');
        document.dispatchEvent(new CustomEvent('sfanalytics', {
            detail: {
                type: 'geoend'
            }
        }));
    }
    updateDistances();
    activateSort( activate, 'distance' );
}

/**
 * Moves the person marker to the user's position and centres the 
 * map on that position. The property spacefinder.personLoc is used
 * for the user position - this is updated in the geolocation.watchPosition
 * event listener. In addition to moving the person marker, distances
 * from the person to each space are updated, and if spaces are sorted
 * by distance, the sort order is updated.
 * @see getUserPosition()
 */
function movePersonMarker() {
    splog( 'movePersonMarker', 'map-leaflet.js' );
    /* move person marker */
    if ( spacefinder.personMarker ) {
        spacefinder.personMarker.setPosition( spacefinder.personLoc );
    }
    /* update distances to each space */
    updateDistances();
    /* see if the spaces are sorted by distance */
    let btn = document.querySelector('#sortdistance[data-sortdir$="sc"');
    if ( btn !== null ) {
        /* determine direction from current attribute value */
        let sortdir = document.getElementById('sortdistance').getAttribute('data-sortdir');
        let dir = ( sortdir == 'desc' ) ? false: true;
        /* re-sort spaces */
        sortSpaces( 'sortdistance', dir );
    }
    /* centre the map on the person */
    spacefinder.map.panTo( spacefinder.personLoc );
}

/**
 * Test to see if geolocation services are enabled
 * @returns {boolean}
 */
function geolocationEnabled() {
    splog( 'geolocationEnabled', 'map-leaflet.js' );
    const btn = document.querySelector( '.geo-button' );
    if ( btn !== null ) {
        return btn.disabled == false;
    }
    return false;
}

/**
 * Test to see if geolocation services are active
 * @returns {boolean}
 */
function geolocationActive() {
    splog( 'geolocationActive', 'map-leaflet.js' );
    return ( document.querySelector( '.geo-button.active' ) !== null ? true: false );
}

/**
 * Performs checks for geolocation permissions and services when the map has loaded
 */
function checkGeo() {
    splog( 'checkGeo', 'map-leaflet.js' );
    /* first see if geolocation is available on the device */
    checkGeoAvailable();
    /* check to see if it is enabled to determine initial button states */
    checkGeoPermissions();
}

/**
 * Checks permissions to see if geolocation services are permitted.
 * If they have been denied, geolocation is disabled. Also
 * watches for updates to permissions.
 */
function checkGeoPermissions() {
    splog( 'checkGeoPermissions', 'map-leaflet.js' );
    /* check for permissions query */
    if ( 'permissions' in navigator && navigator.permissions.query ) {
        /* query geolocation permissions */
        navigator.permissions.query( {
            name: 'geolocation'
        } ).then( result => {
            /* save permission state (denied, granted or prompt) */
            spacefinder.permission = result.state;
            if ( 'denied' == result.state ) {
                toggleGeolocation( false );
            } else {
                toggleGeolocation( true );
            }
            result.onchange = function() {
                spacefinder.permission = result.state;
                if ( 'denied' == result.state ) {
                    toggleGeolocation( false );
                } else {
                    toggleGeolocation( true );
                }
            }
        }).catch(error => {
            toggleGeolocation( false );
        });
    }
}

/**
 * Tests for availability of geolocation on client. If available,
 * adds buttons to activate it and adds listeners to buttons.
 */
function checkGeoAvailable() {
    splog( 'checkGeoAvailable', 'map-leaflet.js' );
    if ( 'geolocation' in navigator ) {
        /* make button for map to let user activate geolocation */
        L.Control.geoControl = L.Control.extend({
            onAdd: function(map) {
                const locationButton = document.createElement( 'button' );
                locationButton.innerHTML = '';
                locationButton.classList.add('geo-button');
                locationButton.classList.add('icon-my-location');
                locationButton.setAttribute('aria-label', 'Use my location');
                locationButton.setAttribute('title', 'Use my location');
                return locationButton;
            },
            onRemove: function(map) {}
        });
        L.control.geoControl = function(opts) {
            return new L.Control.geoControl(opts);
        }
        L.control.geoControl( { position: 'topright' } ).addTo( spacefinder.map );

        /* add listener to buttons to toggle geolocation */
        document.addEventListener('click', event => {
            if ( event.target.matches('.geo-button') ) {
                if ( ! geolocationEnabled() ) {
                    return;
                }
                if ( geolocationActive() ) {
                    /* disable geolocation */
                    forgetUserPosition()
                } else {
                    /* get the current position */
                    getUserPosition();
                }
            }
        });

    } else {
        activateGeolocation( false );
        toggleGeolocation( false );
    }
}

/**
 * Cancels the watchPosition listener, removes the person marker,
 * and deactivates geolocation controls.
 */
function forgetUserPosition() {
    splog( 'forgetUserPosition', 'map-leaflet.js' );
    /* stop watching user position */
    navigator.geolocation.clearWatch( spacefinder.watchID );
    /* remove person marker from map */
    spacefinder.personMarker.remove();
    /* make location buttons inactive */
    activateGeolocation( false );
    /* re-centre map */
    spacefinder.map.panTo( spacefinder.currentLoc );
}
/**
 * Gets the current position of the user device, centres the
 * map on that position and adds a marker. Then sets a 
 * geolocation.watchPosition listener to update the position 
 * when it changes.
 * TODO: watch for dragging of map by user - this should disable
 * recentring the map on the user position and (possibly) show a 
 * button to recentre? (but not moving the marker)
 */
function getUserPosition() {
    splog( 'getUserPosition', 'map-leaflet.js' );
	navigator.geolocation.getCurrentPosition( position => {
        /* centre the map on the user coordinates */
		spacefinder.personLoc.lat = position.coords.latitude;
		spacefinder.personLoc.lng = position.coords.longitude;
        if ( ! spacefinder.mapBounds.contains( spacefinder.personLoc ) ) {
            toggleGeolocation( false );
            openAlertDialog('Sorry...', 'You need to be a bit nearer to use this feature.');
            return;
        }
        /* centre the map on the user position */
		spacefinder.map.panTo( spacefinder.personLoc );
        /* add a person marker */
		spacefinder.personMarker = L.marker( spacefinder.personLoc, { alt: 'Your location' } ).addTo( spacefinder.map );
        activateGeolocation( true );
        /* watch for changes in the user position and update the map by firing an event */
		spacefinder.watchID = navigator.geolocation.watchPosition( position => {
            if ( ! ( spacefinder.personLoc.lat == position.coords.latitude && spacefinder.personLoc.lng == position.coords.longitude ) ) {
                spacefinder.personLoc.lat = position.coords.latitude;
                spacefinder.personLoc.lng = position.coords.longitude;
                document.dispatchEvent( new Event( 'userlocationchanged' ) );
            }
        }, error => {
			navigator.geolocation.clearWatch( spacefinder.watchID );
            activateGeolocation( false );
		});

    }, (error) => {
        activateGeolocation( false );
		switch (error.code) {
			case 1:
				// Permission denied - The acquisition of the geolocation information failed because the page didn't have the permission to do it.
			case 2:
				// Position unavailable - The acquisition of the geolocation failed because at least one internal source of position returned an internal error.
                toggleGeolocation( false );
                break;
			case 3:
				// Timeout - The time allowed to acquire the geolocation was reached before the information was obtained.
		}
	});
}

/**
 * Updates the data-sortdistance attribute for all spaces relative
 * to the user position.
 */
function updateDistances() {
    splog( 'updateDistances', 'map-leaflet.js' );
    if ( geolocationActive() ) {
        spacefinder.spaces.forEach( (space, index) => {
            spacefinder.spaces[index].distancefromcentre = haversine_distance( spacefinder.personLoc, { lat: space.lat, lng: space.lng } );
            document.querySelector('[data-id="' + space.id + '"]').setAttribute('data-sortdistance', spacefinder.spaces[index].distancefromcentre );
        });
    } else {
        let spacenodes = document.querySelectorAll('.list-space');
        if ( spacenodes !== null ) {
            spacenodes.forEach( element => element.setAttribute('data-sortdistance', '') );
        }
    }
}