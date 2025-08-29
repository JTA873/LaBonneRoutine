// Version SANS FIREBASE - 100% statique
// Utilise localStorage pour la persistance

export const APP_CONFIG = {
    siteName: "La Bonne Routine",
    siteDescription: "Coaching sportif personnalisé à Toulouse",
    mode: "static", // Mode statique sans backend
    useLocalStorage: true
};

// Données de démonstration (remplace Firestore)
export const DEMO_DATA = {
    slots: [
        {
            id: "slot1",
            title: "Coaching Personnel",
            date: "2025-09-01",
            time: "09:00",
            location: "Parc des Sports",
            capacity: 1,
            booked: 0,
            price: 50
        },
        {
            id: "slot2", 
            title: "Cours de Groupe",
            date: "2025-09-01",
            time: "18:00",
            location: "Gymnase Toulouse",
            capacity: 8,
            booked: 3,
            price: 25
        }
    ],
    events: [
        {
            id: "event1",
            title: "Course Solidaire",
            date: "2025-09-15",
            description: "Course caritative de 5km",
            location: "Centre-ville Toulouse",
            participants: []
        }
    ],
    reviews: [
        {
            id: "review1",
            author: "Marie L.",
            rating: 5,
            comment: "Excellente coach ! Très professionnelle.",
            date: "2025-08-15",
            approved: true
        },
        {
            id: "review2",
            author: "Thomas M.",
            rating: 5, 
            comment: "Super séances, je recommande vivement !",
            date: "2025-08-10",
            approved: true
        }
    ]
};

// Admin simple (pour mode démo)
export const ADMIN_CREDENTIALS = {
    email: "admin@demo.com",
    password: "demo123"
};
