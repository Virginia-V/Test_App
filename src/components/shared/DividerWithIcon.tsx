import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { ReactNode } from "react";

type DividerWithIconProps = {
  iconSrc: string | ReactNode; // Accepts string (image src) or ReactNode (SVG component)
  className?: string;
  width?: string;
};

const IconCircle: React.FC<{ icon: string | ReactNode }> = ({ icon }) => (
  <div className="h-[35px] w-[35px] rounded-full border border-black flex items-center justify-center bg-white shrink-0">
    {typeof icon === "string" ? (
      <Image
        src={icon}
        alt="Icon"
        width={24}
        height={24}
        className="object-contain"
      />
    ) : (
      icon
    )}
  </div>
);

export const DividerWithIcon: React.FC<DividerWithIconProps> = ({
  iconSrc,
  className,
  width = "w-[95%]"
}) => (
  <div className={cn("w-full", className)}>
    <div className={cn("flex items-center mx-auto", width)}>
      <Separator className="flex-1 border-[var(--color-divider)] border-b-2" />
      <IconCircle icon={iconSrc} />
      <Separator className="flex-1 border-[var(--color-divider)] border-b-2" />
    </div>
  </div>
);
