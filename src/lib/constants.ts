import { Condition, FuelType, Transmission } from "@prisma/client";

export type ExtendedVehicleType = 
  | "CAR" 
  | "VAN" 
  | "SUV" 
  | "MOTORCYCLE" 
  | "THREE_WHEELER" 
  | "BUS" 
  | "LORRY" 
  | "TRACTOR" 
  | "HEAVY_DUTY" 
  | "PICKUP" 
  | "OTHER";

export const VEHICLE_TYPES: { value: ExtendedVehicleType; label: string }[] = [
  { value: "CAR", label: "Car" },
  { value: "VAN", label: "Van" },
  { value: "SUV", label: "SUV / Jeep" },
  { value: "MOTORCYCLE", label: "Motorcycle" },
  { value: "THREE_WHEELER", label: "Three Wheeler" },
  { value: "BUS", label: "Bus" },
  { value: "LORRY", label: "Lorry" },
  { value: "PICKUP", label: "Pickups" },
  { value: "TRACTOR", label: "Tractor" },
  { value: "HEAVY_DUTY", label: "Heavy Duty" },
  { value: "OTHER", label: "Other" },
];

export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: "BRAND_NEW", label: "Brand New" },
  { value: "USED", label: "Used" },
  { value: "RECONDITIONED", label: "Reconditioned" },
];

export const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: "PETROL", label: "Petrol" },
  { value: "DIESEL", label: "Diesel" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ELECTRIC", label: "Electric" },
  { value: "CNG", label: "CNG" },
  { value: "OTHER", label: "Other" },
];

export const TRANSMISSIONS: { value: Transmission; label: string }[] = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "TIPTRONIC", label: "Tiptronic" },
  { value: "CVT", label: "CVT" },
];