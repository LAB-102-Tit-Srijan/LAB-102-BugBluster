import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";

const demoSeedProperties = [
  {
    title: "Urban Nest PG",
    type: "PG",
    city: "Indore",
    area: "Vijay Nagar",
    location: "Vijay Nagar, Indore",
    rent: 8200,
    securityDeposit: 12000,
    amenities: ["WiFi", "Food", "Laundry", "Power Backup"],
    gender: "Any",
    targetAudience: "Student",
    availableFrom: "2026-05-15",
    description: "Student-focused PG near coaching hubs with meals included.",
    shortTermFriendly: true,
    residentType: ["UPSC aspirant", "Engineering students"],
    ownerName: "HabiWise Demo Host",
    ownerPhone: "+91 99999 10001",
    occupancy: "Double",
    roomTypes: [
      { type: "Single", price: 9800, bedCount: 1 },
      { type: "Double", price: 8200, bedCount: 2 },
    ],
    nearby: [
      { name: "Bhanwar Kuan", distance: "2.2 km", icon: "N" },
      { name: "C21 Mall", distance: "1.4 km", icon: "N" },
    ],
    commuteHours: "Saves 22 hrs/month",
  },
  {
    title: "Vijay Residency Hostel",
    type: "Hostel",
    city: "Indore",
    area: "Vijay Nagar",
    location: "Scheme 54, Vijay Nagar, Indore",
    rent: 5600,
    securityDeposit: 7000,
    amenities: ["WiFi", "Parking", "Laundry"],
    gender: "Male",
    targetAudience: "Student",
    availableFrom: "2026-05-20",
    description: "Affordable hostel with secure entry and daily housekeeping.",
    shortTermFriendly: false,
    residentType: ["Commerce students", "Interns"],
    ownerName: "HabiWise Demo Host",
    ownerPhone: "+91 99999 10002",
    occupancy: "Triple",
    roomTypes: [
      { type: "Double", price: 6400, bedCount: 2 },
      { type: "Triple", price: 5600, bedCount: 3 },
    ],
    nearby: [
      { name: "Radisson Square", distance: "1.6 km", icon: "N" },
      { name: "Bus Stand", distance: "0.9 km", icon: "N" },
    ],
    commuteHours: "Saves 16 hrs/month",
  },
  {
    title: "Koregaon Studio Flat",
    type: "Flat",
    city: "Pune",
    area: "Koregaon Park",
    location: "Lane 6, Koregaon Park, Pune",
    rent: 15000,
    securityDeposit: 30000,
    amenities: ["WiFi", "AC", "Gym", "Power Backup"],
    gender: "Any",
    targetAudience: "Professional",
    availableFrom: "2026-05-18",
    description: "Compact furnished studio for professionals near offices and cafes.",
    shortTermFriendly: true,
    residentType: ["Hybrid professionals", "WFH"],
    ownerName: "HabiWise Demo Host",
    ownerPhone: "+91 99999 10003",
    occupancy: "Single",
    roomTypes: [{ type: "Studio", price: 15000, bedCount: 1 }],
    nearby: [
      { name: "Osho Garden", distance: "1.0 km", icon: "N" },
      { name: "EON Shuttle", distance: "2.8 km", icon: "N" },
    ],
    commuteHours: "Saves 30 hrs/month",
  },
  {
    title: "Parkside Co-living",
    type: "Co-living",
    city: "Pune",
    area: "Koregaon Park",
    location: "North Main Road, Koregaon Park, Pune",
    rent: 11200,
    securityDeposit: 18000,
    amenities: ["WiFi", "Food", "Gym", "Laundry", "Parking"],
    gender: "Female",
    targetAudience: "Both",
    availableFrom: "2026-05-22",
    description: "Community stay with curated events, meals, and work-friendly zones.",
    shortTermFriendly: true,
    residentType: ["CAT aspirant", "Design professionals"],
    ownerName: "HabiWise Demo Host",
    ownerPhone: "+91 99999 10004",
    occupancy: "Double",
    roomTypes: [
      { type: "Single", price: 12900, bedCount: 1 },
      { type: "Double", price: 11200, bedCount: 2 },
    ],
    nearby: [
      { name: "Bund Garden", distance: "1.2 km", icon: "N" },
      { name: "Phoenix Mall", distance: "2.5 km", icon: "N" },
    ],
    commuteHours: "Saves 26 hrs/month",
  },
  {
    title: "Koramangala Tech PG",
    type: "PG",
    city: "Bengaluru",
    area: "Koramangala",
    location: "5th Block, Koramangala, Bengaluru",
    rent: 9800,
    securityDeposit: 15000,
    amenities: ["WiFi", "Food", "Power Backup", "Laundry"],
    gender: "Any",
    targetAudience: "Both",
    availableFrom: "2026-05-25",
    description: "Balanced stay for students and young professionals near startup hubs.",
    shortTermFriendly: false,
    residentType: ["CSE student", "Software engineers"],
    ownerName: "HabiWise Demo Host",
    ownerPhone: "+91 99999 10005",
    occupancy: "Double",
    roomTypes: [
      { type: "Single", price: 11800, bedCount: 1 },
      { type: "Double", price: 9800, bedCount: 2 },
    ],
    nearby: [
      { name: "Forum Mall", distance: "1.1 km", icon: "N" },
      { name: "Silk Board", distance: "3.4 km", icon: "N" },
    ],
    commuteHours: "Saves 28 hrs/month",
  },
  {
    title: "Garden View Flatshare",
    type: "Flat",
    city: "Bengaluru",
    area: "Koramangala",
    location: "ST Bed Layout, Koramangala, Bengaluru",
    rent: 13700,
    securityDeposit: 25000,
    amenities: ["WiFi", "AC", "Parking", "Gym"],
    gender: "Male",
    targetAudience: "Professional",
    availableFrom: "2026-05-28",
    description: "Premium flatshare with curated flatmates and secure gated access.",
    shortTermFriendly: true,
    residentType: ["Office", "Hybrid professionals"],
    ownerName: "HabiWise Demo Host",
    ownerPhone: "+91 99999 10006",
    occupancy: "Single",
    roomTypes: [
      { type: "Private Room", price: 13700, bedCount: 1 },
      { type: "Twin Sharing", price: 9900, bedCount: 2 },
    ],
    nearby: [
      { name: "Sony Signal", distance: "1.6 km", icon: "N" },
      { name: "Metro Station", distance: "2.3 km", icon: "N" },
    ],
    commuteHours: "Saves 32 hrs/month",
  },
];

export const seedPropertiesIfEmpty = async () => {
  if (!isFirebaseConfigured || !db) {
    return;
  }

  const propertiesRef = collection(db, "properties");
  const existing = await getDocs(query(propertiesRef, limit(1)));

  if (!existing.empty) {
    return;
  }

  const batch = writeBatch(db);

  demoSeedProperties.forEach((property) => {
    const docRef = doc(propertiesRef);
    batch.set(docRef, {
      ...property,
      safetyScore: 8.5,
      scamRisk: "Low",
      rating: 4.0,
      verified: false,
      zeroDepositAvailable: false,
      halfDepositAvailable: false,
      createdAt: serverTimestamp(),
      ownerId: "seed-admin",
    });
  });

  await batch.commit();
};
