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
          src="/LOGO.png"
          alt="Info icon"
          width={36}
          height={36}
          className="object-contain"
        />
      </div>
    </div>
  );
};
