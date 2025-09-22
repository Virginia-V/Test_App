export default function BottomMenu() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10, // higher than krpano
        background: "rgba(0,0,0,0.5)",
        color: "#fff",
        padding: "16px",
        textAlign: "center"
      }}
    >
      {/* Your menu content here */}
      My Custom Bottom Menu
    </div>
  );
}
