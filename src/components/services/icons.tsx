import { Building2, Droplet, HardHat, House, Package, Sprout, Tractor, Truck, Users, Wrench, type LucideIcon } from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  building: Building2,
  hardhat: HardHat,
  sprout: Sprout,
  truck: Truck,
  droplet: Droplet,
  home: House,
  users: Users,
  wrench: Wrench,
  tractor: Tractor,
  package: Package,
};

export function CatIcon({ name, className }: { name: string; className?: string }) {
  const I = SERVICE_ICONS[name] ?? Building2;
  return <I className={className} />;
}
