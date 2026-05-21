import "./ButtonSpinner.css";

/**
 * A small spinning circle to replace button text during loading.
 * @param {{ color?: string, size?: number }} props
 */
function ButtonSpinner({ color = "currentColor", size = 22 }) {
  return (
    <span
      className="btn-spinner"
      style={{ width: size, height: size, borderTopColor: color }}
      role="status"
      aria-label="Carregando"
    />
  );
}

export default ButtonSpinner;
