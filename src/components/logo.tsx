import { cn } from "@/lib/utils";

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16.5 3C19.5376 3 22 5.5 22 8.5C22 11.5 19.5376 14 16.5 14H7.5C4.46243 14 2 11.5 2 8.5C2 5.5 4.46243 3 7.5 3H16.5ZM16.5 5H7.5C5.567 5 4 6.567 4 8.5C4 10.433 5.567 12 7.5 12H16.5C18.433 12 20 10.433 20 8.5C20 6.567 18.433 5 16.5 5Z"
      className="text-primary"
    />
    <path
      d="M12 13C10.6716 13 9.5 14.1716 9.5 15.5V21.5L12 19L14.5 21.5V15.5C14.5 14.1716 13.3284 13 12 13Z"
      className="text-accent"
    />
  </svg>
);
