export type Role = "BUYER" | "COOK";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "COOKING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface User {
  id: string;
  phone: string;
  name: string;
  role: Role;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  cookProfile?: CookProfile | null;
  isVerified?: boolean;
  isFounder?: boolean;
  verificationStatus?: VerificationStatus;
}

export interface Dish {
  id: string;
  cookProfileId: string;
  title: string;
  description?: string | null;
  price: number;
  photoUrl?: string | null;
  photos?: string[];
  videoUrl?: string | null;
  category: string;
  portions: number;
  prepTimeMin: number;
  tags: string[];
  ingredients?: string | null;
  allergens?: string[];
  isAvailable: boolean;
  /** Когда повар готовит эту партию. null — готовит по заказу. ISO-строка. */
  cookAt?: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  buyer?: { name: string };
}

export interface CookProfile {
  id: string;
  userId: string;
  kitchenName: string;
  bio?: string | null;
  cuisine: string[];
  rating: number;
  ratingsCount: number;
  isOnline: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryFee: number;
  minOrder: number;
  city?: string | null;
  dineInEnabled?: boolean;
  dineInPrice?: number;
  dineInSeats?: number;
  dineInDesc?: string | null;
  hygieneAccepted?: boolean;
  kitchenPhotos?: string[];
  foodSafetySignedAt?: string | null;
  activationPaidAt?: string | null;
  lat?: number | null;
  lng?: number | null;
  user?: { name?: string; city?: string | null; isVerified?: boolean; lat?: number | null; lng?: number | null };
  dishes?: Dish[];
  reviews?: Review[];
}

export interface OrderItem {
  id: string;
  dishId: string;
  titleSnapshot: string;
  priceAtOrder: number;
  qty: number;
}

export interface Order {
  id: string;
  buyerId: string;
  cookProfileId: string;
  status: OrderStatus;
  fulfillment: "DELIVERY" | "PICKUP" | "DINE_IN";
  address?: string | null;
  deliveryFee: number;
  total: number;
  note?: string | null;
  createdAt: string;
  items: OrderItem[];
  review?: Review | null;
  buyer?: { name: string; phone: string };
  cookProfile?: { id?: string; kitchenName: string };
}

export type GatheringStatus = "OPEN" | "FULL" | "PAST" | "CANCELLED";

export interface Gathering {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  city?: string | null;
  address?: string | null; // только для хоста и подтверждённых гостей
  lat?: number | null;
  lng?: number | null;
  startsAt: string;
  maxSeats: number;
  pricePerGuest: number;
  status: GatheringStatus;
  seatsTaken: number;
  seatsLeft: number;
  isHost: boolean;
  myGuests: number;
  host?: { id: string; name: string };
  attendees: { name: string; guests: number }[];
  createdAt: string;
}
