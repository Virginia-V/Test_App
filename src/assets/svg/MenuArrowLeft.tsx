type MenuArrowLeftProps = {
  width?: number;
  height?: number;
  className?: string;
};

export const MenuArrowLeft: React.FC<MenuArrowLeftProps> = ({
  width = 70,
  height = 24,
  className
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 70 24"
      fill="none"
      className={className}
    >
      <g transform="translate(0, 0)">
        <path
          d="M12 0H8L0 11.65L0 12.35L8 24H12L4 12.35L12 0Z"
          fill="#F5F5F5"
          // fill="#4b2a14"
        />
      </g>

      <g transform="translate(6, 0)">
        <path
          d="M12 0H8L0 11.65L0 12.35L8 24H12L4 12.35L12 0Z"
          fill="#F5F5F5"
          // fill="#4b2a14"
        />
      </g>

      <g transform="translate(12, 0)">
        <path
          d="M19 0H9L0 11.65L0 12.35L9 24H19L10 12.35L19 0Z"
          fill="#F5F5F5"
          // fill="#4b2a14"
        />
      </g>
    </svg>
  );
};
