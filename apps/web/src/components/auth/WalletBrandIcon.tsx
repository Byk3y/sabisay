import Image from "next/image";
import { cn } from "@/lib/utils";

interface WalletBrandIconProps {
  name: "metamask" | "phantom" | "walletconnect" | "coinbase";
  className?: string;
}

export function WalletBrandIcon({ name, className }: WalletBrandIconProps) {
  // Handle different file naming conventions for each wallet
  let filename: string = name;
  let extension: string = "svg";
  
  if (name === "phantom") {
    extension = "png";
  } else if (name === "metamask") {
    filename = "metamask-icon";
  } else if (name === "coinbase") {
    filename = "cbw";
  } else if (name === "walletconnect") {
    extension = "png";
  }
  
  return (
    <Image
      src={`/wallet-icons/${filename}.${extension}`}
      alt={`${name} wallet`}
      width={32}
      height={32}
      className={cn("w-8 h-8 rounded-lg", className)}
    />
  );
}
