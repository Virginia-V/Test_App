import Image from "next/image";

type InfoIndicatorProps = {
  showIndicator: boolean;
  onClick?: () => void;
};

export const InfoIndicator: React.FC<InfoIndicatorProps> = ({
  showIndicator,
  onClick
}) => {
  if (!showIndicator) return null;

  return (
    <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 pointer-events-auto z-20">
      <div
        className="bg-slate-700 text-white px-4 py-3 rounded-2xl flex items-center gap-2 relative border-2 border-slate-600 animate-pulse cursor-pointer hover:bg-slate-600 transition-colors"
        onClick={onClick}
      >
        {/* Left arrow with border effect */}
        <div className="absolute right-full top-1/2 -translate-y-1/2">
          <div className="w-0 h-0 border-t-6 border-b-6 border-r-6 border-transparent border-r-slate-700"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
          <span className="text-sm font-medium whitespace-nowrap">
            Open Info
          </span>
        </div>
      </div>
    </div>
  );
};

type InfoIconWrapperProps = {
  onClick?: () => void;
  showIndicator?: boolean;
};

export const InfoIconWrapper = ({
  onClick,
  showIndicator = true
}: InfoIconWrapperProps) => {
  return (
    <div className="relative">
      <div
        className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        onClick={onClick}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white relative">
          <Image
            src="/LOGO.png"
            alt="Info icon"
            width={36}
            height={36}
            className="object-contain"
          />
          <InfoIndicator showIndicator={showIndicator} onClick={onClick} />
        </div>
      </div>
    </div>
  );
};
