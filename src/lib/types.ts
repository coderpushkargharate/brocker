export type Role = "admin" | "farmer" | "investor";

export type LandStatus = "active" | "draft" | "pending" | "sold" | "rejected";

export type DocKey = "extract" | "landMap" | "ownership" | "soil" | "water" | "other";

export interface LandDocument {
  key: DocKey;
  file?: string;
  status: "verified" | "pending" | "missing";
}

export type NearbyKind = "road" | "rail" | "airport" | "market" | "city" | "highway" | "village";

export interface NearbyPlace {
  kind: NearbyKind;
  name: string;
  detail: string;
  distanceKm: number;
}

export interface Land {
  id: string;
  code: string;
  slug: string;
  title: string;
  status: LandStatus;
  verified: boolean;
  featured: boolean;
  landType: string;
  category: string;
  area: number;
  areaUnit: string;
  currentCrop: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  soilType: string;
  waterSource: string;
  waterAvailability: string;
  roadAccess: string;
  electricity: string;
  fencing: string;
  price: number;
  negotiable: boolean;
  description: string;
  highlights: string[];
  nearby: NearbyPlace[];
  images: string[];
  video?: string;
  documents: LandDocument[];
  ownerId: string;
  stats: { views: number; saves: number; shares: number; calls: number; docViews: number };
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  district: string;
  budgetMin: number;
  budgetMax: number;
  areaMin: number;
  areaMax: number;
  landType: string;
  alerts: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone: string;
  avatar?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  city?: string;
  experience?: string;
  farmingType?: string;
  farmerType?: string;
  totalLand?: string;
  bio?: string;
  verified: boolean;
  blocked?: boolean;
  saved: string[];
  /** saved business / worker ids */
  savedServices?: string[];
  preferences?: Preferences;
  profileViews: number;
  createdAt: string;
}

export type InterestStatus = "new" | "contacted" | "follow-up" | "responded" | "closed";

export interface Interest {
  id: string;
  landId: string;
  investorId: string;
  status: InterestStatus;
  message?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  kind: "interest" | "call" | "view" | "document" | "investor" | "land" | "message" | "system";
  text: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface CallLog {
  id: string;
  landId: string;
  fromUserId?: string;
  toUserId: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "in-progress" | "resolved";
  createdAt: string;
}

export interface DB {
  users: User[];
  lands: Land[];
  interests: Interest[];
  notifications: Notification[];
  calls: CallLog[];
  enquiries: Enquiry[];
  views: { landId: string; at: string }[];
  serviceCategories: ServiceCategory[];
  businesses: Business[];
  workers: Worker[];
  serviceLeads: ServiceLead[];
  serviceReviews: ServiceReview[];
  serviceSettings: ServiceSettings[];
  counters: { landCode: number; servicesSeeded?: boolean };
}

export type PublicUser = Omit<User, "passwordHash">;

// ---------- Business Services & Labour ----------

export type ServiceKind = "business" | "labour";
export type ProfileStatus = "pending" | "active" | "rejected";

export interface ServiceCategory {
  id: string; // slug, used in URLs
  kind: ServiceKind;
  name: string;
  short: string;
  description: string;
  image: string;
  icon: string; // key of SERVICE_ICONS
  subcategories: string[];
  order: number;
  active: boolean;
}

export interface RatingInfo {
  rating: number;
  reviewCount: number;
  /** counts for 5, 4, 3, 2, 1 stars */
  ratingDist: number[];
}

export interface BizService {
  name: string;
  image?: string;
}

export interface Business extends RatingInfo {
  id: string;
  slug: string;
  status: ProfileStatus;
  verified: boolean;
  premium: boolean;
  plan: "free" | "premium";
  categoryId: string;
  subcategory: string;
  tags: string[];
  name: string;
  businessType: string;
  gst?: string;
  since?: number;
  employees?: string;
  summary: string;
  description: string;
  contactName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address: string;
  area: string;
  taluka: string;
  district: string;
  state: string;
  pincode?: string;
  serviceArea?: string;
  delivery?: string;
  workingHours?: string;
  paymentModes?: string;
  highlights: string[];
  customers?: string;
  projects?: string;
  priceLabel?: string;
  availability?: string;
  services: BizService[];
  products: string[];
  logo?: string;
  cover?: string;
  images: string[];
  documents: string[];
  ownerId?: string;
  stats: { views: number; calls: number; whatsapp: number; leads: number };
  createdAt: string;
  updatedAt: string;
}

export interface Worker extends RatingInfo {
  id: string;
  slug: string;
  status: ProfileStatus;
  verified: boolean;
  profileType: "individual" | "group";
  name: string;
  phone: string;
  whatsapp?: string;
  photo?: string;
  cover?: string;
  categoryId: string;
  skills: string[];
  /** only for labour groups: number of workers per skill */
  skillCounts?: Record<string, number>;
  teamSize?: number;
  experience: string;
  expYears: number;
  wageMin: number;
  wageMax?: number;
  wageUnit: string;
  description: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  workRadius: string;
  availableToday: boolean;
  availability?: string;
  idProofType?: string;
  idProof?: string;
  workPhotos: string[];
  ownerId?: string;
  stats: { views: number; calls: number; whatsapp: number };
  createdAt: string;
  updatedAt: string;
}

export type LeadKind = "enquiry" | "callback" | "requirement";
export type LeadStatus = "new" | "contacted" | "closed";

export interface ServiceLead {
  id: string;
  kind: LeadKind;
  targetType?: "business" | "worker";
  targetId?: string;
  name: string;
  phone: string;
  item?: string;
  categoryId?: string;
  workersNeeded?: number;
  budget?: string;
  startDate?: string;
  village?: string;
  taluka?: string;
  district?: string;
  message?: string;
  status: LeadStatus;
  /** requirements shown to workers on the "Find Work" tab */
  published?: boolean;
  createdAt: string;
}

export interface ServiceReview {
  id: string;
  targetType: "business" | "worker";
  targetId: string;
  name: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface ServiceSettings {
  id: "main";
  statBusinesses: string;
  statCategories: string;
  statEnquiries: string;
  statRating: string;
  statWorkers: string;
  premiumPrice: number;
  helpPhone: string;
  helpHours: string;
  popularSearches: string[];
  popularLabourSearches: string[];
}
