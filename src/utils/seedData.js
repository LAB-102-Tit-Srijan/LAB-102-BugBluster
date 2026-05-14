import {
  collection,
  getDocs,
  query,
  limit,
  writeBatch,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";

// Properties data (8 listings)
const propertiesData = [
  {
    name: "Sunrise PG",
    type: "PG",
    city: "Indore",
    area: "Vijay Nagar",
    rent: 7500,
    deposit: 15000,
    gender: "Any",
    targetAudience: "student",
    amenities: ["WiFi", "Food", "Laundry"],
    safetyScore: 9.1,
    scamRisk: "Low",
    commuteScore: "Saves 42 hrs/month",
    rating: 4.5,
    ownerName: "Ramesh Sharma",
    occupancy: "Double",
    shortTermFriendly: true,
    residentType: ["CSE student", "UPSC aspirant"],
    zeroDepositAvailable: true,
    halfDepositAvailable: false,
    images: [
      "https://picsum.photos/seed/pg1/600/400",
      "https://picsum.photos/seed/pg1a/600/400",
      "https://picsum.photos/seed/pg1b/600/400",
    ],
    verified: true,
  },
  {
    name: "Green Valley Hostel",
    type: "Hostel",
    city: "Indore",
    area: "Vijay Nagar",
    rent: 5500,
    deposit: 11000,
    gender: "Male",
    targetAudience: "student",
    amenities: ["WiFi", "AC", "Parking"],
    safetyScore: 8.2,
    scamRisk: "Low",
    commuteScore: "Saves 35 hrs/month",
    rating: 4.1,
    ownerName: "Suresh Patel",
    occupancy: "Triple",
    shortTermFriendly: false,
    residentType: ["Engineering student"],
    zeroDepositAvailable: false,
    halfDepositAvailable: true,
    images: [
      "https://picsum.photos/seed/pg2/600/400",
      "https://picsum.photos/seed/pg2a/600/400",
      "https://picsum.photos/seed/pg2b/600/400",
    ],
    verified: true,
  },
  {
    name: "Koregaon Shared Flat",
    type: "Shared Flat",
    city: "Pune",
    area: "Koregaon Park",
    rent: 12000,
    deposit: 24000,
    gender: "Any",
    targetAudience: "professional",
    amenities: ["WiFi", "AC", "Gym", "Parking"],
    safetyScore: 9.3,
    scamRisk: "Low",
    commuteScore: "Saves 48 hrs/month",
    rating: 4.7,
    ownerName: "Vikram Desai",
    occupancy: "Single",
    shortTermFriendly: true,
    residentType: ["IT professional"],
    zeroDepositAvailable: true,
    halfDepositAvailable: false,
    images: [
      "https://picsum.photos/seed/pg3/600/400",
      "https://picsum.photos/seed/pg3a/600/400",
      "https://picsum.photos/seed/pg3b/600/400",
    ],
    verified: true,
  },
  {
    name: "Pune Co-living Hub",
    type: "Co-living",
    city: "Pune",
    area: "Hinjewadi",
    rent: 9500,
    deposit: 19000,
    gender: "Any",
    targetAudience: "professional",
    amenities: ["WiFi", "Food", "Laundry", "AC"],
    safetyScore: 8.8,
    scamRisk: "Low",
    commuteScore: "Saves 30 hrs/month",
    rating: 4.4,
    ownerName: "Anita Joshi",
    occupancy: "Double",
    shortTermFriendly: true,
    residentType: ["IT professional", "Remote worker"],
    zeroDepositAvailable: false,
    halfDepositAvailable: true,
    images: [
      "https://picsum.photos/seed/pg4/600/400",
      "https://picsum.photos/seed/pg4a/600/400",
      "https://picsum.photos/seed/pg4b/600/400",
    ],
    verified: true,
  },
  {
    name: "Koramangala PG",
    type: "PG",
    city: "Bengaluru",
    area: "Koramangala",
    rent: 10000,
    deposit: 20000,
    gender: "Female",
    targetAudience: "student",
    amenities: ["WiFi", "Food", "AC", "Laundry"],
    safetyScore: 9.5,
    scamRisk: "Low",
    commuteScore: "Saves 50 hrs/month",
    rating: 4.8,
    ownerName: "Priya Nair",
    occupancy: "Single",
    shortTermFriendly: false,
    residentType: ["Female student", "Working woman"],
    zeroDepositAvailable: true,
    halfDepositAvailable: false,
    images: [
      "https://picsum.photos/seed/pg5/600/400",
      "https://picsum.photos/seed/pg5a/600/400",
      "https://picsum.photos/seed/pg5b/600/400",
    ],
    verified: true,
  },
  {
    name: "HSR Layout Flat",
    type: "Shared Flat",
    city: "Bengaluru",
    area: "HSR Layout",
    rent: 14000,
    deposit: 28000,
    gender: "Male",
    targetAudience: "professional",
    amenities: ["WiFi", "AC", "Parking", "Gym"],
    safetyScore: 8.9,
    scamRisk: "Medium",
    commuteScore: "Saves 38 hrs/month",
    rating: 4.3,
    ownerName: "Karthik Reddy",
    occupancy: "Double",
    shortTermFriendly: true,
    residentType: ["IT professional"],
    zeroDepositAvailable: false,
    halfDepositAvailable: true,
    images: [
      "https://picsum.photos/seed/pg6/600/400",
      "https://picsum.photos/seed/pg6a/600/400",
      "https://picsum.photos/seed/pg6b/600/400",
    ],
    verified: true,
  },
  {
    name: "Indiranagar Co-living",
    type: "Co-living",
    city: "Bengaluru",
    area: "Indiranagar",
    rent: 18000,
    deposit: 36000,
    gender: "Any",
    targetAudience: "professional",
    amenities: ["WiFi", "AC", "Gym", "Food", "Parking"],
    safetyScore: 9.4,
    scamRisk: "Low",
    commuteScore: "Saves 45 hrs/month",
    rating: 4.9,
    ownerName: "Meera Krishnan",
    occupancy: "Single",
    shortTermFriendly: true,
    residentType: ["Startup founder", "Remote worker"],
    zeroDepositAvailable: true,
    halfDepositAvailable: false,
    images: [
      "https://picsum.photos/seed/pg7/600/400",
      "https://picsum.photos/seed/pg7a/600/400",
      "https://picsum.photos/seed/pg7b/600/400",
    ],
    verified: true,
  },
  {
    name: "BTM Layout Hostel",
    type: "Hostel",
    city: "Bengaluru",
    area: "BTM Layout",
    rent: 6000,
    deposit: 12000,
    gender: "Male",
    targetAudience: "student",
    amenities: ["WiFi", "Laundry"],
    safetyScore: 7.5,
    scamRisk: "Medium",
    commuteScore: "Saves 32 hrs/month",
    rating: 3.9,
    ownerName: "Rajesh Kumar",
    occupancy: "Triple",
    shortTermFriendly: false,
    residentType: ["Engineering student"],
    zeroDepositAvailable: false,
    halfDepositAvailable: false,
    images: [
      "https://picsum.photos/seed/pg8/600/400",
      "https://picsum.photos/seed/pg8a/600/400",
      "https://picsum.photos/seed/pg8b/600/400",
    ],
    verified: false,
  },
];

// Candidates data (4 roommates)
const candidatesData = [
  {
    userId: "demo_priya",
    name: "Priya Sharma",
    age: 21,
    college: "BITS Pilani",
    city: "Indore",
    role: "student",
    sleepSchedule: "night_owl",
    cleanliness: "very_clean",
    foodPreference: "veg",
    socialHabits: "introvert",
    budget: 8000,
    interests: ["Coding", "Reading", "UPSC"],
    flatmateDNA: "Focused Introvert",
    situation: "student",
    stayDuration: "long_term",
    avatar: "PS",
    avatarColor: "#8B5CF6",
    contactPhone: "+91 98765 43210",
    contactEmail: "priya.sharma@bits.ac.in",
    isDemo: true,
  },
  {
    userId: "demo_arjun",
    name: "Arjun Mehta",
    age: 23,
    company: "Infosys",
    city: "Pune",
    role: "professional",
    sleepSchedule: "early_bird",
    cleanliness: "moderate",
    foodPreference: "non_veg",
    socialHabits: "extrovert",
    budget: 10000,
    interests: ["Gym", "Startup", "Travel"],
    flatmateDNA: "Social Hustler",
    situation: "employee",
    stayDuration: "long_term",
    avatar: "AM",
    avatarColor: "#F5A623",
    contactPhone: "+91 87654 32109",
    contactEmail: "arjun.mehta@infosys.com",
    isDemo: true,
  },
  {
    userId: "demo_sneha",
    name: "Sneha Patel",
    age: 22,
    college: "VIT Pune",
    city: "Pune",
    role: "student",
    sleepSchedule: "flexible",
    cleanliness: "very_clean",
    foodPreference: "veg",
    socialHabits: "mixed",
    budget: 7500,
    interests: ["Music", "Coding", "Gym"],
    flatmateDNA: "Creative Builder",
    situation: "student",
    stayDuration: "short_term",
    avatar: "SP",
    avatarColor: "#10B981",
    contactPhone: "+91 76543 21098",
    contactEmail: "sneha.patel@vit.edu",
    isDemo: true,
  },
  {
    userId: "demo_rohit",
    name: "Rohit Kumar",
    age: 24,
    company: "TCS",
    city: "Indore",
    role: "professional",
    sleepSchedule: "night_owl",
    cleanliness: "relaxed",
    foodPreference: "both",
    socialHabits: "extrovert",
    budget: 9000,
    interests: ["Gaming", "Music", "Travel"],
    flatmateDNA: "Chill Explorer",
    situation: "employee",
    stayDuration: "long_term",
    avatar: "RK",
    avatarColor: "#3B82F6",
    contactPhone: "+91 65432 10987",
    contactEmail: "rohit.kumar@tcs.com",
    isDemo: true,
  },
];

const normalizeTargetAudience = (value) => {
  const normalized = String(value || "Both").trim().toLowerCase();

  if (normalized.includes("student")) {
    return "Student";
  }

  if (normalized.includes("professional")) {
    return "Professional";
  }

  return "Both";
};

const normalizePropertySeed = (property, index) => {
  const title = property.title || property.name || `Demo Property ${index + 1}`;
  const area = property.area || "Central Area";
  const city = property.city || "Indore";
  const rent = Number(property.rent || 0);
  const securityDeposit = Number(property.securityDeposit ?? property.deposit ?? 0);

  return {
    id: property.id || `demo-property-${index + 1}`,
    title,
    type: property.type || "PG",
    city,
    area,
    location: property.location || `${area}, ${city}`,
    rent,
    securityDeposit,
    amenities: property.amenities || [],
    gender: property.gender || "Any",
    targetAudience: normalizeTargetAudience(property.targetAudience),
    availableFrom: property.availableFrom || "2026-05-15",
    description: property.description || "Demo stay listed to help you start matching quickly.",
    shortTermFriendly: property.shortTermFriendly ?? false,
    residentType: property.residentType || [],
    ownerName: property.ownerName || "HabiWise Demo Host",
    ownerPhone: property.ownerPhone || "+91 99999 10001",
    occupancy: property.occupancy || "Shared",
    roomTypes:
      property.roomTypes || [
        { type: "Shared", price: rent || 0, bedCount: 2 },
      ],
    nearby: property.nearby || [],
    commuteHours: property.commuteHours || "Saves commute time",
    zeroDepositAvailable: property.zeroDepositAvailable ?? false,
    halfDepositAvailable: property.halfDepositAvailable ?? false,
    verified: property.verified ?? true,
    safetyScore: property.safetyScore ?? 8.5,
    scamRisk: property.scamRisk ?? "Low",
    rating: property.rating ?? 4.2,
    images:
      property.images || ["https://via.placeholder.com/800x500?text=HabiWise+Demo+Stay"],
    createdAt: property.createdAt || new Date().toISOString(),
    ownerId: property.ownerId || "seed-admin",
  };
};

const normalizedPropertiesData = propertiesData.map((property, index) => normalizePropertySeed(property, index));

const seedLocalDemoProperties = () => {
  try {
    const existingProperties = JSON.parse(localStorage.getItem("habiwise_demo_properties") || "[]");
    if (existingProperties.length > 0) {
      return;
    }

    localStorage.setItem("habiwise_demo_properties", JSON.stringify(normalizedPropertiesData));
  } catch {
    // Ignore localStorage failures and let the UI fall back to empty state.
  }
};

const seedLocalDemoCandidates = () => {
  try {
    const existingCandidates = JSON.parse(localStorage.getItem("habiwise_demo_candidates" || "[]"));
    if (existingCandidates.length > 0) {
      return;
    }

    localStorage.setItem("habiwise_demo_candidates", JSON.stringify(candidatesData));
  } catch {
    // Ignore localStorage failures and let the UI fall back to empty state.
  }
};

export const seedDemoData = async (dbParam) => {
  const database = dbParam || db;

  seedLocalDemoProperties();
  seedLocalDemoCandidates();

  if (!isFirebaseConfigured || !database) return;

  // Properties
  const propertiesRef = collection(database, "properties");
  const existingProps = await getDocs(query(propertiesRef, limit(1)));
  if (existingProps.empty) {
    const batch = writeBatch(database);
    normalizedPropertiesData.forEach((p) => {
      const docRef = doc(propertiesRef);
      batch.set(docRef, {
        ...p,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
    // eslint-disable-next-line no-console
    console.log("Properties seeded ✅");
  }

  // Candidates / roommate preferences
  const candRef = collection(database, "roommate_preferences");
  const existingCand = await getDocs(query(candRef, limit(1)));
  if (existingCand.empty) {
    const batch = writeBatch(database);
    candidatesData.forEach((c) => {
      const docRef = doc(candRef);
      batch.set(docRef, {
        ...c,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
    // eslint-disable-next-line no-console
    console.log("Candidates seeded ✅");
  }
};

export default seedDemoData;
