const spacefinder = {
    map: null,
    currentLoc: {'lat': 53.806529, 'lng': -1.555291},
    personLoc: {'lat': 53.806529, 'lng': -1.555291},
    personMarker: null,
    personWatcher: false,
    infoWindow: null,
    startZoom: 16,
    watchID: false,
    permission: false,
    mapLoaded: false,
    spacesLoaded: false,
    spacesurl: 'https://uol-library.github.io/spacefinder-ui/spaces.json',
    imageBaseURL: 'https://uol-library.github.io/spacefinder-ui/assets/photos/',
    spaces: [],
    spaceProperties: {
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
        'acility_induction_loops': 'Induction loops',
        'facility_adjustable_furniture': 'Adjustable furniture',
        'facility_individual_study_space': 'Individual study spaces available',
        'facility_gender_neutral_toilets': 'Gender neutral toilets',
        'facility_bike_racks': 'Bike racks',
        'facility_smoking_area': 'Designated smoking area',
        'facility_baby_changing': 'Baby changing facilities',
        'facility_prayer_room': 'Prayer room'
    }
};