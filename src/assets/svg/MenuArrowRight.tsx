type MenuArrowRightProps = {
  width?: number;
  height?: number;
  className?: string;
};

export const MenuArrowRight: React.FC<MenuArrowRightProps> = ({
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
      {/* Thick Arrow (first) */}
      <g transform="translate(0, 0)">
        <path
          d="M0 0H10L19 11.65L19 12.35L10 24H0L9 12.35L0 0Z"
          // fill="#F5F5F5"
          fill="#4b2a14"
        />
      </g>

      {/* Thin Arrow 1 */}
      <g transform="translate(13, 0)">
        <path
          d="M0 0H4L12 11.65L12 12.35L4 24H0L8 12.35L0 0Z" // fill="#F5F5F5"
          fill="#4b2a14"
        />
      </g>

      {/* Thin Arrow 2 */}
      <g transform="translate(19, 0)">
        <path
          d="M0 0H4L12 11.65L12 12.35L4 24H0L8 12.35L0 0Z" // fill="#F5F5F5"
          fill="#4b2a14"
        />
      </g>
    </svg>
  );
};
