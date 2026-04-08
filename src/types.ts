export interface Farmer {
  farmer_id: number;
  name: string;
  phone: string;
  location: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Manager {
  id: number;
  username: string;
  phone: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
}
