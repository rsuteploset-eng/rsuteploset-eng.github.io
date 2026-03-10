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
    normalizeText(value) {
      return String(value || "").replace(/\s+/g, " ").trim();
    },

    humanize(value) {
      return this.normalizeText(value).replace(/_/g, " ");
    },

    stepBadge(text) {
      return `<div class="rsu-step-badge">${text}</div>`;
    },

    helper(text) {
      return `<div class="rsu-helper">${text}</div>`;
    },

    renderTags(items) {
      const values = (items || []).filter(Boolean);
      if (!values.length) {
        return '<span class="rsu-tag">Нет данных</span>';
      }
      return values.map((item) => `<span class="rsu-tag">${item}</span>`).join("");
    },

    renderSummary(rows) {
      const items = (rows || []).map((row) => `
        <div class="rsu-summary-row">
          <div class="rsu-summary-key">${row.label || ""}</div>
          <div class="rsu-summary-value">${row.value || "—"}</div>
        </div>
      `).join("");
      return `<div class="rsu-summary">${items}</div>`;
    },

    setSelectOptions(select, options, { placeholder = "Выберите", selectedValue = "" } = {}) {
      if (!select) return;
      const rows = [`<option value="">${placeholder}</option>`];
      (options || []).forEach((option) => {
        const value = String(option.value ?? "");
        const label = String(option.label ?? value);
        const selected = String(selectedValue) === value ? " selected" : "";
        rows.push(`<option value="${value}"${selected}>${label}</option>`);
      });
      select.innerHTML = rows.join("");
    },

    bindChipGroup(container, { value, onChange } = {}) {
      if (!container) return;
      const buttons = Array.from(container.querySelectorAll("[data-value]"));
      const sync = (nextValue) => {
        buttons.forEach((button) => {
          button.classList.toggle("is-active", button.dataset.value === nextValue);
        });
      };

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const nextValue = button.dataset.value || "";
          sync(nextValue);
          if (typeof onChange === "function") {
            onChange(nextValue);
          }
        });
      });

      sync(value || buttons[0]?.dataset.value || "");
    },

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
