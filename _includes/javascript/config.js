const spacefinder = {
    map: null,
    currentLoc: {'lat': 53.806529, 'lng': -1.555291},
    personLoc: {'lat': 53.806529, 'lng': -1.555291},
    personMarker: null,
    personWatcher: false,
    geoActive: false,
    infoWindow: null,
    startZoom: 16,
    watchID: false,
    permission: false,
    mapLoaded: false,
    spacesLoaded: false,
    mapBounds: null,
    spacesurl: 'https://uol-library.github.io/spacefinder-ui/spaces.json',
    imageBaseURL: 'https://uol-library.github.io/spacefinder-ui/assets/photos/',
    spaces: [],
    dialogs: {},
    filterEvent: new Event('viewfilter', {
        bubbles: true,
        cancelable: true,
        composed: false,
    }),
    spaceProperties: {
        'type_caf': 'Café',
        'type_generalseatingarea': 'General Seating Area',
        'type_itcluster': 'IT Cluster',
        'type_library': 'Library',
        'type_outdoorseatingarea': 'Outdoor Seating Area',
        'type_seminarroom': 'Seminar room',
        'work_private': 'Alone, in private',
        'work_close': 'Where others are working',
        'work_friends': 'With friends',
        'work_group': 'On a group project',
        'atmosphere_disciplined': 'Disciplined',
        'atmosphere_relaxed': 'Relaxed',
        'atmosphere_historic': 'Historic',
        'atmosphere_modern': 'Modern',
        'atmosphere_inspiring': 'Inspiring',
        'atmosphere_cosy': 'Cosy',
        'atmosphere_social': 'Social',
        'atmosphere_friendly': 'Friendly',
        'noise_strictlysilent': 'Strictly silent',
        'noise_whispers': 'Whispers',
        'noise_backgroundchatter': 'Background chatter',
        'noise_animateddiscussion': 'Animated discussion',
        'noise_musicplaying': 'Music playing',
        'facility_food_drink': 'Food &amp; drink allowed',
        'facility_daylight': 'Natural daylight',
        'facility_views': 'Attractive views out of the window',
        'facility_large_desks': 'Large desks',
        'facility_free_wifi': 'Free Wifi',
        'facility_no_wifi': 'No WiFi',
        'facility_computers': 'Computers',
        'facility_laptops_allowed': 'Laptops allowed',
        'facility_sockets': 'Plug Sockets',
        'facility_signal': 'Phone signal',
        'facility_printers_copiers': 'Printers and copiers',
        'facility_whiteboards': 'Whiteboards',
        'facility_projector': 'Projector',
        'facility_outdoor_seating': 'Outdoor seating',
        'facility_bookable': 'Bookable',
        'facility_toilets': 'Toilets nearby',
        'facility_refreshments': 'Close to refreshments',
        'facility_break': 'Close to a place to take a break',
        'facility_wheelchair_accessible': 'Wheelchair accessible',
        'facility_blue_badge_parking': 'Parking for blue badge holders',
        'facility_accessible_toilets': 'Toilets accessible to disabled people',
        'facility_induction_loops': 'Induction loops',
        'facility_adjustable_furniture': 'Adjustable furniture',
        'facility_individual_study_space': 'Individual study spaces available',
        'facility_gender_neutral_toilets': 'Gender neutral toilets',
        'facility_bike_racks': 'Bike racks',
        'facility_smoking_area': 'Designated smoking area',
        'facility_baby_changing': 'Baby changing facilities',
        'facility_prayer_room': 'Prayer room'
    },
    iconMap: {
        'food_drink': 'icon-drink',
        'daylight': 'icon-sun',
        'views': 'icon-views',
        'large_desks': 'icon-desk',
        'free_wifi': 'icon-wifi',
        'no_wifi': 'icon-no-wifi',
        'computers': 'icon-computer',
        'laptops_allowed': 'icon-laptop',
        'sockets': 'icon-power',
        'signal': 'icon-phone',
        'printers_copiers': 'icon-printer',
        'whiteboards': 'icon-whiteboard',
        'projector': 'icon-projector',
        'outdoor_seating': 'icon-bench',
        'bookable': 'icon-time-long',
        'toilets': 'icon-toilet',
        'refreshments': 'icon-coffee',
        'break': 'icon-marker',
        'wheelchair_accessible': 'icon-disabled',
        'blue_badge_parking': 'icon-disabled-parking',
        'accessible_toilets': 'icon-disabled-toilet',
        'induction_loops': 'icon-hearing-loop',
        'adjustable_furniture': 'icon-adjustable-furniture',
        'individual_study_space': 'icon-individual-space',
        'gender_neutral_toilets': 'icon-neutral-toilets',
        'bike_racks': 'icon-bike-rack',
        'smoking_area': 'icon-smoking-area',
        'baby_changing': 'icon-baby-changing',
        'prayer_room': 'icon-prayer-room'
    }
};