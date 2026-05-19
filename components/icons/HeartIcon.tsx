import type { SVGProps } from "react";

const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M12 19s-6.5-4.1-8.3-7.1c-1.2-2 .1-5 3.1-5.2 2-.2 3.2 1 4 2.2.8-1.2 2-2.4 4-2.2 3 .2 4.3 3.2 3.1 5.2C18.5 14.9 12 19 12 19z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export default HeartIcon;

