import LinkIcon from "@mui/icons-material/Link";

export const LinkIconWrapper: React.FC = () => (
  <div className="relative w-[18px] h-[18px]">
    <LinkIcon
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        fontSize: "1rem",
        transform: "rotate(-45deg)",
        transformOrigin: "center center"
      }}
    />
  </div>
);
