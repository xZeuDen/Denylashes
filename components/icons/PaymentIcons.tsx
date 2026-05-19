import type { SVGProps } from "react";

const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  rx: 6,
};

export const ApplePayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 40" aria-hidden="true" {...props}>
    <rect x="1.5" y="1.5" width="61" height="37" {...baseProps} />
    <text
      x="32"
      y="25"
      textAnchor="middle"
      fontSize="12"
      fill="currentColor"
      fontFamily="inherit"
    >
      Apple Pay
    </text>
  </svg>
);

export const GooglePayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 40" aria-hidden="true" {...props}>
    <rect x="1.5" y="1.5" width="61" height="37" {...baseProps} />
    <text
      x="32"
      y="25"
      textAnchor="middle"
      fontSize="12"
      fill="currentColor"
      fontFamily="inherit"
    >
      G Pay
    </text>
  </svg>
);

export const VisaIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 40" aria-hidden="true" {...props}>
    <rect x="1.5" y="1.5" width="61" height="37" {...baseProps} />
    <text
      x="32"
      y="25"
      textAnchor="middle"
      fontSize="12"
      fill="currentColor"
      fontFamily="inherit"
    >
      VISA
    </text>
  </svg>
);

export const MastercardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 64 40" aria-hidden="true" {...props}>
    <rect x="1.5" y="1.5" width="61" height="37" {...baseProps} />
    <text
      x="32"
      y="25"
      textAnchor="middle"
      fontSize="12"
      fill="currentColor"
      fontFamily="inherit"
    >
      MC
    </text>
  </svg>
);

