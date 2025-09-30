import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type DividerWithIconProps = {
  iconSrc: string;
  className?: string;
  width?: string;
};

const IconCircle: React.FC<{ src: string }> = ({ src }) => (
  <div className="h-[35px] w-[35px] rounded-full border border-black flex items-center justify-center bg-white shrink-0">
    <Image
      src={src}
      alt="Icon"
      width={24}
      height={24}
      className="object-contain"
    />
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
      <IconCircle src={iconSrc} />
      <Separator className="flex-1 border-[var(--color-divider)] border-b-2" />
    </div>
  </div>
);
