import Image from "next/image";

type InfoIconWrapperProps = {
  onClick?: () => void;
};

export const InfoIconWrapper = ({ onClick }: InfoIconWrapperProps) => {
  return (
    <div
      className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
      onClick={onClick}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white">
        <Image
          src="/info_icon_01.png"
          alt="Info icon"
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
    </div>
  );
};
