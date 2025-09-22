type MenuContainerProps = {
  children: React.ReactNode;
  open?: boolean;
  isClosing?: boolean;
  exitDuration?: number;
  onClose?: (reason?: string) => void;
};

export const MenuContainer = ({
  children,
  open = true,
  isClosing = false,
  exitDuration = 200,
}: MenuContainerProps) => {

  return (
    <div
      className={`
        bg-white/40
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
        rounded-2xl
        backdrop-blur-md
        border border-white/30
        py-10 px-10
        flex justify-center items-center
        overflow-x-auto lg:overflow-visible
        transition-all duration-${exitDuration}
        ${
          !open && isClosing
            ? "opacity-0 translate-y-10 pointer-events-none"
            : ""
        }
      `}
    >
      {children}
    </div>
  );
};

