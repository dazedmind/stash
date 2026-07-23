"use client";

import {
  BsBagCheck,
  BsCreditCard,
  BsHouseDoor,
  BsLightningCharge,
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
    default:
      return <BsWallet2 className={className} />;
  }
}
