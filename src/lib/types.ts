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
  counters: { landCode: number };
}

export type PublicUser = Omit<User, "passwordHash">;
