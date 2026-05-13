import { toast } from "react-hot-toast";

const baseStyle = {
  background: "rgba(20, 20, 22, 0.72)",
  backdropFilter: "blur(12px)",
  color: "#fff",
  padding: "16px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)"
};

const iconStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  borderRadius: "999px",
  fontWeight: 700,
  flexShrink: 0
};

export const showMusicError = (message) => {
  toast.dismiss();
  toast.custom(
    () => (
      <div
        style={{
          ...baseStyle,
          border: "1px solid rgba(255, 93, 93, 0.5)"
        }}
      >
        <span
          style={{
            ...iconStyle,
            background: "rgba(255, 93, 93, 0.2)",
            color: "#ff8b8b"
          }}
        >
          !
        </span>
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
    ),
    { duration: 3500 }
  );
};

export const showMusicSuccess = (message) => {
  toast.dismiss();
  toast.custom(
    () => (
      <div
        style={{
          ...baseStyle,
          border: "1px solid rgba(57, 240, 208, 0.35)"
        }}
      >
        <span
          style={{
            ...iconStyle,
            background: "rgba(57, 240, 208, 0.18)",
            color: "#39f0d0"
          }}
        >
          OK
        </span>
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
    ),
    { duration: 3000 }
  );
};
