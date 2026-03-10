(function () {
  const logoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="28" fill="#244a3d"/>
      <path d="M24 82L46 38L60 66L74 46L96 82H24Z" fill="#d7b56d"/>
      <circle cx="60" cy="28" r="10" fill="#f5f7f6"/>
      <text x="60" y="104" text-anchor="middle" font-family="Arial" font-size="18" fill="#f5f7f6">РСУ</text>
    </svg>
  `;

  window.RSU_BRANDING = {
    appTitle: "RSU ERP v3",
    appSubtitle: "Премии, согласование и документы",
    shortTitle: "RSU ERP",
    primaryColor: "#2f5f4f",
    secondaryColor: "#1f3d33",
    accentColor: "#d7b56d",
    dangerColor: "#b33a3a",
    lightBg: "#f5f7f6",
    cardBg: "#ffffff",
    textColor: "#1b1f1d",
    mutedText: "#6b756f",
    borderColor: "#d8dfdb",
    logoDataUri: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(logoSvg)}`
  };
})();
