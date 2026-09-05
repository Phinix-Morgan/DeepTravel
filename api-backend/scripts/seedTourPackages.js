require("dotenv").config();

const mongoose = require("mongoose");

const Destination = require("../models/Destination");
const TourPackage = require("../models/TourPackage");

const packageTemplates = {
  Kashmir: [
    {
      title: "Kashmir Valley Escape",
      description:
        "A scenic journey through Srinagar, Gulmarg, Pahalgam, and the peaceful valleys of Kashmir.",
      duration: {
        days: 6,
        nights: 5,
      },
      pricePerPerson: 28999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 12,
      },
      accommodation: {
        included: true,
        name: "Handpicked Hotels & Houseboat",
        description:
          "Comfortable stays in well-located hotels with one traditional Dal Lake houseboat experience.",
      },
      meals: {
        breakfast: true,
        lunch: false,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private air-conditioned vehicle with an experienced local driver.",
      },
      activities: {
        included: true,
        description:
          "Shikara ride, local sightseeing, mountain excursions, and guided valley experiences.",
      },
      itinerary: [
        {
          day: 1,
          title: "Arrive in Srinagar",
          description:
            "Settle into Srinagar and spend a relaxed evening around Dal Lake.",
          places: ["Srinagar", "Dal Lake"],
          activities: ["Airport transfer", "Shikara ride"],
        },
        {
          day: 2,
          title: "Srinagar & Mughal Gardens",
          description:
            "Explore Srinagar's historic gardens, lakeside landscapes, and local culture.",
          places: [
            "Srinagar",
            "Nishat Garden",
            "Shalimar Garden",
          ],
          activities: ["Sightseeing", "Local exploration"],
        },
        {
          day: 3,
          title: "Gulmarg",
          description:
            "Head into the mountains for a full day among Gulmarg's alpine landscapes.",
          places: ["Gulmarg"],
          activities: [
            "Mountain sightseeing",
            "Gondola experience",
          ],
        },
        {
          day: 4,
          title: "Pahalgam",
          description:
            "Travel through Kashmir's countryside toward the forests and valleys of Pahalgam.",
          places: ["Pahalgam", "Betaab Valley"],
          activities: ["Valley sightseeing", "Nature walk"],
        },
        {
          day: 5,
          title: "Sonamarg",
          description:
            "Discover the dramatic landscapes of Sonamarg before returning to Srinagar.",
          places: ["Sonamarg"],
          activities: ["Mountain excursion", "Photography"],
        },
        {
          day: 6,
          title: "Departure",
          description:
            "Enjoy a final morning in Srinagar before your departure.",
          places: ["Srinagar"],
          activities: ["Breakfast", "Airport transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "Daily breakfast",
        "Selected dinners",
        "Private transportation",
        "Shikara ride",
        "Sightseeing as mentioned in itinerary",
      ],
      exclusions: [
        "Flights",
        "Personal expenses",
        "Travel insurance",
        "Activities not mentioned in the itinerary",
      ],
    },

    {
      title: "Kashmir Slow Escape",
      description:
        "A slower Kashmir experience focused on lakes, mountain villages, local culture, and unhurried days.",
      duration: {
        days: 8,
        nights: 7,
      },
      pricePerPerson: 36999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 10,
      },
      accommodation: {
        included: true,
        name: "Boutique Hotels & Heritage Houseboat",
        description:
          "A curated mix of boutique stays and a heritage houseboat on Dal Lake.",
      },
      meals: {
        breakfast: true,
        lunch: false,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private vehicle throughout the journey.",
      },
      activities: {
        included: true,
        description:
          "Shikara cruise, village walks, mountain excursions, and cultural experiences.",
      },
      itinerary: [
        {
          day: 1,
          title: "Srinagar Arrival",
          description:
            "Begin your Kashmir journey beside the calm waters of Dal Lake.",
          places: ["Srinagar", "Dal Lake"],
          activities: ["Check-in", "Shikara cruise"],
        },
        {
          day: 2,
          title: "Old Srinagar",
          description:
            "Walk through the historic heart of Srinagar and discover its architecture and markets.",
          places: ["Old Srinagar", "Srinagar"],
          activities: ["Walking tour", "Market exploration"],
        },
        {
          day: 3,
          title: "Gulmarg",
          description:
            "Spend a relaxed day surrounded by Gulmarg's high mountain landscapes.",
          places: ["Gulmarg"],
          activities: ["Mountain sightseeing", "Leisure"],
        },
        {
          day: 4,
          title: "Pahalgam",
          description:
            "Journey through pine forests and rivers toward Pahalgam.",
          places: ["Pahalgam"],
          activities: ["Nature walk", "Valley exploration"],
        },
        {
          day: 5,
          title: "Pahalgam Slow Day",
          description:
            "Keep the day intentionally open for exploring Pahalgam at your own pace.",
          places: ["Pahalgam"],
          activities: ["Leisure", "Photography"],
        },
        {
          day: 6,
          title: "Sonamarg",
          description:
            "Explore the alpine landscapes and open valleys of Sonamarg.",
          places: ["Sonamarg"],
          activities: ["Mountain excursion", "Nature walk"],
        },
        {
          day: 7,
          title: "Return to Srinagar",
          description:
            "Return to Srinagar for one final evening beside Dal Lake.",
          places: ["Srinagar"],
          activities: ["Leisure", "Shikara ride"],
        },
        {
          day: 8,
          title: "Departure",
          description:
            "Enjoy breakfast before your journey home.",
          places: ["Srinagar"],
          activities: ["Breakfast", "Airport transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "Daily breakfast",
        "Selected dinners",
        "Private transportation",
        "Shikara cruise",
        "Guided sightseeing",
      ],
      exclusions: [
        "Flights",
        "Lunches",
        "Personal expenses",
        "Travel insurance",
        "Optional activities",
      ],
    },
  ],

  Ladakh: [
    {
      title: "Ladakh High Road",
      description:
        "A high-altitude adventure through Leh, Nubra Valley, Pangong Lake, and the dramatic landscapes of Ladakh.",
      duration: {
        days: 7,
        nights: 6,
      },
      pricePerPerson: 34999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 12,
      },
      accommodation: {
        included: true,
        name: "Mountain Hotels & Camps",
        description:
          "Comfortable mountain hotels in Leh and curated camps during the valley stays.",
      },
      meals: {
        breakfast: true,
        lunch: true,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private SUV with experienced high-altitude driver.",
      },
      activities: {
        included: true,
        description:
          "Monastery visits, mountain drives, lake exploration, and guided sightseeing.",
      },
      itinerary: [
        {
          day: 1,
          title: "Arrive in Leh",
          description:
            "Arrive in Leh and spend the day resting and acclimatizing.",
          places: ["Leh"],
          activities: ["Airport transfer", "Acclimatization"],
        },
        {
          day: 2,
          title: "Leh Exploration",
          description:
            "Explore Leh's historic streets, palace, and surrounding monasteries.",
          places: ["Leh", "Leh Palace", "Thiksey"],
          activities: ["Sightseeing", "Monastery visit"],
        },
        {
          day: 3,
          title: "Leh to Nubra",
          description:
            "Cross the dramatic Khardung La route toward the desert landscapes of Nubra.",
          places: ["Khardung La", "Nubra Valley"],
          activities: ["Mountain drive", "Valley exploration"],
        },
        {
          day: 4,
          title: "Nubra Valley",
          description:
            "Discover the villages, monasteries, and unusual landscapes of Nubra.",
          places: ["Diskit", "Hunder", "Nubra Valley"],
          activities: ["Monastery visit", "Village exploration"],
        },
        {
          day: 5,
          title: "Nubra to Pangong",
          description:
            "Continue toward the extraordinary blue waters of Pangong Lake.",
          places: ["Nubra Valley", "Pangong Lake"],
          activities: ["Scenic drive", "Lake exploration"],
        },
        {
          day: 6,
          title: "Pangong to Leh",
          description:
            "Enjoy a final morning beside Pangong before returning to Leh.",
          places: ["Pangong Lake", "Leh"],
          activities: ["Photography", "Scenic drive"],
        },
        {
          day: 7,
          title: "Departure",
          description:
            "Transfer to Leh airport for your journey home.",
          places: ["Leh"],
          activities: ["Airport transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "All meals",
        "Private SUV",
        "Driver",
        "Sightseeing",
        "Inner-line permits",
      ],
      exclusions: [
        "Flights",
        "Travel insurance",
        "Personal expenses",
        "Emergency evacuation",
      ],
    },

    {
      title: "Ladakh Beyond the Horizon",
      description:
        "An immersive Ladakh journey combining remote valleys, ancient monasteries, high mountain passes, and unforgettable roads.",
      duration: {
        days: 10,
        nights: 9,
      },
      pricePerPerson: 49999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 8,
      },
      accommodation: {
        included: true,
        name: "Boutique Mountain Stays & Camps",
        description:
          "Carefully selected stays designed around comfort, location, and the character of each region.",
      },
      meals: {
        breakfast: true,
        lunch: true,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private 4x4 vehicle throughout the expedition.",
      },
      activities: {
        included: true,
        description:
          "Monastery visits, village walks, scenic drives, photography, and high-altitude exploration.",
      },
      itinerary: [
        {
          day: 1,
          title: "Leh Arrival",
          description:
            "Arrive in Leh and begin acclimatizing to the altitude.",
          places: ["Leh"],
          activities: ["Acclimatization", "Rest"],
        },
        {
          day: 2,
          title: "Leh & Monasteries",
          description:
            "Explore Leh and several of the region's most atmospheric monasteries.",
          places: ["Leh", "Thiksey", "Shey"],
          activities: ["Monastery visit", "Sightseeing"],
        },
        {
          day: 3,
          title: "Sham Valley",
          description:
            "Follow the Indus through the villages and landscapes of Sham Valley.",
          places: ["Sham Valley", "Alchi"],
          activities: ["Village exploration", "Monastery visit"],
        },
        {
          day: 4,
          title: "Nubra Valley",
          description:
            "Cross into Nubra through one of Ladakh's legendary high mountain passes.",
          places: ["Khardung La", "Nubra Valley"],
          activities: ["Mountain drive", "Photography"],
        },
        {
          day: 5,
          title: "Nubra Villages",
          description:
            "Spend a deeper day exploring Nubra's villages and monasteries.",
          places: ["Diskit", "Hunder"],
          activities: ["Village walk", "Monastery visit"],
        },
        {
          day: 6,
          title: "Pangong Lake",
          description:
            "Drive toward Pangong through spectacular high-altitude terrain.",
          places: ["Pangong Lake"],
          activities: ["Scenic drive", "Lake exploration"],
        },
        {
          day: 7,
          title: "Pangong Sunrise",
          description:
            "Experience the changing colors of Pangong before continuing the journey.",
          places: ["Pangong Lake"],
          activities: ["Sunrise photography", "Leisure"],
        },
        {
          day: 8,
          title: "Return to Leh",
          description:
            "Return to Leh while taking in the landscapes along the route.",
          places: ["Pangong Lake", "Leh"],
          activities: ["Scenic drive"],
        },
        {
          day: 9,
          title: "Leh Slow Day",
          description:
            "A flexible day for cafés, markets, photography, or simply enjoying the mountains.",
          places: ["Leh"],
          activities: ["Leisure", "Local exploration"],
        },
        {
          day: 10,
          title: "Departure",
          description:
            "Transfer to the airport and depart Ladakh.",
          places: ["Leh"],
          activities: ["Airport transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "All meals",
        "Private 4x4 vehicle",
        "Experienced driver",
        "Permits",
        "Guided sightseeing",
      ],
      exclusions: [
        "Flights",
        "Travel insurance",
        "Personal expenses",
        "Medical or evacuation expenses",
      ],
    },
  ],

  Kerala: [
    {
      title: "Kerala Backwater Escape",
      description:
        "A relaxed journey through Kerala's backwaters, tea country, forests, and tropical coastline.",
      duration: {
        days: 6,
        nights: 5,
      },
      pricePerPerson: 25999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 12,
      },
      accommodation: {
        included: true,
        name: "Boutique Hotels & Houseboat",
        description:
          "Comfortable boutique stays with a private overnight houseboat experience.",
      },
      meals: {
        breakfast: true,
        lunch: false,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private air-conditioned vehicle for transfers and sightseeing.",
      },
      activities: {
        included: true,
        description:
          "Houseboat cruise, tea estate visit, waterfall excursion, and local sightseeing.",
      },
      itinerary: [
        {
          day: 1,
          title: "Arrive in Kochi",
          description:
            "Begin your Kerala journey in historic Kochi.",
          places: ["Kochi", "Fort Kochi"],
          activities: ["Walking tour", "Local exploration"],
        },
        {
          day: 2,
          title: "Kochi to Munnar",
          description:
            "Travel inland through lush landscapes toward the tea-covered hills of Munnar.",
          places: ["Kochi", "Munnar"],
          activities: ["Scenic drive", "Tea estate visit"],
        },
        {
          day: 3,
          title: "Munnar Hills",
          description:
            "Explore Munnar's tea plantations, viewpoints, and mountain landscapes.",
          places: ["Munnar"],
          activities: ["Tea plantation visit", "Nature walk"],
        },
        {
          day: 4,
          title: "Munnar to Alleppey",
          description:
            "Descend toward Kerala's famous backwaters.",
          places: ["Munnar", "Alleppey"],
          activities: ["Scenic drive", "Houseboat check-in"],
        },
        {
          day: 5,
          title: "Backwater Cruise",
          description:
            "Slow down aboard a traditional Kerala houseboat.",
          places: ["Alleppey Backwaters"],
          activities: ["Houseboat cruise", "Village viewing"],
        },
        {
          day: 6,
          title: "Departure",
          description:
            "Transfer onward after breakfast.",
          places: ["Alleppey"],
          activities: ["Breakfast", "Transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "Daily breakfast",
        "Selected dinners",
        "Private transportation",
        "Houseboat cruise",
        "Sightseeing",
      ],
      exclusions: [
        "Flights",
        "Lunches",
        "Personal expenses",
        "Travel insurance",
      ],
    },

    {
      title: "Kerala Wild & Slow",
      description:
        "A deeper Kerala journey through forests, tea plantations, wildlife country, and peaceful backwaters.",
      duration: {
        days: 8,
        nights: 7,
      },
      pricePerPerson: 32999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 10,
      },
      accommodation: {
        included: true,
        name: "Nature Resorts & Boutique Stays",
        description:
          "Comfortable stays surrounded by tea estates, forests, and backwater landscapes.",
      },
      meals: {
        breakfast: true,
        lunch: true,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private air-conditioned vehicle throughout the journey.",
      },
      activities: {
        included: true,
        description:
          "Wildlife experience, plantation walks, nature trails, and backwater cruising.",
      },
      itinerary: [
        {
          day: 1,
          title: "Kochi Arrival",
          description:
            "Begin with a relaxed exploration of historic Kochi.",
          places: ["Kochi", "Fort Kochi"],
          activities: ["Walking tour", "Local exploration"],
        },
        {
          day: 2,
          title: "Kochi to Munnar",
          description:
            "Travel into Kerala's highlands and tea country.",
          places: ["Kochi", "Munnar"],
          activities: ["Scenic drive", "Tea estate visit"],
        },
        {
          day: 3,
          title: "Munnar",
          description:
            "Explore tea plantations, mountain viewpoints, and quiet trails.",
          places: ["Munnar"],
          activities: ["Nature walk", "Tea tasting"],
        },
        {
          day: 4,
          title: "Munnar to Thekkady",
          description:
            "Continue toward the forests of Thekkady.",
          places: ["Thekkady", "Periyar"],
          activities: ["Scenic drive", "Forest exploration"],
        },
        {
          day: 5,
          title: "Periyar",
          description:
            "Spend a day discovering the landscapes around Periyar.",
          places: ["Periyar Wildlife Sanctuary"],
          activities: ["Wildlife experience", "Nature walk"],
        },
        {
          day: 6,
          title: "Thekkady to Alleppey",
          description:
            "Return toward the lowlands and Kerala's famous waterways.",
          places: ["Thekkady", "Alleppey"],
          activities: ["Scenic drive", "Houseboat check-in"],
        },
        {
          day: 7,
          title: "Backwaters",
          description:
            "Spend a full day moving slowly through Kerala's backwater villages.",
          places: ["Alleppey Backwaters"],
          activities: ["Houseboat cruise", "Village exploration"],
        },
        {
          day: 8,
          title: "Departure",
          description:
            "Enjoy breakfast before your onward journey.",
          places: ["Alleppey"],
          activities: ["Breakfast", "Transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "All meals",
        "Private transportation",
        "Nature experiences",
        "Houseboat cruise",
        "Sightseeing",
      ],
      exclusions: [
        "Flights",
        "Travel insurance",
        "Personal expenses",
        "Optional activities",
      ],
    },
  ],

  Goa: [
    {
      title: "Goa Beyond the Beaches",
      description:
        "Discover Goa through quiet beaches, heritage streets, tropical landscapes, and local culture.",
      duration: {
        days: 5,
        nights: 4,
      },
      pricePerPerson: 19999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 14,
      },
      accommodation: {
        included: true,
        name: "Boutique Coastal Hotel",
        description:
          "A relaxed boutique stay with easy access to Goa's quieter coastal areas.",
      },
      meals: {
        breakfast: true,
        lunch: false,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private vehicle for sightseeing and transfers.",
      },
      activities: {
        included: true,
        description:
          "Heritage walk, beach exploration, waterfall excursion, and local food experiences.",
      },
      itinerary: [
        {
          day: 1,
          title: "Arrive in Goa",
          description:
            "Settle in and ease into Goa's slower rhythm.",
          places: ["Goa"],
          activities: ["Check-in", "Beach sunset"],
        },
        {
          day: 2,
          title: "Old Goa",
          description:
            "Explore Goa's historic Portuguese-era architecture and old streets.",
          places: ["Old Goa", "Panaji"],
          activities: ["Heritage walk", "Local exploration"],
        },
        {
          day: 3,
          title: "North Goa",
          description:
            "Discover a mix of beaches, villages, and coastal roads.",
          places: ["North Goa"],
          activities: ["Beach hopping", "Scenic drive"],
        },
        {
          day: 4,
          title: "South Goa",
          description:
            "Experience quieter beaches and the relaxed side of Goa.",
          places: ["South Goa", "Palolem"],
          activities: ["Beach day", "Sunset"],
        },
        {
          day: 5,
          title: "Departure",
          description:
            "Enjoy a final breakfast before departure.",
          places: ["Goa"],
          activities: ["Breakfast", "Airport transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "Daily breakfast",
        "Selected dinners",
        "Private transportation",
        "Heritage walk",
        "Sightseeing",
      ],
      exclusions: [
        "Flights",
        "Lunches",
        "Personal expenses",
        "Water sports",
        "Travel insurance",
      ],
    },

    {
      title: "Goa Coastal Slow Travel",
      description:
        "A relaxed coastal journey designed around quiet beaches, local food, heritage, and unhurried evenings.",
      duration: {
        days: 7,
        nights: 6,
      },
      pricePerPerson: 28999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 10,
      },
      accommodation: {
        included: true,
        name: "Boutique Beachside Stays",
        description:
          "Small, characterful stays selected for atmosphere and proximity to quieter beaches.",
      },
      meals: {
        breakfast: true,
        lunch: false,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private vehicle with flexible local transfers.",
      },
      activities: {
        included: true,
        description:
          "Beach walks, heritage exploration, local food experiences, and scenic coastal drives.",
      },
      itinerary: [
        {
          day: 1,
          title: "Arrival",
          description:
            "Arrive and settle into your coastal stay.",
          places: ["Goa"],
          activities: ["Check-in", "Sunset walk"],
        },
        {
          day: 2,
          title: "Panaji & Fontainhas",
          description:
            "Explore colorful heritage streets and the cultural side of Goa.",
          places: ["Panaji", "Fontainhas"],
          activities: ["Heritage walk", "Food exploration"],
        },
        {
          day: 3,
          title: "Quiet North",
          description:
            "Follow quieter coastal roads through northern Goa.",
          places: ["North Goa"],
          activities: ["Coastal drive", "Beach walk"],
        },
        {
          day: 4,
          title: "Dudhsagar",
          description:
            "Journey inland toward Goa's famous waterfall country.",
          places: ["Dudhsagar Falls"],
          activities: ["Nature excursion", "Photography"],
        },
        {
          day: 5,
          title: "South Goa",
          description:
            "Spend a slower day around the beaches of South Goa.",
          places: ["Palolem", "South Goa"],
          activities: ["Beach day", "Sunset"],
        },
        {
          day: 6,
          title: "Free Coastal Day",
          description:
            "A flexible day for swimming, cafés, beaches, or simply doing nothing.",
          places: ["Goa"],
          activities: ["Leisure", "Beach exploration"],
        },
        {
          day: 7,
          title: "Departure",
          description:
            "Breakfast and departure.",
          places: ["Goa"],
          activities: ["Breakfast", "Airport transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "Daily breakfast",
        "Selected dinners",
        "Private transportation",
        "Guided heritage walk",
        "Nature excursion",
      ],
      exclusions: [
        "Flights",
        "Lunches",
        "Personal expenses",
        "Travel insurance",
        "Optional activities",
      ],
    },
  ],

  "Himachal Pradesh": [
    {
      title: "Himachal Mountain Escape",
      description:
        "A scenic Himalayan journey through Manali, mountain valleys, forests, and quiet villages.",
      duration: {
        days: 6,
        nights: 5,
      },
      pricePerPerson: 23999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 12,
      },
      accommodation: {
        included: true,
        name: "Mountain View Hotels",
        description:
          "Comfortable stays selected for mountain views and convenient access to local areas.",
      },
      meals: {
        breakfast: true,
        lunch: false,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private vehicle for all transfers and sightseeing.",
      },
      activities: {
        included: true,
        description:
          "Mountain sightseeing, village walks, nature trails, and local exploration.",
      },
      itinerary: [
        {
          day: 1,
          title: "Arrive in Manali",
          description:
            "Arrive in Manali and settle among the surrounding mountains.",
          places: ["Manali"],
          activities: ["Check-in", "Local walk"],
        },
        {
          day: 2,
          title: "Old Manali",
          description:
            "Explore Old Manali, nearby forests, cafés, and mountain trails.",
          places: ["Old Manali", "Manali"],
          activities: ["Walking tour", "Forest walk"],
        },
        {
          day: 3,
          title: "Solang Valley",
          description:
            "Head into the mountains for panoramic views and outdoor experiences.",
          places: ["Solang Valley"],
          activities: ["Mountain sightseeing", "Outdoor activities"],
        },
        {
          day: 4,
          title: "Kasol",
          description:
            "Travel through the Parvati Valley toward the riverside village of Kasol.",
          places: ["Kasol", "Parvati Valley"],
          activities: ["Scenic drive", "Village exploration"],
        },
        {
          day: 5,
          title: "Mountain Villages",
          description:
            "Spend a slower day exploring the landscapes and villages around the valley.",
          places: ["Parvati Valley"],
          activities: ["Nature walk", "Photography"],
        },
        {
          day: 6,
          title: "Departure",
          description:
            "Transfer onward after breakfast.",
          places: ["Manali"],
          activities: ["Breakfast", "Transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "Daily breakfast",
        "Selected dinners",
        "Private transportation",
        "Sightseeing",
        "Nature walks",
      ],
      exclusions: [
        "Flights",
        "Lunches",
        "Personal expenses",
        "Adventure activities",
        "Travel insurance",
      ],
    },

    {
      title: "Spiti Valley Expedition",
      description:
        "A dramatic Himalayan road journey through remote valleys, monasteries, villages, and high-altitude landscapes.",
      duration: {
        days: 9,
        nights: 8,
      },
      pricePerPerson: 41999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 8,
      },
      accommodation: {
        included: true,
        name: "Mountain Guesthouses & Camps",
        description:
          "Simple, comfortable stays chosen for authentic experiences in remote mountain communities.",
      },
      meals: {
        breakfast: true,
        lunch: true,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private 4x4 vehicle with an experienced mountain driver.",
      },
      activities: {
        included: true,
        description:
          "Mountain drives, monastery visits, village walks, photography, and high-altitude exploration.",
      },
      itinerary: [
        {
          day: 1,
          title: "Manali Arrival",
          description:
            "Arrive in Manali and prepare for the mountain expedition.",
          places: ["Manali"],
          activities: ["Acclimatization", "Briefing"],
        },
        {
          day: 2,
          title: "Manali to Kaza",
          description:
            "Begin the dramatic journey toward the remote Spiti Valley.",
          places: ["Manali", "Kaza"],
          activities: ["Mountain drive", "Scenic stops"],
        },
        {
          day: 3,
          title: "Kaza",
          description:
            "Explore the high-altitude heart of Spiti.",
          places: ["Kaza", "Key Monastery"],
          activities: ["Monastery visit", "Local exploration"],
        },
        {
          day: 4,
          title: "Langza & Hikkim",
          description:
            "Discover some of Spiti's iconic high-altitude villages.",
          places: ["Langza", "Hikkim", "Komic"],
          activities: ["Village walk", "Photography"],
        },
        {
          day: 5,
          title: "Dhankar",
          description:
            "Travel through dramatic landscapes toward the ancient Dhankar region.",
          places: ["Dhankar"],
          activities: ["Monastery visit", "Mountain sightseeing"],
        },
        {
          day: 6,
          title: "Tabo",
          description:
            "Explore the historic village and monastery of Tabo.",
          places: ["Tabo"],
          activities: ["Monastery visit", "Village exploration"],
        },
        {
          day: 7,
          title: "Pin Valley",
          description:
            "Enter the rugged landscapes of Pin Valley.",
          places: ["Pin Valley"],
          activities: ["Nature walk", "Photography"],
        },
        {
          day: 8,
          title: "Return Journey",
          description:
            "Begin the return journey through the Himalayan landscape.",
          places: ["Spiti Valley", "Manali"],
          activities: ["Mountain drive", "Scenic stops"],
        },
        {
          day: 9,
          title: "Departure",
          description:
            "Complete the expedition and depart.",
          places: ["Manali"],
          activities: ["Breakfast", "Transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "All meals",
        "Private 4x4 vehicle",
        "Mountain driver",
        "Permits where required",
        "Guided sightseeing",
      ],
      exclusions: [
        "Flights",
        "Travel insurance",
        "Personal expenses",
        "Emergency evacuation",
      ],
    },
  ],

  Meghalaya: [
    {
      title: "Meghalaya Mist & Waterfalls",
      description:
        "A journey through Meghalaya's misty hills, waterfalls, living root bridges, and rainforests.",
      duration: {
        days: 6,
        nights: 5,
      },
      pricePerPerson: 24999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 10,
      },
      accommodation: {
        included: true,
        name: "Boutique Hill Stays",
        description:
          "Comfortable stays in Shillong and Cherrapunji selected for easy access to nature.",
      },
      meals: {
        breakfast: true,
        lunch: false,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private vehicle with local driver.",
      },
      activities: {
        included: true,
        description:
          "Waterfall visits, forest walks, root bridge exploration, and village experiences.",
      },
      itinerary: [
        {
          day: 1,
          title: "Arrive in Shillong",
          description:
            "Arrive in Shillong and explore the city's surrounding hills.",
          places: ["Shillong"],
          activities: ["Check-in", "Local exploration"],
        },
        {
          day: 2,
          title: "Shillong",
          description:
            "Discover Shillong's viewpoints, markets, and surrounding landscapes.",
          places: ["Shillong"],
          activities: ["City walk", "Local exploration"],
        },
        {
          day: 3,
          title: "Cherrapunji",
          description:
            "Travel into the misty landscapes of Cherrapunji.",
          places: ["Cherrapunji"],
          activities: ["Waterfall sightseeing", "Scenic drive"],
        },
        {
          day: 4,
          title: "Living Root Bridges",
          description:
            "Walk through rainforest landscapes toward Meghalaya's living root bridges.",
          places: ["Nongriat"],
          activities: ["Forest trek", "Root bridge exploration"],
        },
        {
          day: 5,
          title: "Dawki",
          description:
            "Travel toward the crystal-clear waters and border landscapes around Dawki.",
          places: ["Dawki"],
          activities: ["River sightseeing", "Photography"],
        },
        {
          day: 6,
          title: "Departure",
          description:
            "Return toward Shillong and continue your onward journey.",
          places: ["Shillong"],
          activities: ["Breakfast", "Transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "Daily breakfast",
        "Selected dinners",
        "Private transportation",
        "Nature walks",
        "Sightseeing",
      ],
      exclusions: [
        "Flights",
        "Lunches",
        "Personal expenses",
        "Trek equipment",
        "Travel insurance",
      ],
    },

    {
      title: "Meghalaya Wild Trails",
      description:
        "A deeper exploration of Meghalaya's forests, remote villages, waterfalls, caves, and living landscapes.",
      duration: {
        days: 8,
        nights: 7,
      },
      pricePerPerson: 32999,
      groupLimit: {
        hasLimit: true,
        maxGroupSize: 8,
      },
      accommodation: {
        included: true,
        name: "Eco Stays & Mountain Lodges",
        description:
          "Nature-focused stays selected for atmosphere and access to remote landscapes.",
      },
      meals: {
        breakfast: true,
        lunch: true,
        dinner: true,
      },
      transportation: {
        included: true,
        description:
          "Private vehicle with experienced local driver.",
      },
      activities: {
        included: true,
        description:
          "Forest trekking, cave exploration, waterfall visits, village walks, and river experiences.",
      },
      itinerary: [
        {
          day: 1,
          title: "Shillong Arrival",
          description:
            "Arrive in Shillong and settle into the surrounding hills.",
          places: ["Shillong"],
          activities: ["Check-in", "Local walk"],
        },
        {
          day: 2,
          title: "Shillong & Mawlynnong",
          description:
            "Explore the countryside and villages around Shillong.",
          places: ["Shillong", "Mawlynnong"],
          activities: ["Village walk", "Nature exploration"],
        },
        {
          day: 3,
          title: "Dawki",
          description:
            "Follow the hills toward the clear waters of the Umngot River.",
          places: ["Dawki"],
          activities: ["River experience", "Photography"],
        },
        {
          day: 4,
          title: "Cherrapunji",
          description:
            "Enter the rain-soaked landscapes of Cherrapunji.",
          places: ["Cherrapunji"],
          activities: ["Waterfall exploration", "Scenic drive"],
        },
        {
          day: 5,
          title: "Nongriat",
          description:
            "Trek through dense rainforest toward the famous living root bridges.",
          places: ["Nongriat"],
          activities: ["Forest trek", "Root bridge exploration"],
        },
        {
          day: 6,
          title: "Caves & Waterfalls",
          description:
            "Discover Meghalaya's underground and above-ground landscapes.",
          places: ["Cherrapunji"],
          activities: ["Cave exploration", "Waterfall visit"],
        },
        {
          day: 7,
          title: "Slow Hills",
          description:
            "Enjoy a flexible day among Meghalaya's quiet villages and forests.",
          places: ["Meghalaya"],
          activities: ["Village walk", "Leisure"],
        },
        {
          day: 8,
          title: "Departure",
          description:
            "Return toward Shillong for your onward journey.",
          places: ["Shillong"],
          activities: ["Breakfast", "Transfer"],
        },
      ],
      inclusions: [
        "Accommodation",
        "All meals",
        "Private transportation",
        "Local guides",
        "Nature experiences",
        "Selected trekking experiences",
      ],
      exclusions: [
        "Flights",
        "Travel insurance",
        "Personal expenses",
        "Specialist trekking equipment",
      ],
    },
  ],
};


function createImageUrl(destination) {
  return destination.imageUrl;
}


async function seedTourPackages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const destinationNames =
      Object.keys(packageTemplates);

    const destinations =
      await Destination.find({
        name: {
          $in: destinationNames,
        },
      }).lean();

    const destinationMap = new Map(
      destinations.map((destination) => [
        destination.name,
        destination,
      ])
    );

    const missingDestinations =
      destinationNames.filter(
        (name) => !destinationMap.has(name)
      );

    if (missingDestinations.length > 0) {
      throw new Error(
        `Missing destinations: ${missingDestinations.join(
          ", "
        )}`
      );
    }

    /*
     * Remove previously seeded packages.
     *
     * This makes the script safe to rerun while
     * developing without creating duplicates.
     */
    await TourPackage.deleteMany({
      destination: {
        $in: destinations.map(
          (destination) => destination._id
        ),
      },
    });

    const packages = [];

    for (const [
      destinationName,
      packageList,
    ] of Object.entries(packageTemplates)) {
      const destination =
        destinationMap.get(destinationName);

      for (const packageData of packageList) {
        packages.push({
          destination: destination._id,

          title: packageData.title,

          description:
            packageData.description,

          imageUrl:
            createImageUrl(destination),

          duration:
            packageData.duration,

          pricePerPerson:
            packageData.pricePerPerson,

          groupLimit:
            packageData.groupLimit,

          accommodation:
            packageData.accommodation,

          meals:
            packageData.meals,

          transportation:
            packageData.transportation,

          activities:
            packageData.activities,

          itinerary:
            packageData.itinerary,

          inclusions:
            packageData.inclusions,

          exclusions:
            packageData.exclusions,

          status: "active",
        });
      }
    }

    const createdPackages =
      await TourPackage.insertMany(packages);

    console.log(
      `Seeded ${createdPackages.length} tour packages.`
    );

    for (const tourPackage of createdPackages) {
      const destination =
        destinationMap.get(
          destinationNames.find((name) =>
            packageTemplates[name].some(
              (pkg) =>
                pkg.title === tourPackage.title
            )
          )
        );

      console.log(
        `✓ ${tourPackage.title} → ${
          destination?.name || "Unknown"
        }`
      );
    }

    await mongoose.disconnect();

    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error(
      "Tour package seeding failed:",
      error
    );

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
}


seedTourPackages();