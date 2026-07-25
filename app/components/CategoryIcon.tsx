"use client";

import {
  BsAirplane,
  BsBagCheck,
  BsBriefcase,
  BsCarFront,
  BsCart3,
  BsController,
  BsCreditCard,
  BsCupHot,
  BsFilm,
  BsGift,
  BsGraphUpArrow,
  BsHeart,
  BsHouseDoor,
  BsKey,
  BsLaptop,
  BsLightningCharge,
  BsMortarboard,
  BsPhone,
  BsPiggyBank,
  BsReceipt,
  BsShieldCheck,
  BsWallet2,
} from "react-icons/bs";

export const CATEGORY_ICON_OPTIONS = [
  { id: "piggy", label: "Piggy Bank", icon: BsPiggyBank },
  { id: "lightning", label: "Lightning", icon: BsLightningCharge },
  { id: "receipt", label: "Receipt", icon: BsReceipt },
  { id: "wallet", label: "Wallet", icon: BsWallet2 },
  { id: "card", label: "Card", icon: BsCreditCard },
  { id: "house", label: "House", icon: BsHouseDoor },
  { id: "bag", label: "Shopping", icon: BsBagCheck },
  { id: "shield", label: "Shield", icon: BsShieldCheck },
  { id: "car", label: "Vehicle", icon: BsCarFront },
  { id: "gift", label: "Gift", icon: BsGift },
  { id: "heart", label: "Health", icon: BsHeart },
  { id: "laptop", label: "Tech", icon: BsLaptop },
  { id: "phone", label: "Phone", icon: BsPhone },
  { id: "plane", label: "Travel", icon: BsAirplane },
  { id: "game", label: "Gaming", icon: BsController },
  { id: "work", label: "Work", icon: BsBriefcase },
  { id: "school", label: "Education", icon: BsMortarboard },
  { id: "movie", label: "Entertainment", icon: BsFilm },
  { id: "invest", label: "Investment", icon: BsGraphUpArrow },
  { id: "coffee", label: "Coffee", icon: BsCupHot },
  { id: "cart", label: "Groceries", icon: BsCart3 },
  { id: "rent", label: "Rent & Keys", icon: BsKey },
];

export function CategoryIcon({ iconName, className = "h-4 w-4" }: { iconName?: string; className?: string }) {
  switch (iconName) {
    case "piggy":
      return <BsPiggyBank className={className} />;
    case "lightning":
      return <BsLightningCharge className={className} />;
    case "receipt":
      return <BsReceipt className={className} />;
    case "house":
      return <BsHouseDoor className={className} />;
    case "card":
      return <BsCreditCard className={className} />;
    case "bag":
      return <BsBagCheck className={className} />;
    case "shield":
      return <BsShieldCheck className={className} />;
    case "car":
      return <BsCarFront className={className} />;
    case "gift":
      return <BsGift className={className} />;
    case "heart":
      return <BsHeart className={className} />;
    case "laptop":
      return <BsLaptop className={className} />;
    case "phone":
      return <BsPhone className={className} />;
    case "plane":
      return <BsAirplane className={className} />;
    case "game":
      return <BsController className={className} />;
    case "work":
      return <BsBriefcase className={className} />;
    case "school":
      return <BsMortarboard className={className} />;
    case "movie":
      return <BsFilm className={className} />;
    case "invest":
      return <BsGraphUpArrow className={className} />;
    case "coffee":
      return <BsCupHot className={className} />;
    case "cart":
      return <BsCart3 className={className} />;
    case "rent":
      return <BsKey className={className} />;
    default:
      return <BsWallet2 className={className} />;
  }
}
