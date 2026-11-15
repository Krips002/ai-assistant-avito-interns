export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <rect width="1600" height="1000" fill="#f2f2f2" />
        <g stroke="#ffcc00" fill="none" strokeLinecap="round">
          <path d="M-40 70 H260" strokeWidth="14" />
          <path d="M-40 102 H210" strokeWidth="5" />
          <path d="M-40 126 H160" strokeWidth="2" />
          <path d="M90 -40 V300" strokeWidth="14" />
          <path d="M132 -40 V250" strokeWidth="5" />
          <path d="M164 -40 V190" strokeWidth="2" />
          <path d="M980 -120 A 420 420 0 0 1 1720 520" strokeWidth="54" />
          <path d="M1120 -60 A 300 300 0 0 1 1660 380" strokeWidth="10" />
          <circle cx="180" cy="860" r="190" strokeWidth="36" />
          <circle cx="180" cy="860" r="120" strokeWidth="4" />
          <path d="M1040 820 H1680" strokeWidth="12" />
          <path d="M1160 868 H1680" strokeWidth="4" />
          <path d="M1280 906 H1560" strokeWidth="4" />
          <path d="M760 210 l90 90 -90 90" strokeWidth="12" />
          <path d="M620 640 l70 70" strokeWidth="12" />
          <path d="M700 600 l70 70" strokeWidth="4" />
          <path d="M0 430 H1600" strokeWidth="1" opacity="0.45" />
          <path d="M0 470 H1600" strokeWidth="1" opacity="0.45" />
          <path d="M480 0 V1000" strokeWidth="1" opacity="0.35" />
          <path d="M1120 0 V1000" strokeWidth="1" opacity="0.35" />
        </g>
      </svg>
    </div>
  );
}
