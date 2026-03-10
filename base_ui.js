(function () {
  function ensureBranding() {
    if (!window.RSU_BRANDING) {
      console.error("RSU_BRANDING не найден. Подключи branding.js раньше base_ui.js");
      return null;
    }
    return window.RSU_BRANDING;
  }

  function createHeader(branding) {
    const header = document.createElement("div");
    header.className = "rsu-header";
    header.innerHTML = `
      <img class="rsu-logo" src="${branding.logoDataUri}" alt="Эмблема">
      <div class="rsu-header-text">
        <div class="rsu-title">${branding.appTitle}</div>
        <div class="rsu-subtitle">${branding.appSubtitle}</div>
      </div>
    `;
    return header;
  }

  function createFooter(branding) {
    const footer = document.createElement("div");
    footer.className = "rsu-footer";
    footer.textContent = `${branding.shortTitle} · Внутренняя цифровая система РСУ`;
    return footer;
  }

  window.RSU_UI = {
    applyBrandingCss() {
      const branding = ensureBranding();
      if (!branding) return;

      const root = document.documentElement;
      root.style.setProperty("--rsu-primary", branding.primaryColor);
      root.style.setProperty("--rsu-secondary", branding.secondaryColor);
      root.style.setProperty("--rsu-accent", branding.accentColor);
      root.style.setProperty("--rsu-danger", branding.dangerColor);
      root.style.setProperty("--rsu-bg", branding.lightBg);
      root.style.setProperty("--rsu-card", branding.cardBg);
      root.style.setProperty("--rsu-text", branding.textColor);
      root.style.setProperty("--rsu-muted", branding.mutedText);
      root.style.setProperty("--rsu-border", branding.borderColor);

      document.title = branding.appTitle;
    },

    mountPageLayout(pageSelector = "#app") {
      const branding = ensureBranding();
      if (!branding) return null;

      this.applyBrandingCss();

      const host = document.querySelector(pageSelector);
      if (!host) {
        console.error(`Не найден контейнер ${pageSelector}`);
        return null;
      }

      host.innerHTML = "";

      const page = document.createElement("div");
      page.className = "rsu-page";

      const header = createHeader(branding);
      const content = document.createElement("div");
      content.id = "rsu-content";

      const footer = createFooter(branding);

      page.appendChild(header);
      page.appendChild(content);
      page.appendChild(footer);

      host.appendChild(page);

      return content;
    },

    card(title, bodyHtml = "") {
      const card = document.createElement("div");
      card.className = "rsu-card";
      card.innerHTML = `
        ${title ? `<div class="rsu-section-title">${title}</div>` : ""}
        ${bodyHtml}
      `;
      return card;
    }
  };
})();