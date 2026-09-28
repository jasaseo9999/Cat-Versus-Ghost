export const GameButton = ({ variant = "green", className = "", children, ...props }) => (
  <button type="button" className={`gbtn gbtn-${variant} ${className}`} {...props}>
    {children}
  </button>
);
