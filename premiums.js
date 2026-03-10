(function () {
  function q(id) {
    return document.getElementById(id);
  }

  function getModeFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") || "general";
  }

  function createSectionTitle(text) {
    const div = document.createElement("div");
    div.className = "rsu-section-title";
    div.textContent = text;
    return div;
  }

  function optionList() {
    return `
      <option value="Ежемесячная">Ежемесячная</option>
      <option value="Единовременная">Единовременная</option>
      <option value="Объектная_КТУ">Объектная / КТУ</option>
      <option value="Аварийные_Работы">Аварийные работы</option>
      <option value="Отопительный_Сезон">Отопительный сезон</option>
    `;
  }

  function basisRowHtml() {
    return `
      <div class="premium-subrow">
        <select class="rsu-select basis-type">
          <option value="Показатель">Показатель</option>
          <option value="Работа">Работа</option>
          <option value="Акт">Акт</option>
          <option value="Заявка">Заявка</option>
          <option value="Экономический_Эффект">Экономический эффект</option>
        </select>
        <input class="rsu-input basis-description" placeholder="Описание основания">
        <input class="rsu-input basis-plan" placeholder="План" inputmode="decimal">
        <input class="rsu-input basis-fact" placeholder="Факт" inputmode="decimal">
        <input class="rsu-input basis-weight" placeholder="Вес" inputmode="decimal" value="10">
        <input class="rsu-input basis-entity-type" placeholder="Тип связанной сущности">
        <input class="rsu-input basis-entity-id" placeholder="ID сущности / документа">
        <input class="rsu-input basis-doc-number" placeholder="№ документа">
        <input class="rsu-input basis-doc-date" placeholder="Дата документа">
        <label class="premium-check"><input type="checkbox" class="basis-confirmed" checked> Подтверждено</label>
        <button type="button" class="rsu-btn rsu-btn-secondary row-remove">Удалить</button>
      </div>
    `;
  }

  function disciplineRowHtml() {
    return `
      <div class="premium-subrow">
        <select class="rsu-select discipline-reason">
          <option value="Прогул">Прогул</option>
          <option value="Хищение">Хищение</option>
          <option value="Авария_Из_За_Нарушения_Эксплуатации">Авария из-за нарушения эксплуатации</option>
          <option value="Умышленный_Ущерб">Умышленный ущерб</option>
          <option value="Нарушение_Охраны_Труда">Нарушение охраны труда</option>
          <option value="Несвоевременное_Устранение_Аварии">Несвоевременное устранение аварии</option>
          <option value="Алкогольное_Или_Наркотическое_Опьянение">Алкоголь / наркотики</option>
          <option value="Иное">Иное</option>
        </select>
        <input class="rsu-input discipline-date" placeholder="Дата события">
        <input class="rsu-input discipline-document" placeholder="Подтверждающий документ">
        <input class="rsu-input discipline-doc-number" placeholder="№ документа">
        <input class="rsu-input discipline-description" placeholder="Описание">
        <label class="premium-check"><input type="checkbox" class="discipline-block" checked> Блокирует премию</label>
        <button type="button" class="rsu-btn rsu-btn-secondary row-remove">Удалить</button>
      </div>
    `;
  }

  function distributionRowHtml() {
    return `
      <div class="premium-subrow">
        <input class="rsu-input dist-user-id" placeholder="ID сотрудника">
        <input class="rsu-input dist-name" placeholder="ФИО">
        <input class="rsu-input dist-ktu" placeholder="КТУ" inputmode="decimal">
        <input class="rsu-input dist-comment" placeholder="Комментарий">
        <button type="button" class="rsu-btn rsu-btn-secondary row-remove">Удалить</button>
      </div>
    `;
  }

  function documentRowHtml() {
    return `
      <div class="premium-subrow">
        <input class="rsu-input doc-type" placeholder="Тип документа">
        <input class="rsu-input doc-category" placeholder="Категория">
        <input class="rsu-input doc-number" placeholder="№ документа">
        <input class="rsu-input doc-date" placeholder="Дата документа">
        <input class="rsu-input doc-id" placeholder="ID / ссылка">
        <input class="rsu-input doc-proof" placeholder="Что подтверждает">
        <label class="premium-check"><input type="checkbox" class="doc-required" checked> Обязательный</label>
        <label class="premium-check"><input type="checkbox" class="doc-confirmed" checked> Подтвержден</label>
        <button type="button" class="rsu-btn rsu-btn-secondary row-remove">Удалить</button>
      </div>
    `;
  }

  function addRow(containerId, html) {
    const host = q(containerId);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    const node = wrapper.firstElementChild;
    node.querySelector(".row-remove").addEventListener("click", () => node.remove());
    host.appendChild(node);
  }

  function readRows(selector, mapper) {
    return Array.from(document.querySelectorAll(selector)).map(mapper).filter(Boolean);
  }

  function fieldValue(id) {
    return (q(id)?.value || "").trim();
  }

  function toggleMode() {
    const premiumType = fieldValue("premium_type");
    const decisionCategory = fieldValue("decision_category");
    const objectBlock = q("objectBlock");
    const periodBlock = q("periodBlock");
    const distributionBlock = q("distributionBlock");
    const increaseBlock = q("increaseBlock");
    const salaryBlock = q("salaryBlock");
    const ktuBlock = q("ktuBlock");

    objectBlock.style.display = premiumType === "Объектная_КТУ" || premiumType === "Аварийные_Работы" ? "block" : "none";
    periodBlock.style.display = premiumType === "Ежемесячная" || premiumType === "Отопительный_Сезон" ? "block" : "none";
    distributionBlock.style.display = premiumType === "Объектная_КТУ" ? "block" : "none";
    increaseBlock.style.display = premiumType === "Ежемесячная" && decisionCategory !== "Лишение" ? "block" : "none";
    salaryBlock.style.display = decisionCategory === "Лишение" ? "none" : "block";
    ktuBlock.style.display = premiumType === "Объектная_КТУ" ? "block" : "none";
  }

  function buildPayload(submitMode) {
    return {
      action: "premium_submission",
      submit_mode: submitMode,
      premium_type: fieldValue("premium_type"),
      decision_category: fieldValue("decision_category"),
      recipient_type: fieldValue("recipient_type"),
      employee_id: fieldValue("employee_id"),
      employee_name: fieldValue("employee_name"),
      team_id: fieldValue("team_id"),
      team_name: fieldValue("team_name"),
      department_id: fieldValue("department_id"),
      department_name: fieldValue("department_name"),
      site_id: fieldValue("site_id"),
      site_name: fieldValue("site_name"),
      act_id: fieldValue("act_id"),
      act_number: fieldValue("act_number"),
      request_id: fieldValue("request_id"),
      accident_id: fieldValue("accident_id"),
      report_period: fieldValue("report_period"),
      period_start: fieldValue("period_start"),
      period_end: fieldValue("period_end"),
      summary: fieldValue("summary"),
      official_note: fieldValue("official_note"),
      comment: fieldValue("comment"),
      manual_increase_reason: fieldValue("manual_increase_reason"),
      salary_rate: fieldValue("salary_rate"),
      base_amount: fieldValue("base_amount"),
      requested_percent: fieldValue("requested_percent"),
      requested_amount: fieldValue("requested_amount"),
      ktu_protocol_number: fieldValue("ktu_protocol_number"),
      ktu_proposed_by_id: fieldValue("ktu_proposed_by_id"),
      ktu_agreed_by_id: fieldValue("ktu_agreed_by_id"),
      basis_lines: readRows("#basisRows .premium-subrow", (row) => ({
        type: row.querySelector(".basis-type").value,
        description: row.querySelector(".basis-description").value,
        plan: row.querySelector(".basis-plan").value,
        fact: row.querySelector(".basis-fact").value,
        weight: row.querySelector(".basis-weight").value,
        entity_type: row.querySelector(".basis-entity-type").value,
        entity_id: row.querySelector(".basis-entity-id").value,
        doc_number: row.querySelector(".basis-doc-number").value,
        doc_date: row.querySelector(".basis-doc-date").value,
        confirmed: row.querySelector(".basis-confirmed").checked
      })),
      discipline_lines: readRows("#disciplineRows .premium-subrow", (row) => ({
        reason: row.querySelector(".discipline-reason").value,
        event_date: row.querySelector(".discipline-date").value,
        document: row.querySelector(".discipline-document").value,
        doc_number: row.querySelector(".discipline-doc-number").value,
        description: row.querySelector(".discipline-description").value,
        blocks: row.querySelector(".discipline-block").checked
      })),
      distribution_lines: readRows("#distributionRows .premium-subrow", (row) => ({
        user_id: row.querySelector(".dist-user-id").value,
        employee_name: row.querySelector(".dist-name").value,
        ktu: row.querySelector(".dist-ktu").value,
        comment: row.querySelector(".dist-comment").value
      })),
      document_lines: readRows("#documentRows .premium-subrow", (row) => ({
        document_type: row.querySelector(".doc-type").value,
        document_category: row.querySelector(".doc-category").value,
        document_number: row.querySelector(".doc-number").value,
        document_date: row.querySelector(".doc-date").value,
        document_id: row.querySelector(".doc-id").value,
        proof_of: row.querySelector(".doc-proof").value,
        required: row.querySelector(".doc-required").checked,
        confirmed: row.querySelector(".doc-confirmed").checked
      }))
    };
  }

  function validatePayload(payload) {
    const errors = [];
    const warnings = [];
    const weakPhrases = [
      "за хорошую работу",
      "за ответственность",
      "за активность",
      "за помощь",
      "за добросовестность",
      "за качественную работу"
    ];
    const summary = (payload.summary || "").toLowerCase();
    const hasDocument = Boolean(
      payload.act_id || payload.act_number || payload.request_id || payload.accident_id || (payload.document_lines || []).length
    );

    if (!payload.premium_type) errors.push("Не выбран тип премии.");
    if (!payload.recipient_type) errors.push("Не выбран тип получателя.");
    if (!payload.summary) errors.push("Не заполнено краткое основание.");
    if (weakPhrases.some((item) => summary.includes(item))) {
      errors.push("Основание сформулировано слишком общо и не пройдет защиту.");
    }
    if (payload.premium_type === "Ежемесячная" && !payload.report_period) {
      errors.push("Для ежемесячной премии нужен отчетный период.");
    }
    if (payload.premium_type === "Объектная_КТУ" && !payload.site_id) {
      errors.push("Для объектной премии нужен объект.");
    }
    if (payload.premium_type === "Объектная_КТУ" && !payload.act_number) {
      errors.push("Для объектной премии нужен номер акта.");
    }
    if (payload.premium_type === "Объектная_КТУ" && !(payload.distribution_lines || []).length) {
      errors.push("Для КТУ нужен состав распределения.");
    }
    if (payload.premium_type === "Аварийные_Работы" && !(payload.request_id || payload.accident_id || payload.act_number)) {
      errors.push("Для аварийной премии нужна заявка, авария или акт.");
    }
    if (!payload.department_id) {
      errors.push("Не указано подразделение.");
    }
    if (!hasDocument) {
      errors.push("Не указан подтверждающий документ.");
    }
    if (payload.decision_category !== "Лишение" && !(payload.salary_rate || payload.base_amount || payload.requested_amount || payload.requested_percent)) {
      errors.push("Нет расчетной базы или размера премии.");
    }
    if (payload.decision_category === "Лишение" && !(payload.discipline_lines || []).length) {
      errors.push("Для лишения премии нужно дисциплинарное основание.");
    }
    if (payload.decision_category === "Снижение" && !payload.official_note) {
      errors.push("Для снижения премии нужна служебная записка.");
    }
    if (payload.requested_percent && Number(payload.requested_percent) > 50 && !payload.manual_increase_reason) {
      warnings.push("Для повышения свыше 50% потребуется отдельное обоснование.");
    }
    if (!payload.official_note) {
      warnings.push("Не заполнено служебное обоснование.");
    }
    return { errors, warnings };
  }

  function renderValidation(payload) {
    const preview = q("validationOutput");
    if (!preview) return { errors: [], warnings: [] };
    const result = validatePayload(payload);
    const lines = [];
    if (result.errors.length) {
      lines.push("Блокирующие замечания:");
      result.errors.forEach((item) => lines.push(`- ${item}`));
    } else {
      lines.push("Блокирующих замечаний по форме не найдено.");
    }
    if (result.warnings.length) {
      lines.push("");
      lines.push("Предупреждения:");
      result.warnings.forEach((item) => lines.push(`- ${item}`));
    }
    preview.textContent = lines.join("\n");
    preview.style.display = "block";
    return result;
  }

  function submitForm(submitMode) {
    const payload = buildPayload(submitMode);
    const validation = renderValidation(payload);
    if (submitMode !== "draft" && validation.errors.length) {
      return;
    }
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.sendData) {
      window.Telegram.WebApp.sendData(JSON.stringify(payload));
      return;
    }
    q("debugOutput").textContent = JSON.stringify(payload, null, 2);
  }

  function initPage() {
    const content = window.RSU_UI.mountPageLayout("#app");
    if (!content) return;

    const card = window.RSU_UI.card("Форма представления на премию", `
      <div class="rsu-muted">Форма учитывает ежемесячные, единовременные, объектные и специальные премии. Правовой слой подбирает нормы колдоговора, фиксирует ограничения и не доводит выплату до финала без утверждения уполномоченного лица.</div>
      <div class="rsu-form-grid premium-grid">
        <label><span class="rsu-label">Тип премии</span><select id="premium_type" class="rsu-select">${optionList()}</select></label>
        <label><span class="rsu-label">Категория решения</span><select id="decision_category" class="rsu-select"><option value="Премирование">Премирование</option><option value="Снижение">Снижение</option><option value="Лишение">Лишение</option></select></label>
        <label><span class="rsu-label">Тип получателя</span><select id="recipient_type" class="rsu-select"><option value="Сотрудник">Сотрудник</option><option value="Бригада">Бригада</option><option value="Подразделение">Подразделение</option></select></label>
        <label><span class="rsu-label">ID сотрудника</span><input id="employee_id" class="rsu-input" placeholder="USER-002"></label>
        <label><span class="rsu-label">ФИО сотрудника</span><input id="employee_name" class="rsu-input" placeholder="Иванов И.И."></label>
        <label><span class="rsu-label">ID бригады</span><input id="team_id" class="rsu-input" placeholder="TEAM-RSU-HEAT"></label>
        <label><span class="rsu-label">Название бригады</span><input id="team_name" class="rsu-input" placeholder="Бригада теплотрасс"></label>
        <label><span class="rsu-label">ID подразделения</span><input id="department_id" class="rsu-input" placeholder="DEP-RSU"></label>
        <label><span class="rsu-label">Название подразделения</span><input id="department_name" class="rsu-input" placeholder="РСУ"></label>
      </div>
      <div id="periodBlock">
        <div class="rsu-section-title">Период</div>
        <div class="rsu-form-grid premium-grid">
          <label><span class="rsu-label">Отчетный период</span><input id="report_period" class="rsu-input" placeholder="2026-03"></label>
          <label><span class="rsu-label">Дата начала периода</span><input id="period_start" class="rsu-input" placeholder="2026-03-01"></label>
          <label><span class="rsu-label">Дата окончания периода</span><input id="period_end" class="rsu-input" placeholder="2026-03-31"></label>
        </div>
      </div>
      <div id="objectBlock">
        <div class="rsu-section-title">Объект и подтверждающие документы</div>
        <div class="rsu-form-grid premium-grid">
          <label><span class="rsu-label">ID объекта</span><input id="site_id" class="rsu-input" placeholder="SITE-001"></label>
          <label><span class="rsu-label">Название объекта</span><input id="site_name" class="rsu-input" placeholder="Котельная №1"></label>
          <label><span class="rsu-label">ID акта</span><input id="act_id" class="rsu-input" placeholder="ACT-001"></label>
          <label><span class="rsu-label">Номер акта</span><input id="act_number" class="rsu-input" placeholder="Акт №12/03"></label>
          <label><span class="rsu-label">ID заявки</span><input id="request_id" class="rsu-input" placeholder="REQ-000123"></label>
          <label><span class="rsu-label">ID аварии</span><input id="accident_id" class="rsu-input" placeholder="AVR-2026-01"></label>
        </div>
      </div>
      <div id="salaryBlock" class="rsu-form-grid premium-grid">
        <label><span class="rsu-label">Оклад / ставка, BYN</span><input id="salary_rate" class="rsu-input" inputmode="decimal" placeholder="1500"></label>
        <label><span class="rsu-label">Расчетная база / фонд, BYN</span><input id="base_amount" class="rsu-input" inputmode="decimal" placeholder="1200"></label>
        <label><span class="rsu-label">Запрошенный процент</span><input id="requested_percent" class="rsu-input" inputmode="decimal" placeholder="35"></label>
        <label><span class="rsu-label">Запрошенная сумма, BYN</span><input id="requested_amount" class="rsu-input" inputmode="decimal" placeholder="500"></label>
      </div>
      <div id="increaseBlock">
        <div class="rsu-section-title">Повышение премии</div>
        <label><span class="rsu-label">Обоснование повышения свыше 50%</span><textarea id="manual_increase_reason" class="rsu-textarea" placeholder="Указать основания для повышения до 60% по представлению руководителя"></textarea></label>
      </div>
      <label><span class="rsu-label">Краткое основание</span><textarea id="summary" class="rsu-textarea" placeholder="Кратко опиши основание: выполненные работы, акт, заявка, период, эффект"></textarea></label>
      <label><span class="rsu-label">Служебное обоснование</span><textarea id="official_note" class="rsu-textarea" placeholder="Официальный текст для представления и служебной записки"></textarea></label>
      <label><span class="rsu-label">Комментарий</span><textarea id="comment" class="rsu-textarea" placeholder="Дополнительные пояснения"></textarea></label>
      <div>
        <div class="rsu-section-title">Фактические основания</div>
        <div id="basisRows" class="premium-rows"></div>
        <button type="button" id="addBasisRow" class="rsu-btn rsu-btn-secondary">Добавить основание</button>
      </div>
      <div>
        <div class="rsu-section-title">Дисциплинарные основания</div>
        <div id="disciplineRows" class="premium-rows"></div>
        <button type="button" id="addDisciplineRow" class="rsu-btn rsu-btn-secondary">Добавить дисциплинарный фактор</button>
      </div>
      <div id="distributionBlock">
        <div class="rsu-section-title">Распределение по сотрудникам / КТУ</div>
        <div id="distributionRows" class="premium-rows"></div>
        <button type="button" id="addDistributionRow" class="rsu-btn rsu-btn-secondary">Добавить строку КТУ</button>
      </div>
      <div id="ktuBlock">
        <div class="rsu-section-title">Протокол КТУ</div>
        <div class="rsu-form-grid premium-grid">
          <label><span class="rsu-label">Номер протокола КТУ</span><input id="ktu_protocol_number" class="rsu-input" placeholder="КТУ-2026-03-01"></label>
          <label><span class="rsu-label">Кто предложил КТУ</span><input id="ktu_proposed_by_id" class="rsu-input" placeholder="USER-001"></label>
          <label><span class="rsu-label">Кто согласовал КТУ</span><input id="ktu_agreed_by_id" class="rsu-input" placeholder="USER-001"></label>
        </div>
      </div>
      <div>
        <div class="rsu-section-title">Подтверждающие документы</div>
        <div id="documentRows" class="premium-rows"></div>
        <button type="button" id="addDocumentRow" class="rsu-btn rsu-btn-secondary">Добавить документ</button>
      </div>
      <div class="rsu-actions">
        <button type="button" id="checkPremium" class="rsu-btn rsu-btn-secondary">Проверить комплектность</button>
        <button type="button" id="saveDraft" class="rsu-btn rsu-btn-secondary">Сохранить черновик</button>
        <button type="button" id="sendPremium" class="rsu-btn rsu-btn-primary">Отправить на согласование</button>
      </div>
      <pre id="validationOutput" class="premium-debug"></pre>
      <pre id="debugOutput" class="premium-debug"></pre>
    `);

    content.appendChild(card);
    content.appendChild(createSectionTitle("Подсказка"));
    content.appendChild(
      window.RSU_UI.card(
        "",
        "Для точной юридической привязки указывай номер акта, заявки, аварии и служебное обоснование. Если выбран режим «Лишение», обязательно добавь подтвержденное дисциплинарное основание из перечня колдоговора. Система сформирует представление и правовую карточку, но не примет окончательное решение о выплате без маршрута согласования и утверждения."
      )
    );

    q("addBasisRow").addEventListener("click", () => addRow("basisRows", basisRowHtml()));
    q("addDisciplineRow").addEventListener("click", () => addRow("disciplineRows", disciplineRowHtml()));
    q("addDistributionRow").addEventListener("click", () => addRow("distributionRows", distributionRowHtml()));
    q("addDocumentRow").addEventListener("click", () => addRow("documentRows", documentRowHtml()));
    q("checkPremium").addEventListener("click", () => renderValidation(buildPayload("preview")));
    q("saveDraft").addEventListener("click", () => submitForm("draft"));
    q("sendPremium").addEventListener("click", () => submitForm("submit"));
    q("premium_type").addEventListener("change", toggleMode);
    q("decision_category").addEventListener("change", toggleMode);

    addRow("basisRows", basisRowHtml());
    addRow("documentRows", documentRowHtml());

    const modeMap = {
      monthly: "Ежемесячная",
      one_time: "Единовременная",
      object: "Объектная_КТУ",
      accident: "Аварийные_Работы",
      heating: "Отопительный_Сезон"
    };
    const initialType = modeMap[getModeFromQuery()] || "Ежемесячная";
    q("premium_type").value = initialType;
    q("decision_category").value = "Премирование";
    toggleMode();
  }

  document.addEventListener("DOMContentLoaded", initPage);
})();
