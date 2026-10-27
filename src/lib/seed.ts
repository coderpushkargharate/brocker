import bcrypt from "bcryptjs";
import type { DB, Land, LandDocument, NearbyPlace, User } from "./types";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./config";
import { slugify } from "./format";
import { DEFAULT_SERVICE_SETTINGS, SERVICE_CATEGORIES, seedBusinesses, seedServiceReviews, seedWorkers } from "./services-seed";

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const img = (n: string) => `/images/${n}.jpg`;

const allDocs = (status: LandDocument["status"] = "verified"): LandDocument[] => [
  { key: "extract", status, file: status === "verified" ? "sample" : undefined },
  { key: "landMap", status, file: status === "verified" ? "sample" : undefined },
  { key: "ownership", status, file: status === "verified" ? "sample" : undefined },
  { key: "soil", status, file: status === "verified" ? "sample" : undefined },
  { key: "water", status: "missing" },
  { key: "other", status: "missing" },
];

const nearbyFor = (taluka: string, road: string, roadKm: number, railKm: number, airKm: number, mktKm: number): NearbyPlace[] => [
  { kind: "road", name: "Main Road", detail: road, distanceKm: roadKm },
  { kind: "rail", name: "Railway Station", detail: `${taluka} Railway Station`, distanceKm: railKm },
  { kind: "airport", name: "Airport", detail: "Pune International Airport", distanceKm: airKm },
  { kind: "market", name: "Agricultural Market", detail: `${taluka} Krishi Utpanna Bazar`, distanceKm: mktKm },
];

function user(p: Partial<User> & Pick<User, "id" | "name" | "email" | "role">, password: string): User {
  return {
    phone: "",
    verified: true,
    saved: [],
    profileViews: 0,
    createdAt: ago(24 * 120),
    ...p,
    passwordHash: bcrypt.hashSync(password, 10),
  };
}

type LandSeed = Partial<Land> &
  Pick<Land, "id" | "title" | "village" | "taluka" | "district" | "area" | "price" | "currentCrop" | "images" | "ownerId" | "category">;

function land(p: LandSeed, code: number): Land {
  return {
    code: `AGL-${code}`,
    slug: `${slugify(p.title)}-${slugify(p.taluka)}`,
    status: "active",
    verified: true,
    featured: false,
    landType: "Agriculture Land",
    areaUnit: "Acres",
    state: "Maharashtra",
    lat: 18.8,
    lng: 74.3,
    soilType: "Black Soil",
    waterSource: "Well",
    waterAvailability: "Year-round",
    roadAccess: "Paved Road",
    electricity: "Available",
    fencing: "Partially Fenced",
    negotiable: true,
    description: `Fertile agricultural land in ${p.village}, ${p.taluka} with good water availability, road connectivity and suitable conditions for farming. Ideal for ${p.currentCrop.toLowerCase()}, vegetables and other crops.\n\nClear title with verified 7/12 extract. Suitable for long-term farming or investment.`,
    highlights: ["Fertile Soil", "Good Water Availability", "Road Connectivity", "Electricity Available"],
    nearby: nearbyFor(p.taluka, "Pune - Nagar Highway", 2.5, 12, 45, 4.2),
    documents: allDocs(),
    stats: { views: 120 + code % 400, saves: 10 + (code % 30), shares: code % 9, calls: code % 6, docViews: code % 20 },
    createdAt: ago(24 * (code % 40) + 30),
    updatedAt: ago(24 * (code % 10)),
    ...p,
  } as Land;
}

/** Fake but stable view history for the last 60 days so dashboards show trends. */
function seedViews(lands: Land[]) {
  const out: { landId: string; at: string }[] = [];
  let r = 7;
  const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (const l of lands) {
    if (l.status !== "active") continue;
    const recent = Math.min(140, Math.round(l.stats.views / 10));
    const older = Math.round(recent * 0.82);
    for (let i = 0; i < recent; i++) out.push({ landId: l.id, at: ago(rand() * 24 * 29) });
    for (let i = 0; i < older; i++) out.push({ landId: l.id, at: ago(24 * 30 + rand() * 24 * 29) });
  }
  return out;
}

export function buildSeed(): DB {
  const users: User[] = [
    user(
      {
        id: "u-admin",
        name: "Pushkar Gharate",
        email: ADMIN_EMAIL,
        role: "admin",
        phone: "+91 90000 00000",
        district: "Pune",
        state: "Maharashtra",
      },
      ADMIN_PASSWORD,
    ),
    user(
      {
        id: "u-rajesh",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@email.com",
        role: "farmer",
        phone: "+91 98765 43210",
        avatar: "/images/avatar-rajesh.jpg",
        village: "Shirur",
        taluka: "Haveli",
        district: "Pune",
        state: "Maharashtra",
        experience: "15+ Years",
        farmingType: "Crop Farming",
        farmerType: "Generational Farmer",
        totalLand: "150+ Acres",
        bio: "A proud generational farmer carrying forward the family's agricultural legacy. With farming knowledge and traditions passed down through generations, the farmer continues to cultivate the land while embracing modern agricultural practices.",
        profileViews: 245,
      },
      "farmer123",
    ),
    user({ id: "u-shivraj", name: "Shivraj Jadhav", email: "shivraj.jadhav@email.com", role: "farmer", phone: "+91 98220 11223", avatar: "/images/avatar-shivraj-jadhav.jpg", village: "Mulshi", taluka: "Mulshi", district: "Pune", state: "Maharashtra", experience: "20+ Years", farmingType: "Vegetable Farming", farmerType: "Generational Farmer", totalLand: "40 Acres" }, "farmer123"),
    user({ id: "u-rahulp", name: "Rahul Patil", email: "rahul.patil@email.com", role: "farmer", phone: "+91 98221 44556", avatar: "/images/avatar-rahul-patil.jpg", village: "Baramati", taluka: "Baramati", district: "Pune", state: "Maharashtra", experience: "12 Years", farmingType: "Sugarcane Farming", farmerType: "Progressive Farmer", totalLand: "25 Acres" }, "farmer123"),
    user({ id: "u-suresh", name: "Suresh Patil", email: "suresh.patil@email.com", role: "farmer", phone: "+91 98223 77889", avatar: "/images/avatar-suresh-patil.jpg", village: "Shirur", taluka: "Shirur", district: "Pune", state: "Maharashtra", experience: "18 Years", farmingType: "Crop Farming", farmerType: "Generational Farmer", totalLand: "30 Acres" }, "farmer123"),
    user({ id: "u-amits", name: "Amit Sharma", email: "amit.sharma@email.com", role: "farmer", phone: "+91 98224 99001", avatar: "/images/avatar-amit-sharma.jpg", village: "Daund", taluka: "Daund", district: "Pune", state: "Maharashtra", experience: "25 Years", farmingType: "Mixed Farming", farmerType: "Generational Farmer", totalLand: "60 Acres" }, "farmer123"),
    user(
      {
        id: "u-nilesh",
        name: "Nilesh Kude",
        email: "nilesh.kude@email.com",
        role: "investor",
        phone: "+91 99876 54321",
        avatar: "/images/avatar-nilesh.jpg",
        city: "Pune",
        district: "Pune",
        state: "Maharashtra",
        saved: ["l-gv", "l-sunrise", "l-shivraj"],
        preferences: { district: "Pune", budgetMin: 1_000_000, budgetMax: 3_000_000, areaMin: 2, areaMax: 10, landType: "Agriculture Land", alerts: true },
      },
      "investor123",
    ),
    user({ id: "u-rahuls", name: "Rahul Sharma", email: "rahul.sharma@email.com", role: "investor", phone: "+91 99100 22334", avatar: "/images/avatar-rahul-sharma.jpg", city: "Mumbai", district: "Mumbai", state: "Maharashtra", preferences: { district: "Pune", budgetMin: 2_000_000, budgetMax: 3_000_000, areaMin: 2, areaMax: 10, landType: "Agriculture Land", alerts: true } }, "investor123"),
    user({ id: "u-sarah", name: "Sarah Jain", email: "sarah.jain@email.com", role: "investor", phone: "+91 99100 55667", avatar: "/images/avatar-sarah-jain.jpg", city: "Pune", district: "Pune", state: "Maharashtra", preferences: { district: "Pune", budgetMin: 1_500_000, budgetMax: 2_500_000, areaMin: 2, areaMax: 10, landType: "Agriculture Land", alerts: true } }, "investor123"),
    user({ id: "u-amitv", name: "Amit Verma", email: "amit.verma@email.com", role: "investor", phone: "+91 99100 88990", avatar: "/images/avatar-amit-verma.jpg", city: "Nagpur", district: "Nagpur", state: "Maharashtra", preferences: { district: "Pune", budgetMin: 2_500_000, budgetMax: 4_000_000, areaMin: 2, areaMax: 10, landType: "Agriculture Land", alerts: true } }, "investor123"),
    user({ id: "u-pooja", name: "Pooja Rathi", email: "pooja.rathi@email.com", role: "investor", phone: "+91 99100 12121", avatar: "/images/avatar-pooja-rathi.jpg", city: "Pune", district: "Pune", state: "Maharashtra", preferences: { district: "Pune", budgetMin: 2_500_000, budgetMax: 3_500_000, areaMin: 2, areaMax: 10, landType: "Agriculture Land", alerts: true } }, "investor123"),
  ];

  const lands: Land[] = [
    land(
      {
        id: "l-gv",
        title: "Green Valley Agricultural Land",
        village: "Shirur",
        taluka: "Shirur",
        district: "Pune",
        area: 5,
        price: 2_500_000,
        currentCrop: "Sugarcane",
        category: "crop-land",
        featured: true,
        waterSource: "Well (2)",
        lat: 18.8268,
        lng: 74.3742,
        ownerId: "u-rajesh",
        images: [img("land-green-valley"), img("land-valley-wide"), img("land-harvest"), img("land-corn"), img("land-pump"), img("land-harvest-2")],
        description:
          "Fertile agricultural land with good water availability, road connectivity and suitable conditions for farming. The land is ideal for sugarcane, vegetables, fruits and other crops.\n\nThe land has been in our family for many years and maintained with care. Very suitable for long-term farming or investment.",
        highlights: ["Fertile Soil", "Good Water Availability", "Road Connectivity", "Electricity Available", "Suitable for Multiple Crops"],
        nearby: [
          { kind: "road", name: "Main Road", detail: "Pune - Nagar Highway", distanceKm: 2.5 },
          { kind: "rail", name: "Railway Station", detail: "Shirur Railway Station", distanceKm: 12 },
          { kind: "airport", name: "Airport", detail: "Pune International Airport", distanceKm: 12 },
          { kind: "market", name: "Agricultural Market", detail: "Shirur Krishi Utpanna Bazar", distanceKm: 4.2 },
        ],
        stats: { views: 1245, saves: 84, shares: 7, calls: 5, docViews: 18 },
        createdAt: ago(24 * 9),
      },
      9932,
    ),
    land(
      {
        id: "l-shivraj",
        title: "Shivraj Farm Land",
        village: "Haveli",
        taluka: "Haveli",
        district: "Pune",
        area: 3.5,
        price: 1_800_000,
        currentCrop: "Banana",
        category: "organic-land",
        featured: true,
        waterSource: "Borewell",
        lat: 18.5204,
        lng: 73.9567,
        ownerId: "u-rajesh",
        images: [img("land-shivraj"), img("land-farm-1"), img("land-farm-2"), img("land-farm-3"), img("land-farm-4")],
        stats: { views: 640, saves: 31, shares: 4, calls: 2, docViews: 9 },
        createdAt: ago(24 * 11),
      },
      9933,
    ),
    land(
      {
        id: "l-riverside-draft",
        title: "Riverside Farm Land",
        village: "Mulshi",
        taluka: "Mulshi",
        district: "Pune",
        area: 2,
        price: 1_250_000,
        currentCrop: "Vegetables",
        category: "irrigated-land",
        status: "draft",
        verified: false,
        ownerId: "u-rajesh",
        images: [img("land-riverside")],
        documents: [
          { key: "extract", status: "pending", file: "sample" },
          { key: "landMap", status: "missing" },
          { key: "ownership", status: "missing" },
          { key: "soil", status: "missing" },
          { key: "water", status: "missing" },
          { key: "other", status: "missing" },
        ],
        description: "",
        stats: { views: 0, saves: 0, shares: 0, calls: 0, docViews: 0 },
        createdAt: ago(24 * 20),
        updatedAt: ago(24 * 5),
      },
      9934,
    ),
    land({ id: "l-mulshi", title: "Mulshi Riverside Farmland", village: "Mulshi", taluka: "Mulshi", district: "Pune", area: 2, price: 1_250_000, currentCrop: "Vegetables", category: "irrigated-land", waterSource: "River", ownerId: "u-shivraj", images: [img("land-riverside"), img("land-farm-2"), img("land-farm-5")], lat: 18.5126, lng: 73.5161 }, 9935),
    land({ id: "l-sunrise", title: "Sunrise Farm Land", village: "Shirur", taluka: "Shirur", district: "Pune", area: 4.5, price: 2_200_000, currentCrop: "Wheat", category: "crop-land", featured: true, ownerId: "u-suresh", images: [img("land-sunrise"), img("land-harvest-2"), img("land-corn")], lat: 18.83, lng: 74.38 }, 9936),
    land({ id: "l-krishna", title: "Krishna Valley Land", village: "Daund", taluka: "Daund", district: "Pune", area: 6, price: 3_000_000, currentCrop: "Vegetables", category: "irrigated-land", waterSource: "River", featured: true, ownerId: "u-amits", images: [img("land-krishna"), img("land-gv-alt"), img("land-farm-1")], lat: 18.4638, lng: 74.5815 }, 9937),
    land({ id: "l-premium", title: "Premium Farm Land", village: "Baramati", taluka: "Baramati", district: "Pune", area: 3, price: 1_800_000, currentCrop: "Sugarcane", category: "crop-land", waterSource: "Canal", ownerId: "u-rahulp", images: [img("land-premium"), img("land-corn"), img("land-pump")], lat: 18.1515, lng: 74.5815 }, 9938),
    land({ id: "l-indapur", title: "Indapur Agricultural Land", village: "Indapur", taluka: "Indapur", district: "Pune", area: 5, price: 2_450_000, currentCrop: "Vegetables", category: "crop-land", ownerId: "u-shivraj", images: [img("land-indapur"), img("land-harvest"), img("land-farm-3")], lat: 18.1159, lng: 75.0262 }, 9939),
    land({ id: "l-maval", title: "Green Meadow Organic Farm", village: "Kamshet", taluka: "Maval", district: "Pune", area: 2.5, price: 1_600_000, currentCrop: "Vegetables", category: "organic-land", soilType: "Red Soil", ownerId: "u-rahulp", images: [img("land-harvest"), img("land-farm-2"), img("land-farm-4")], lat: 18.7637, lng: 73.5501 }, 9940),
    land({ id: "l-satara", title: "Wai Hill Orchard", village: "Wai", taluka: "Wai", district: "Satara", area: 8, price: 4_200_000, currentCrop: "Mango", category: "orchard-fruit-farm", landType: "Agriculture Land", soilType: "Red Soil", ownerId: "u-suresh", images: [img("land-gv-alt"), img("land-valley-wide"), img("land-krishna")], lat: 17.9524, lng: 73.8913, nearby: nearbyFor("Wai", "Satara - Mahabaleshwar Road", 1.5, 32, 95, 3) }, 9941),
    land({ id: "l-nashik", title: "Niphad Grape Vineyard Land", village: "Niphad", taluka: "Niphad", district: "Nashik", area: 6, price: 5_400_000, currentCrop: "Grapes", category: "irrigated-land", waterSource: "Canal", ownerId: "u-amits", images: [img("land-corn"), img("land-farm-4"), img("land-premium")], lat: 20.0805, lng: 74.1093, nearby: nearbyFor("Niphad", "Nashik - Aurangabad Highway", 3, 6, 40, 2.5) }, 9942),
    land({ id: "l-kolhapur", title: "Karveer Sugarcane Estate", village: "Karveer", taluka: "Karveer", district: "Kolhapur", area: 10, price: 6_500_000, currentCrop: "Sugarcane", category: "crop-land", waterSource: "Canal", ownerId: "u-suresh", images: [img("land-harvest-2"), img("land-harvest"), img("land-pump")], lat: 16.705, lng: 74.2433, nearby: nearbyFor("Kolhapur", "Pune - Bengaluru Highway", 4, 9, 15, 5) }, 9943),
    land({ id: "l-ahmednagar", title: "Rahuri Large Land Parcel", village: "Rahuri", taluka: "Rahuri", district: "Ahmednagar", area: 28, price: 11_200_000, currentCrop: "Soybean", category: "large-land-parcels", waterSource: "Borewell", ownerId: "u-rahulp", images: [img("land-valley-wide"), img("land-gv-alt"), img("land-indapur")], lat: 19.3906, lng: 74.6487, nearby: nearbyFor("Rahuri", "Ahmednagar - Manmad Highway", 1, 5, 120, 3.5) }, 9944),
    land({ id: "l-farmhouse", title: "Mulshi Lake View Farmhouse Land", village: "Paud", taluka: "Mulshi", district: "Pune", area: 1.5, price: 3_500_000, currentCrop: "Fallow / None", category: "farmhouse-land", landType: "Farmhouse", fencing: "Compound Wall", ownerId: "u-shivraj", images: [img("land-farm-cows"), img("land-farm-5"), img("land-farm-1")], lat: 18.5246, lng: 73.6125 }, 9945),
  ];

  const ids = ["i1", "i2", "i3", "i4", "i5", "i6", "i7"];
  return {
    users,
    lands,
    interests: [
      { id: ids[0], landId: "l-gv", investorId: "u-sarah", status: "new", message: "Is the price negotiable? I would like to visit this weekend.", createdAt: ago(2) },
      { id: ids[1], landId: "l-gv", investorId: "u-pooja", status: "contacted", createdAt: ago(2.2) },
      { id: ids[2], landId: "l-gv", investorId: "u-amitv", status: "follow-up", createdAt: ago(24) },
      { id: ids[3], landId: "l-gv", investorId: "u-rahuls", status: "new", message: "Please share the 7/12 extract details.", createdAt: ago(2.5) },
      { id: ids[4], landId: "l-shivraj", investorId: "u-nilesh", status: "new", createdAt: ago(30) },
      { id: ids[5], landId: "l-gv", investorId: "u-nilesh", status: "responded", createdAt: ago(28) },
      { id: ids[6], landId: "l-shivraj", investorId: "u-rahuls", status: "contacted", createdAt: ago(50) },
    ],
    notifications: [
      { id: "n1", userId: "u-rajesh", kind: "interest", text: "Rahul Sharma is interested in your Green Valley Agricultural Land.", link: "/dashboard/listings/l-gv", read: false, createdAt: ago(2) },
      { id: "n2", userId: "u-rajesh", kind: "call", text: "You missed a call from Amit Verma.", read: false, createdAt: ago(20) },
      { id: "n3", userId: "u-rajesh", kind: "view", text: "Your listing Shivraj Farm Land was viewed 18 times today.", link: "/dashboard/listings/l-shivraj", read: true, createdAt: ago(26) },
      { id: "n4", userId: "u-rajesh", kind: "document", text: 'Your document "7/12 Extract" has been verified.', read: true, createdAt: ago(48) },
      { id: "n5", userId: "u-rajesh", kind: "investor", text: "New investor registered in your area: Pune, Maharashtra.", read: true, createdAt: ago(72) },
      { id: "n6", userId: "u-nilesh", kind: "land", text: "New verified land matching your search is now available in Pune.", link: "/buy-land?district=Pune", read: false, createdAt: ago(2) },
      { id: "n7", userId: "u-nilesh", kind: "message", text: "Rajesh Kumar has responded to your enquiry about Green Valley Land.", link: "/lands/green-valley-agricultural-land-shirur", read: false, createdAt: ago(20) },
      { id: "n8", userId: "u-nilesh", kind: "interest", text: "Your interest in Shivraj Farm Land was received.", link: "/lands/shivraj-farm-land-haveli", read: false, createdAt: ago(26) },
      { id: "n9", userId: "u-nilesh", kind: "system", text: "A new land is available in your preferred location.", link: "/buy-land", read: false, createdAt: ago(48) },
    ],
    calls: [
      { id: "c1", landId: "l-gv", fromUserId: "u-amitv", toUserId: "u-rajesh", createdAt: ago(20) },
      { id: "c2", landId: "l-gv", fromUserId: "u-sarah", toUserId: "u-rajesh", createdAt: ago(40) },
      { id: "c3", landId: "l-shivraj", fromUserId: "u-rahuls", toUserId: "u-rajesh", createdAt: ago(60) },
      { id: "c4", landId: "l-gv", fromUserId: "u-nilesh", toUserId: "u-rajesh", createdAt: ago(70) },
    ],
    enquiries: [
      { id: "e1", name: "Vikas More", email: "vikas.more@email.com", phone: "+91 98111 22233", subject: "Borewell Setup", message: "I need borewell installation for my 3 acre land in Daund.", status: "new", createdAt: ago(5) },
    ],
    views: seedViews(lands),
    serviceCategories: structuredClone(SERVICE_CATEGORIES),
    businesses: seedBusinesses(),
    workers: seedWorkers(),
    serviceLeads: [],
    serviceReviews: seedServiceReviews(),
    serviceSettings: [{ ...DEFAULT_SERVICE_SETTINGS }],
    counters: { landCode: 9945, servicesSeeded: true },
  };
}
