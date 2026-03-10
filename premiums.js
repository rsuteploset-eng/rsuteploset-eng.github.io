(function () {
  const PREMIUM_TYPES = [
    { value: "Ежемесячная", label: "Ежемесячная" },
    { value: "Единовременная", label: "Единовременная" },
    { value: "Объектная_КТУ", label: "Объектная / КТУ" },
    { value: "Аварийные_Работы", label: "Аварийные работы" },
    { value: "Отопительный_Сезон", label: "Отопительный сезон" }
  ];

  const DECISION_CATEGORIES = [
    { value: "Премирование", label: "Премирование" },
    { value: "Снижение", label: "Снижение" },
    { value: "Лишение", label: "Лишение" }
  ];

  const RECIPIENT_TYPES = [
    { value: "Сотрудник", label: "Сотрудник" },
    { value: "Бригада", label: "Бригада" },
    { value: "Подразделение", label: "Подразделение" }
  ];

  const BASIS_TYPES = [
    { value: "Показатель", label: "Показатель" },
    { value: "Работа", label: "Работа" },
    { value: "Акт", label: "Акт / закрытие этапа" },
    { value: "Заявка", label: "Заявка / наряд" },
    { value: "Экономический_Эффект", label: "Экономический эффект" }
  ];

  const DISCIPLINE_REASONS = [
    { value: "Прогул", label: "Прогул" },
    { value: "Хищение", label: "Хищение" },
    { value: "Авария_Из_За_Нарушения_Эксплуатации", label: "Авария из-за нарушения эксплуатации" },
    { value: "Умышленный_Ущерб", label: "Умышленный ущерб" },
    { value: "Нарушение_Охраны_Труда", label: "Нарушение охраны труда" },
    { value: "Несвоевременное_Устранение_Аварии", label: "Несвоевременное устранение аварии" },
    { value: "Алкогольное_Или_Наркотическое_Опьянение", label: "Алкоголь / наркотики" },
    { value: "Иное", label: "Иное" }
  ];

  const DISCIPLINE_DOCUMENT_TYPES = [
    { value: "Докладная записка", label: "Докладная записка" },
    { value: "Служебная записка", label: "Служебная записка" },
    { value: "Акт", label: "Акт" },
    { value: "Приказ", label: "Приказ" },
    { value: "Объяснительная", label: "Объяснительная" },
    { value: "Иное", label: "Иное" }
  ];

  const DOCUMENT_TYPES = [
    { value: "Акт", label: "Акт" },
    { value: "Заявка", label: "Заявка / наряд" },
    { value: "Служебная записка", label: "Служебная записка" },
    { value: "Докладная записка", label: "Докладная записка" },
    { value: "Приказ", label: "Приказ" },
    { value: "Протокол КТУ", label: "Протокол КТУ" },
    { value: "Отчет", label: "Отчет" },
    { value: "Справка", label: "Справка" },
    { value: "Фото / файл", label: "Фото / файл" },
    { value: "Иное", label: "Иное" }
  ];

  const DOCUMENT_CATEGORIES = [
    { value: "Подтверждающий", label: "Подтверждающий" },
    { value: "Расчетный", label: "Расчетный" },
    { value: "Согласовательный", label: "Для согласования" },
    { value: "Распорядительный", label: "Распорядительный" },
    { value: "Дополнительный", label: "Дополнительный" }
  ];

  const PROOF_OPTIONS = [
    { value: "Основание премии", label: "Основание премии" },
    { value: "Расчет суммы", label: "Расчет суммы" },
    { value: "Выполнение работ", label: "Выполнение работ" },
    { value: "Дисциплинарное основание", label: "Дисциплинарное основание" },
    { value: "Маршрут согласования", label: "Маршрут согласования" }
  ];

  const ROUTE_ROLE_TITLES = {
    ROLE_RSU_HEAD: "Начальник РСУ",
    ROLE_RMU_HEAD: "Начальник РМУ",
    ROLE_DEPUTY_DIRECTOR_BUILD: "Заместитель директора по строительству",
    ROLE_CHIEF_ENGINEER: "Главный инженер",
    ROLE_DIRECTOR: "Директор"
  };

  const state = {
    catalogs: normalizeCatalogs(window.RSU_PREMIUM_CATALOGS || {}),
    currentUser: null,
    summaryManual: false,
    noteManual: false,
    amountManual: false,
    percentManual: false
  };

  function q(id) {
    return document.getElementById(id);
  }

  function fieldValue(id) {
    return window.RSU_UI.normalizeText(q(id)?.value || "");
  }

  function formatMoney(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || !number) {
      return "";
    }
    return number.toFixed(2).replace(/\.00$/, "");
  }

  function humanize(value) {
    return window.RSU_UI.humanize ? window.RSU_UI.humanize(value) : String(value || "").replace(/_/g, " ");
  }

  function normalizeCatalogs(raw) {
    const sortByLabel = (items) => [...(items || [])].sort((left, right) => String(left.label || "").localeCompare(String(right.label || ""), "ru"));
    const users = sortByLabel(raw.users || []);
    const departments = sortByLabel(raw.departments || []);
    const teams = sortByLabel(raw.teams || []);
    const sites = sortByLabel(raw.sites || []);

    return {
      generatedAt: raw.generated_at || "",
      users,
      departments,
      teams,
      sites,
      userById: new Map(users.map((item) => [String(item.id), item])),
      userByTelegramId: new Map(users.map((item) => [String(item.telegram_id), item])),
      departmentById: new Map(departments.map((item) => [String(item.id), item])),
      teamById: new Map(teams.map((item) => [String(item.id), item])),
      siteById: new Map(sites.map((item) => [String(item.id), item]))
    };
  }

  function getModeFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") || "general";
  }

  function getDefaultPremiumType() {
    const modeMap = {
      monthly: "Ежемесячная",
      one_time: "Единовременная",
      object: "Объектная_КТУ",
      accident: "Аварийные_Работы",
      heating: "Отопительный_Сезон"
    };
    return modeMap[getModeFromQuery()] || "Ежемесячная";
  }

  function getDefaultRecipientType(premiumType) {
    if (premiumType === "Объектная_КТУ") {
      return "Бригада";
    }
    return "Сотрудник";
  }

  function getCurrentTelegramUserId() {
    return String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "");
  }

  function findCurrentUser() {
    const telegramId = getCurrentTelegramUserId();
    return state.catalogs.userByTelegramId.get(telegramId) || null;
  }

  function setHiddenValue(id, value) {
    const input = q(id);
    if (input) {
      input.value = value || "";
    }
  }

  function optionRows(items, formatter) {
    return items.map((item) => `<button type="button" class="rsu-chip" data-value="${item.value}">${formatter ? formatter(item) : item.label}</button>`).join("");
  }

  function buildSelectMarkup(id, label, hint = "") {
    return `
      <label>
        <span class="rsu-label">${label}</span>
        <select id="${id}" class="rsu-select"></select>
        ${hint ? `<div class="rsu-field-meta">${hint}</div>` : ""}
      </label>
    `;
  }

  function createCard(title, bodyHtml) {
    const card = window.RSU_UI.card("", `${title}${bodyHtml}`);
    card.classList.add("premium-page-card");
    return card;
  }

  function buildContextCard() {
    return createCard(
      `${window.RSU_UI.stepBadge("Шаг 1")}<div class="rsu-section-title">Что оформляем</div>`,
      `
        <div class="premium-section-stack">
          ${window.RSU_UI.helper("Сначала выбираем тип решения и получателя. Служебные ID для backend будут подставлены автоматически из справочников и не мешают пользователю.")}
          <div class="rsu-stack">
            <div>
              <div class="rsu-label">Тип премии</div>
              <div id="premiumTypeChips" class="rsu-chip-group">${optionRows(PREMIUM_TYPES)}</div>
              <input type="hidden" id="premium_type">
            </div>
            <div>
              <div class="rsu-label">Категория решения</div>
              <div id="decisionCategoryChips" class="rsu-chip-group">${optionRows(DECISION_CATEGORIES)}</div>
              <input type="hidden" id="decision_category">
            </div>
            <div>
              <div class="rsu-label">Тип получателя</div>
              <div id="recipientTypeChips" class="rsu-chip-group">${optionRows(RECIPIENT_TYPES)}</div>
              <input type="hidden" id="recipient_type">
            </div>
          </div>
        </div>
      `
    );
  }

  function buildRecipientCard() {
    return createCard(
      `${window.RSU_UI.stepBadge("Шаг 2")}<div class="rsu-section-title">Получатель и автоподстановка</div>`,
      `
        <div class="rsu-grid-2">
          <div class="rsu-helper">
            <strong>Инициатор</strong><br>
            <span id="initiatorName">Не найден в справочнике</span><br>
            <span id="initiatorRole" class="premium-summary-note">Роль не определена</span>
          </div>
          <div class="rsu-helper">
            <strong>Маршрут согласования</strong><br>
            <span id="routeHint">Маршрут будет рассчитан после выбора подразделения и типа премии.</span>
          </div>
        </div>
        <div class="rsu-grid-2">
          <div id="employeeBlock">
            ${buildSelectMarkup("employee_select", "Сотрудник", "Выбор по ФИО. ID пользователя уйдёт в payload автоматически.")}
          </div>
          <div id="teamBlock">
            ${buildSelectMarkup("team_select", "Бригада", "Выбор по названию. Подразделение подтянется автоматически.")}
          </div>
          <div>
            ${buildSelectMarkup("department_select", "Подразделение", "Можно выбрать вручную или принять автоподстановку от сотрудника/бригады.")}
          </div>
          <div id="siteBlock">
            ${buildSelectMarkup("site_select", "Объект", "Выбор по названию. Служебный site_id в интерфейсе не показывается.")}
          </div>
        </div>
        <div id="objectRefBlock" class="rsu-grid-3">
          <label>
            <span class="rsu-label">Акт / закрытие этапа</span>
            <input id="act_number" class="rsu-input" placeholder="Например: Акт №12/03">
            <div class="rsu-field-meta">Пользователь указывает номер документа, а не внутренний ID акта.</div>
          </label>
          <label>
            <span class="rsu-label">Заявка / наряд / обращение</span>
            <input id="request_id" class="rsu-input" placeholder="Например: Заявка №54/03">
            <div class="rsu-field-meta">Поле \`request_id\` в payload заполняется этим понятным для человека номером.</div>
          </label>
          <label>
            <span class="rsu-label">Авария / инцидент</span>
            <input id="accident_id" class="rsu-input" placeholder="Например: Инцидент АВР-03-12">
            <div class="rsu-field-meta">Технический идентификатор в UI не требуется.</div>
          </label>
        </div>
      `
    );
  }

  function buildCalculationCard() {
    return createCard(
      `${window.RSU_UI.stepBadge("Шаг 3")}<div class="rsu-section-title">Период, расчет и формулировка</div>`,
      `
        <div id="periodBlock" class="rsu-stack">
          <div class="rsu-grid-3">
            <label>
              <span class="rsu-label">Отчетный период</span>
              <input id="report_period" class="rsu-input" placeholder="2026-03 или 2025-2026">
            </label>
            <label>
              <span class="rsu-label">Дата начала</span>
              <input id="period_start" class="rsu-input" type="date">
            </label>
            <label>
              <span class="rsu-label">Дата окончания</span>
              <input id="period_end" class="rsu-input" type="date">
            </label>
          </div>
        </div>
        <div id="salaryBlock" class="rsu-grid-4">
          <label>
            <span class="rsu-label">Оклад / ставка, BYN</span>
            <input id="salary_rate" class="rsu-input" inputmode="decimal" placeholder="1500">
          </label>
          <label>
            <span class="rsu-label">Расчетная база / фонд, BYN</span>
            <input id="base_amount" class="rsu-input" inputmode="decimal" placeholder="1200">
          </label>
          <label>
            <span class="rsu-label">Запрошенный процент</span>
            <input id="requested_percent" class="rsu-input" inputmode="decimal" placeholder="35">
          </label>
          <label>
            <span class="rsu-label">Запрошенная сумма, BYN</span>
            <input id="requested_amount" class="rsu-input" inputmode="decimal" placeholder="500">
          </label>
        </div>
        <div id="increaseBlock" class="rsu-stack">
          <label>
            <span class="rsu-label">Обоснование повышения свыше 50%</span>
            <textarea id="manual_increase_reason" class="rsu-textarea" placeholder="Причина для повышения сверх базового лимита"></textarea>
          </label>
        </div>
        <div class="rsu-stack">
          <label>
            <span class="rsu-label">Краткое основание</span>
            <textarea id="summary" class="rsu-textarea" placeholder="Форма соберет подсказку автоматически, при необходимости отредактируй"></textarea>
          </label>
          <div class="rsu-actions">
            <button type="button" id="composeSummary" class="rsu-btn rsu-btn-secondary">Собрать основание автоматически</button>
          </div>
          <label>
            <span class="rsu-label">Служебное обоснование</span>
            <textarea id="official_note" class="rsu-textarea" placeholder="Официальная формулировка для представления и служебной записки"></textarea>
          </label>
          <div class="rsu-actions">
            <button type="button" id="composeNote" class="rsu-btn rsu-btn-secondary">Собрать служебное обоснование</button>
          </div>
          <label>
            <span class="rsu-label">Комментарий</span>
            <textarea id="comment" class="rsu-textarea" placeholder="Только если нужно что-то уточнить отдельно"></textarea>
          </label>
        </div>
      `
    );
  }

  function buildEvidenceCard() {
    return createCard(
      `${window.RSU_UI.stepBadge("Шаг 4")}<div class="rsu-section-title">Основания, КТУ и подтверждения</div>`,
      `
        <div class="rsu-stack">
          <div>
            <div class="rsu-subcard-header">
              <div class="rsu-subcard-title">Фактические основания</div>
              <button type="button" id="addBasisRow" class="rsu-btn rsu-btn-secondary">Добавить основание</button>
            </div>
            <div id="basisRows" class="rsu-repeatable-list"></div>
          </div>
          <div>
            <div class="rsu-subcard-header">
              <div class="rsu-subcard-title">Дисциплинарные факторы</div>
              <button type="button" id="addDisciplineRow" class="rsu-btn rsu-btn-secondary">Добавить фактор</button>
            </div>
            <div id="disciplineRows" class="rsu-repeatable-list"></div>
          </div>
          <div id="distributionBlock">
            <div class="rsu-subcard-header">
              <div class="rsu-subcard-title">Строки КТУ</div>
              <button type="button" id="addDistributionRow" class="rsu-btn rsu-btn-secondary">Добавить строку КТУ</button>
            </div>
            <div id="distributionRows" class="rsu-repeatable-list"></div>
          </div>
          <div id="ktuBlock" class="rsu-stack">
            <div class="rsu-subcard">
              <div class="rsu-subcard-title">Протокол КТУ</div>
              <div class="rsu-grid-3">
                <label>
                  <span class="rsu-label">Номер протокола</span>
                  <input id="ktu_protocol_number" class="rsu-input" placeholder="КТУ-2026-03-01">
                </label>
                ${buildSelectMarkup("ktu_proposed_by_select", "Кто предложил КТУ")}
                ${buildSelectMarkup("ktu_agreed_by_select", "Кто согласовал КТУ")}
              </div>
            </div>
          </div>
          <div>
            <div class="rsu-subcard-header">
              <div class="rsu-subcard-title">Подтверждающие документы</div>
              <button type="button" id="addDocumentRow" class="rsu-btn rsu-btn-secondary">Добавить документ</button>
            </div>
            <div id="documentRows" class="rsu-repeatable-list"></div>
          </div>
        </div>
      `
    );
  }

  function buildReviewCard() {
    return createCard(
      `${window.RSU_UI.stepBadge("Шаг 5")}<div class="rsu-section-title">Резюме перед отправкой</div>`,
      `
        <div class="premium-summary-note">
          Пользователь работает по ФИО и названиям. Все служебные идентификаторы собираются тихо в payload для backend и Telegram WebApp.
        </div>
        <div id="summaryPreview" class="rsu-summary"></div>
        <div id="routePreview" class="rsu-inline-list"></div>
        <div id="validationPanel" class="rsu-helper"></div>
        <div class="rsu-actions">
          <button type="button" id="checkPremium" class="rsu-btn rsu-btn-secondary">Проверить комплектность</button>
          <button type="button" id="saveDraft" class="rsu-btn rsu-btn-secondary">Сохранить черновик</button>
          <button type="button" id="sendPremium" class="rsu-btn rsu-btn-primary">Отправить на согласование</button>
        </div>
        <pre id="debugOutput" class="premium-debug"></pre>
      `
    );
  }

  function basisRowNode() {
    const wrapper = document.createElement("div");
    wrapper.className = "rsu-subcard";
    wrapper.innerHTML = `
      <div class="rsu-subcard-header">
        <div class="rsu-subcard-title">Основание</div>
        <button type="button" class="rsu-btn rsu-btn-secondary" data-remove-row="basis">Удалить</button>
      </div>
      <div class="rsu-grid-3">
        <label>
          <span class="rsu-label">Тип основания</span>
          <select class="rsu-select basis-type">${optionHtml(BASIS_TYPES, "Показатель")}</select>
        </label>
        <label>
          <span class="rsu-label">План</span>
          <input class="rsu-input basis-plan" inputmode="decimal" placeholder="100">
        </label>
        <label>
          <span class="rsu-label">Факт</span>
          <input class="rsu-input basis-fact" inputmode="decimal" placeholder="100">
        </label>
      </div>
      <div class="rsu-grid-2">
        <label>
          <span class="rsu-label">Что именно сделано / достигнуто</span>
          <textarea class="rsu-textarea basis-description" placeholder="Факт, результат, выполненные работы, эффект"></textarea>
        </label>
        <div class="rsu-stack">
          <label>
            <span class="rsu-label">Вес / влияние, %</span>
            <input class="rsu-input basis-weight" inputmode="decimal" value="10">
          </label>
          <label>
            <span class="rsu-label">Номер подтверждения</span>
            <input class="rsu-input basis-doc-number" placeholder="Акт / отчет / заявка">
          </label>
          <label>
            <span class="rsu-label">Дата подтверждения</span>
            <input class="rsu-input basis-doc-date" type="date">
          </label>
          <label class="rsu-toggle-line">
            <input type="checkbox" class="basis-confirmed" checked>
            Подтверждено документом
          </label>
        </div>
      </div>
    `;
    return wrapper;
  }

  function disciplineRowNode() {
    const wrapper = document.createElement("div");
    wrapper.className = "rsu-subcard";
    wrapper.innerHTML = `
      <div class="rsu-subcard-header">
        <div class="rsu-subcard-title">Дисциплинарный фактор</div>
        <button type="button" class="rsu-btn rsu-btn-secondary" data-remove-row="discipline">Удалить</button>
      </div>
      <div class="rsu-grid-3">
        <label>
          <span class="rsu-label">Причина</span>
          <select class="rsu-select discipline-reason">${optionHtml(DISCIPLINE_REASONS, "Прогул")}</select>
        </label>
        <label>
          <span class="rsu-label">Дата события</span>
          <input class="rsu-input discipline-date" type="date">
        </label>
        <label>
          <span class="rsu-label">Тип документа</span>
          <select class="rsu-select discipline-document">${optionHtml(DISCIPLINE_DOCUMENT_TYPES, "Докладная записка")}</select>
        </label>
      </div>
      <div class="rsu-grid-2">
        <label>
          <span class="rsu-label">Номер документа</span>
          <input class="rsu-input discipline-doc-number" placeholder="ДЗ-03-05">
        </label>
        <label>
          <span class="rsu-label">Описание</span>
          <textarea class="rsu-textarea discipline-description" placeholder="Кратко опиши подтвержденное нарушение"></textarea>
        </label>
      </div>
      <label class="rsu-toggle-line">
        <input type="checkbox" class="discipline-block" checked>
        Блокирует премию полностью
      </label>
    `;
    return wrapper;
  }

  function distributionRowNode() {
    const wrapper = document.createElement("div");
    wrapper.className = "rsu-subcard";
    wrapper.innerHTML = `
      <div class="rsu-subcard-header">
        <div class="rsu-subcard-title">Строка распределения</div>
        <button type="button" class="rsu-btn rsu-btn-secondary" data-remove-row="distribution">Удалить</button>
      </div>
      <div class="rsu-grid-3">
        <label>
          <span class="rsu-label">Сотрудник</span>
          <select class="rsu-select dist-user-select"></select>
        </label>
        <label>
          <span class="rsu-label">КТУ</span>
          <input class="rsu-input dist-ktu" inputmode="decimal" value="1">
        </label>
        <label>
          <span class="rsu-label">Комментарий</span>
          <input class="rsu-input dist-comment" placeholder="При необходимости">
        </label>
      </div>
    `;
    fillUserSelect(wrapper.querySelector(".dist-user-select"), "Выберите сотрудника");
    return wrapper;
  }

  function documentRowNode() {
    const wrapper = document.createElement("div");
    wrapper.className = "rsu-subcard";
    wrapper.innerHTML = `
      <div class="rsu-subcard-header">
        <div class="rsu-subcard-title">Документ</div>
        <button type="button" class="rsu-btn rsu-btn-secondary" data-remove-row="document">Удалить</button>
      </div>
      <div class="rsu-grid-3">
        <label>
          <span class="rsu-label">Тип документа</span>
          <select class="rsu-select doc-type">${optionHtml(DOCUMENT_TYPES, defaultDocumentType())}</select>
        </label>
        <label>
          <span class="rsu-label">Категория</span>
          <select class="rsu-select doc-category">${optionHtml(DOCUMENT_CATEGORIES, "Подтверждающий")}</select>
        </label>
        <label>
          <span class="rsu-label">Что подтверждает</span>
          <select class="rsu-select doc-proof">${optionHtml(PROOF_OPTIONS, "Основание премии")}</select>
        </label>
      </div>
      <div class="rsu-grid-3">
        <label>
          <span class="rsu-label">Номер документа</span>
          <input class="rsu-input doc-number" placeholder="№ документа">
        </label>
        <label>
          <span class="rsu-label">Дата документа</span>
          <input class="rsu-input doc-date" type="date">
        </label>
        <label>
          <span class="rsu-label">Ссылка / путь / примечание</span>
          <input class="rsu-input doc-path" placeholder="URL, путь к файлу или внутреннее примечание">
        </label>
      </div>
      <div class="rsu-grid-2">
        <label class="rsu-toggle-line">
          <input type="checkbox" class="doc-required" checked>
          Обязательный документ
        </label>
        <label class="rsu-toggle-line">
          <input type="checkbox" class="doc-confirmed" checked>
          Подтвержден / приложен
        </label>
      </div>
    `;
    return wrapper;
  }

  function optionHtml(items, selectedValue) {
    return [`<option value="">Выберите</option>`].concat(
      (items || []).map((item) => {
        const selected = item.value === selectedValue ? " selected" : "";
        return `<option value="${item.value}"${selected}>${item.label}</option>`;
      })
    ).join("");
  }

  function fillUserSelect(select, placeholder) {
    window.RSU_UI.setSelectOptions(
      select,
      state.catalogs.users.map((user) => ({
        value: user.id,
        label: `${user.full_name}${user.role_title ? ` — ${user.role_title}` : ""}`
      })),
      { placeholder }
    );
  }

  function fillCatalogSelects() {
    fillUserSelect(q("employee_select"), "Выберите сотрудника");
    fillUserSelect(q("ktu_proposed_by_select"), "Выберите сотрудника");
    fillUserSelect(q("ktu_agreed_by_select"), "Выберите сотрудника");

    window.RSU_UI.setSelectOptions(
      q("team_select"),
      state.catalogs.teams.map((team) => ({
        value: team.id,
        label: `${team.label}${team.department_name ? ` — ${team.department_name}` : ""}`
      })),
      { placeholder: "Выберите бригаду" }
    );

    window.RSU_UI.setSelectOptions(
      q("department_select"),
      state.catalogs.departments.map((department) => ({
        value: department.id,
        label: department.label
      })),
      { placeholder: "Выберите подразделение" }
    );

    window.RSU_UI.setSelectOptions(
      q("site_select"),
      state.catalogs.sites.map((site) => ({
        value: site.id,
        label: `${site.label}${site.responsible_name ? ` — ${site.responsible_name}` : ""}`
      })),
      { placeholder: "Выберите объект" }
    );
  }

  function getUserById(userId) {
    return state.catalogs.userById.get(String(userId || "")) || null;
  }

  function getTeamById(teamId) {
    return state.catalogs.teamById.get(String(teamId || "")) || null;
  }

  function getDepartmentById(departmentId) {
    return state.catalogs.departmentById.get(String(departmentId || "")) || null;
  }

  function getSiteById(siteId) {
    return state.catalogs.siteById.get(String(siteId || "")) || null;
  }

  function selectedUser(selectId) {
    return getUserById(q(selectId)?.value);
  }

  function selectedTeam() {
    return getTeamById(q("team_select")?.value);
  }

  function selectedDepartment() {
    return getDepartmentById(q("department_select")?.value);
  }

  function selectedSite() {
    return getSiteById(q("site_select")?.value);
  }

  function selectedKtuUser(selectId) {
    return getUserById(q(selectId)?.value);
  }

  function populateCurrentUser() {
    state.currentUser = findCurrentUser();
    const current = state.currentUser;
    q("initiatorName").textContent = current ? current.full_name : "Не найден в справочнике";
    q("initiatorRole").textContent = current ? current.role_title : "Форма откроется, но автоподстановка инициатора будет ограничена";
  }

  function applyDefaults() {
    const premiumType = getDefaultPremiumType();
    const current = state.currentUser;
    const defaultRecipientType = getDefaultRecipientType(premiumType);

    setHiddenValue("premium_type", premiumType);
    setHiddenValue("decision_category", "Премирование");
    setHiddenValue("recipient_type", defaultRecipientType);

    if (current) {
      if (q("employee_select") && !q("employee_select").value) {
        q("employee_select").value = current.id || "";
      }
      if (q("team_select") && current.team_id && !q("team_select").value) {
        q("team_select").value = current.team_id;
      }
      if (q("department_select") && current.department_id && !q("department_select").value) {
        q("department_select").value = current.department_id;
      }
      if (
        q("site_select")
        && current.access_type === "site"
        && current.access_id
        && !q("site_select").value
      ) {
        q("site_select").value = current.access_id;
      }
      if (!q("ktu_proposed_by_select").value) {
        q("ktu_proposed_by_select").value = current.id || "";
      }
    }

    if (!q("ktu_agreed_by_select").value && current) {
      q("ktu_agreed_by_select").value = current.id || "";
    }

    q("report_period").value = premiumType === "Ежемесячная" ? new Date().toISOString().slice(0, 7) : "";
    composeSummary(true);
    composeNote(true);
  }

  function defaultDocumentType() {
    const premiumType = fieldValue("premium_type") || getDefaultPremiumType();
    const decisionCategory = fieldValue("decision_category") || "Премирование";

    if (decisionCategory === "Лишение") {
      return "Докладная записка";
    }
    if (premiumType === "Объектная_КТУ" || premiumType === "Аварийные_Работы") {
      return "Акт";
    }
    if (premiumType === "Ежемесячная") {
      return "Отчет";
    }
    if (premiumType === "Отопительный_Сезон") {
      return "Справка";
    }
    return "Служебная записка";
  }

  function addRow(containerId, factory) {
    const host = q(containerId);
    host.appendChild(factory());
    refreshAll();
  }

  function toggleSections() {
    const premiumType = fieldValue("premium_type");
    const decisionCategory = fieldValue("decision_category");
    const recipientType = fieldValue("recipient_type");
    const showObject = premiumType === "Объектная_КТУ" || premiumType === "Аварийные_Работы";
    const showPeriod = premiumType === "Ежемесячная" || premiumType === "Отопительный_Сезон";
    const showDistribution = premiumType === "Объектная_КТУ";
    const showIncrease = premiumType === "Ежемесячная" && decisionCategory !== "Лишение";
    const showSalary = decisionCategory !== "Лишение";

    q("employeeBlock").hidden = recipientType !== "Сотрудник";
    q("teamBlock").hidden = recipientType === "Подразделение";
    q("siteBlock").hidden = !showObject;
    q("objectRefBlock").hidden = !showObject && premiumType !== "Аварийные_Работы";
    q("periodBlock").hidden = !showPeriod;
    q("distributionBlock").hidden = !showDistribution;
    q("ktuBlock").hidden = !showDistribution;
    q("increaseBlock").hidden = !showIncrease;
    q("salaryBlock").hidden = !showSalary;
  }

  function syncRecipientContext() {
    const employee = selectedUser("employee_select");
    const team = selectedTeam();
    const currentDepartment = selectedDepartment();

    if (employee) {
      if (employee.team_id && !q("team_select").value) {
        q("team_select").value = employee.team_id;
      }
      if (employee.department_id && !q("department_select").value) {
        q("department_select").value = employee.department_id;
      }
    }

    if (team) {
      if (team.department_id && (!currentDepartment || currentDepartment.id !== team.department_id)) {
        q("department_select").value = team.department_id;
      }
    }
  }

  function syncPeriodFields() {
    const reportPeriod = fieldValue("report_period");
    const monthlyPattern = /^(\d{4})-(\d{2})$/;
    const match = monthlyPattern.exec(reportPeriod);
    if (!match) {
      return;
    }
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    q("period_start").value = firstDay.toISOString().slice(0, 10);
    q("period_end").value = lastDay.toISOString().slice(0, 10);
  }

  function baseForCalc() {
    return Number(fieldValue("base_amount") || fieldValue("salary_rate") || 0);
  }

  function syncCalculationFields(source) {
    const base = baseForCalc();
    if (!base) {
      return;
    }

    const percent = Number(fieldValue("requested_percent") || 0);
    const amount = Number(fieldValue("requested_amount") || 0);

    if (source === "percent" && percent && !state.amountManual) {
      q("requested_amount").value = formatMoney((base * percent) / 100);
    }

    if (source === "amount" && amount && !state.percentManual) {
      q("requested_percent").value = formatMoney((amount / base) * 100);
    }

    if (!fieldValue("requested_amount") && percent && !state.amountManual) {
      q("requested_amount").value = formatMoney((base * percent) / 100);
    }
  }

  function selectedRecipientLabel(payload) {
    return payload.employee_name || payload.team_name || payload.department_name || "Не выбран";
  }

  function primaryBasisText() {
    const first = Array.from(document.querySelectorAll("#basisRows .rsu-subcard")).find((row) => {
      return fieldFromRow(row, ".basis-description") || fieldFromRow(row, ".basis-doc-number");
    });
    if (!first) {
      return "";
    }
    return fieldFromRow(first, ".basis-description") || fieldFromRow(first, ".basis-doc-number");
  }

  function fieldFromRow(row, selector) {
    return window.RSU_UI.normalizeText(row?.querySelector(selector)?.value || "");
  }

  function composeSummary(force) {
    if (state.summaryManual && !force) {
      return;
    }
    const payload = buildPayload("preview");
    const recipient = selectedRecipientLabel(payload);
    const period = payload.report_period ? ` за ${payload.report_period}` : "";
    const site = payload.site_name ? ` на объекте ${payload.site_name}` : "";
    const act = payload.act_number ? `, подтверждение: ${payload.act_number}` : "";
    const request = payload.request_id ? `, заявка: ${payload.request_id}` : "";
    const basis = primaryBasisText();

    let text = "";
    if (payload.decision_category === "Лишение") {
      text = `Лишение премии ${recipient}${period}${basis ? ` по подтвержденному основанию: ${basis}` : ""}${request}.`;
    } else if (payload.decision_category === "Снижение") {
      text = `Снижение премии ${recipient}${period}${basis ? ` по причине: ${basis}` : ""}${request}.`;
    } else {
      text = `${humanize(payload.premium_type)} ${recipient}${period}${site}${basis ? ` за ${basis}` : ""}${act || request}.`;
    }
    q("summary").value = text.replace(/\s+/g, " ").trim();
    if (force) {
      state.summaryManual = false;
    }
  }

  function composeNote(force) {
    if (state.noteManual && !force) {
      return;
    }
    const payload = buildPayload("preview");
    const routeText = computeRoutePreview(payload).map((step) => ROUTE_ROLE_TITLES[step.roleCode] || step.roleCode).join(" → ");
    const amountText = payload.requested_amount ? ` Сумма к рассмотрению: ${payload.requested_amount} BYN.` : "";
    const percentText = payload.requested_percent ? ` Запрошенный процент: ${payload.requested_percent}%.` : "";
    const siteText = payload.site_name ? ` Объект: ${payload.site_name}.` : "";
    const periodText = payload.report_period ? ` Период: ${payload.report_period}.` : "";
    const basisText = primaryBasisText() ? ` Основание: ${primaryBasisText()}.` : "";
    const decisionText = payload.decision_category === "Премирование"
      ? "Прошу рассмотреть премирование по подтвержденным основаниям."
      : payload.decision_category === "Снижение"
        ? "Прошу рассмотреть снижение премии по подтвержденным основаниям."
        : "Прошу рассмотреть лишение премии по подтвержденным дисциплинарным основаниям.";

    q("official_note").value = `${decisionText}${periodText}${siteText}${basisText}${percentText}${amountText} Предварительный маршрут: ${routeText}.`.replace(/\s+/g, " ").trim();
    if (force) {
      state.noteManual = false;
    }
  }

  function getSelectedEntities() {
    const employee = selectedUser("employee_select");
    const team = selectedTeam();
    const department = selectedDepartment();
    const site = selectedSite();
    const ktuProposed = selectedKtuUser("ktu_proposed_by_select");
    const ktuAgreed = selectedKtuUser("ktu_agreed_by_select");
    return { employee, team, department, site, ktuProposed, ktuAgreed };
  }

  function collectBasisRows(payloadContext) {
    return Array.from(document.querySelectorAll("#basisRows .rsu-subcard")).map((row) => {
      const type = row.querySelector(".basis-type").value;
      const entityType = type === "Акт" ? "Акт" : type === "Заявка" ? "Заявка" : type === "Экономический_Эффект" ? "Экономический_Эффект" : "";
      const entityId = type === "Акт" ? payloadContext.act_number : type === "Заявка" ? payloadContext.request_id : "";
      const item = {
        type,
        description: fieldFromRow(row, ".basis-description"),
        plan: fieldFromRow(row, ".basis-plan"),
        fact: fieldFromRow(row, ".basis-fact"),
        weight: fieldFromRow(row, ".basis-weight"),
        entity_type: entityType,
        entity_id: entityId,
        doc_number: fieldFromRow(row, ".basis-doc-number"),
        doc_date: fieldFromRow(row, ".basis-doc-date"),
        confirmed: row.querySelector(".basis-confirmed").checked
      };
      return item.description || item.doc_number || item.plan || item.fact ? item : null;
    }).filter(Boolean);
  }

  function collectDisciplineRows() {
    return Array.from(document.querySelectorAll("#disciplineRows .rsu-subcard")).map((row) => {
      const item = {
        reason: row.querySelector(".discipline-reason").value,
        event_date: fieldFromRow(row, ".discipline-date"),
        document: row.querySelector(".discipline-document").value,
        doc_number: fieldFromRow(row, ".discipline-doc-number"),
        description: fieldFromRow(row, ".discipline-description"),
        blocks: row.querySelector(".discipline-block").checked
      };
      return item.event_date || item.doc_number || item.description ? item : null;
    }).filter(Boolean);
  }

  function collectDistributionRows() {
    return Array.from(document.querySelectorAll("#distributionRows .rsu-subcard")).map((row) => {
      const user = getUserById(row.querySelector(".dist-user-select").value);
      const item = {
        user_id: user?.id || "",
        employee_name: user?.full_name || "",
        ktu: fieldFromRow(row, ".dist-ktu"),
        comment: fieldFromRow(row, ".dist-comment")
      };
      return item.user_id || item.ktu || item.comment ? item : null;
    }).filter(Boolean);
  }

  function collectDocumentRows() {
    return Array.from(document.querySelectorAll("#documentRows .rsu-subcard")).map((row) => {
      const item = {
        document_type: row.querySelector(".doc-type").value,
        document_category: row.querySelector(".doc-category").value,
        document_number: fieldFromRow(row, ".doc-number"),
        document_date: fieldFromRow(row, ".doc-date"),
        document_id: "",
        path: fieldFromRow(row, ".doc-path"),
        proof_of: row.querySelector(".doc-proof").value,
        required: row.querySelector(".doc-required").checked,
        confirmed: row.querySelector(".doc-confirmed").checked
      };
      return item.document_type || item.document_number || item.path ? item : null;
    }).filter(Boolean);
  }

  function buildPayload(submitMode) {
    const entities = getSelectedEntities();
    const payload = {
      action: "premium_submission",
      submit_mode: submitMode,
      premium_type: fieldValue("premium_type"),
      decision_category: fieldValue("decision_category"),
      recipient_type: fieldValue("recipient_type"),
      employee_id: entities.employee?.id || "",
      employee_name: entities.employee?.full_name || "",
      team_id: entities.team?.id || "",
      team_name: entities.team?.name || "",
      department_id: entities.department?.id || "",
      department_name: entities.department?.name || "",
      site_id: entities.site?.id || "",
      site_name: entities.site?.name || "",
      act_id: "",
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
      ktu_proposed_by_id: entities.ktuProposed?.id || "",
      ktu_agreed_by_id: entities.ktuAgreed?.id || "",
      basis_lines: [],
      discipline_lines: collectDisciplineRows(),
      distribution_lines: collectDistributionRows(),
      document_lines: collectDocumentRows()
    };
    payload.basis_lines = collectBasisRows(payload);
    return payload;
  }

  function computeRoutePreview(payload) {
    const secondaryRole = ["Аварийные_Работы", "Объектная_КТУ", "Отопительный_Сезон"].includes(payload.premium_type)
      ? "ROLE_CHIEF_ENGINEER"
      : "ROLE_DEPUTY_DIRECTOR_BUILD";
    const headRole = !payload.department_id || payload.department_id === "DEP-RSU"
      ? "ROLE_RSU_HEAD"
      : "ROLE_RMU_HEAD";

    return [
      { stage: "Начальник", roleCode: headRole },
      { stage: "Заместитель", roleCode: secondaryRole },
      { stage: "Утверждение", roleCode: "ROLE_DIRECTOR" }
    ];
  }

  function validatePayload(payload) {
    const errors = [];
    const warnings = [];
    const summary = payload.summary.toLowerCase();
    const weakPhrases = [
      "за хорошую работу",
      "за ответственность",
      "за активность",
      "за помощь",
      "за добросовестность",
      "за качественную работу"
    ];
    const hasDocument = Boolean(payload.act_number || payload.request_id || payload.accident_id || payload.document_lines.length);

    if (!state.currentUser) {
      warnings.push("Инициатор не найден в статическом каталоге. Проверить сопоставление Telegram_ID.");
    }
    if (!payload.premium_type) errors.push("Не выбран тип премии.");
    if (!payload.recipient_type) errors.push("Не выбран тип получателя.");
    if (payload.recipient_type === "Сотрудник" && !payload.employee_id) errors.push("Не выбран сотрудник.");
    if (payload.recipient_type === "Бригада" && !payload.team_id) errors.push("Не выбрана бригада.");
    if (payload.recipient_type === "Подразделение" && !payload.department_id) errors.push("Не выбрано подразделение.");
    if (!payload.department_id) errors.push("Не определено подразделение.");
    if (!payload.summary) errors.push("Не заполнено краткое основание.");
    if (weakPhrases.some((item) => summary.includes(item))) {
      errors.push("Основание сформулировано слишком общо.");
    }
    if (payload.premium_type === "Ежемесячная" && !payload.report_period) {
      errors.push("Для ежемесячной премии нужен отчетный период.");
    }
    if (payload.premium_type === "Объектная_КТУ" && !payload.site_id) {
      errors.push("Для объектной премии нужно выбрать объект.");
    }
    if (payload.premium_type === "Объектная_КТУ" && !payload.act_number) {
      errors.push("Для объектной премии нужен номер акта.");
    }
    if (payload.premium_type === "Объектная_КТУ" && !payload.distribution_lines.length) {
      errors.push("Для КТУ нужно добавить хотя бы одну строку распределения.");
    }
    if (payload.premium_type === "Аварийные_Работы" && !(payload.request_id || payload.accident_id || payload.act_number)) {
      errors.push("Для аварийной премии нужна заявка, авария или акт.");
    }
    if (!hasDocument) {
      errors.push("Нет подтверждающего документа или номера акта/заявки.");
    }
    if (payload.decision_category !== "Лишение" && !(payload.salary_rate || payload.base_amount || payload.requested_amount || payload.requested_percent)) {
      errors.push("Нет расчетной базы или размера премии.");
    }
    if (payload.decision_category === "Лишение" && !payload.discipline_lines.length) {
      errors.push("Для лишения премии нужно дисциплинарное основание.");
    }
    if (payload.decision_category === "Снижение" && !payload.official_note) {
      errors.push("Для снижения премии нужно служебное обоснование.");
    }
    if (payload.requested_percent && Number(payload.requested_percent) > 50 && !payload.manual_increase_reason) {
      warnings.push("Для повышения свыше 50% потребуется отдельное обоснование.");
    }
    if (!payload.official_note) {
      warnings.push("Служебное обоснование пока пустое.");
    }
    if (!payload.basis_lines.length) {
      warnings.push("Нет детализированных строк основания. Лучше добавить хотя бы одну карточку.");
    }

    return { errors, warnings };
  }

  function renderValidation(payload) {
    const result = validatePayload(payload);
    const lines = [];
    if (result.errors.length) {
      lines.push("<strong>Блокирующие замечания:</strong>");
      lines.push(`<div class="premium-muted-list">${result.errors.map((item) => `<div>• ${item}</div>`).join("")}</div>`);
    } else {
      lines.push("<strong>Блокирующих замечаний не найдено.</strong>");
    }
    if (result.warnings.length) {
      lines.push("<div class=\"rsu-subtle-divider\"></div>");
      lines.push("<strong>Что стоит усилить:</strong>");
      lines.push(`<div class="premium-muted-list">${result.warnings.map((item) => `<div>• ${item}</div>`).join("")}</div>`);
    }
    q("validationPanel").innerHTML = lines.join("");
    return result;
  }

  function updateRoutePreview(payload) {
    const route = computeRoutePreview(payload);
    q("routeHint").textContent = route.map((step) => ROUTE_ROLE_TITLES[step.roleCode] || step.roleCode).join(" → ");
    q("routePreview").innerHTML = route
      .map((step) => `<span class="rsu-tag">${step.stage}: ${ROUTE_ROLE_TITLES[step.roleCode] || step.roleCode}</span>`)
      .join("");
  }

  function updateSummaryPreview(payload) {
    const summaryRows = [
      { label: "Тип премии", value: humanize(payload.premium_type) || "—" },
      { label: "Категория", value: payload.decision_category || "—" },
      { label: "Получатель", value: selectedRecipientLabel(payload) },
      { label: "Подразделение", value: humanize(payload.department_name) || "—" },
      { label: "Объект", value: humanize(payload.site_name) || "Не требуется" },
      { label: "Период", value: payload.report_period || "—" },
      { label: "Расчет", value: payload.decision_category === "Лишение" ? "Лишение премии" : `${payload.requested_percent || "—"}% / ${payload.requested_amount || "—"} BYN` },
      { label: "Основания", value: String(payload.basis_lines.length || 0) },
      { label: "Документы", value: String(payload.document_lines.length || 0) }
    ];
    q("summaryPreview").innerHTML = window.RSU_UI.renderSummary(summaryRows);
  }

  function refreshSelectionMeta() {
    const employee = selectedUser("employee_select");
    const team = selectedTeam();
    const department = selectedDepartment();
    const site = selectedSite();

    const employeeMeta = q("employee_select")?.nextElementSibling;
    const teamMeta = q("team_select")?.nextElementSibling;
    const departmentMeta = q("department_select")?.nextElementSibling;
    const siteMeta = q("site_select")?.nextElementSibling;

    if (employeeMeta) {
      employeeMeta.textContent = employee
        ? `${employee.role_title || "Сотрудник"}${employee.department_name ? ` · ${humanize(employee.department_name)}` : ""}`
        : "Выбор по ФИО. ID пользователя уйдёт в payload автоматически.";
    }
    if (teamMeta) {
      teamMeta.textContent = team
        ? `${humanize(team.team_type || "")}${team.department_name ? ` · ${humanize(team.department_name)}` : ""}`
        : "Выбор по названию. Подразделение подтянется автоматически.";
    }
    if (departmentMeta) {
      departmentMeta.textContent = department
        ? `${humanize(department.type || "Подразделение")}${department.comment ? ` · ${department.comment}` : ""}`
        : "Можно выбрать вручную или принять автоподстановку от сотрудника/бригады.";
    }
    if (siteMeta) {
      siteMeta.textContent = site
        ? `${site.status || "Статус не указан"}${site.responsible_name ? ` · ${site.responsible_name}` : ""}`
        : "Выбор по названию. Служебный site_id в интерфейсе не показывается.";
    }
  }

  function refreshAll() {
    syncRecipientContext();
    syncPeriodFields();
    toggleSections();
    const payload = buildPayload("preview");
    if (!state.summaryManual) composeSummary(false);
    if (!state.noteManual) composeNote(false);
    updateRoutePreview(payload);
    updateSummaryPreview(payload);
    refreshSelectionMeta();
    renderValidation(payload);
  }

  function submitForm(submitMode) {
    const payload = buildPayload(submitMode);
    const validation = renderValidation(payload);
    if (submitMode !== "draft" && validation.errors.length) {
      return;
    }
    try {
      if (window.Telegram?.WebApp?.sendData) {
        window.Telegram.WebApp.sendData(JSON.stringify(payload));
        return;
      }
      q("debugOutput").style.display = "block";
      q("debugOutput").textContent = JSON.stringify(payload, null, 2);
    } catch (error) {
      q("debugOutput").style.display = "block";
      q("debugOutput").textContent = String(error);
    }
  }

  function bindChipGroups() {
    window.RSU_UI.bindChipGroup(q("premiumTypeChips"), {
      value: fieldValue("premium_type"),
      onChange(nextValue) {
        setHiddenValue("premium_type", nextValue);
        refreshAll();
      }
    });

    window.RSU_UI.bindChipGroup(q("decisionCategoryChips"), {
      value: fieldValue("decision_category"),
      onChange(nextValue) {
        setHiddenValue("decision_category", nextValue);
        refreshAll();
      }
    });

    window.RSU_UI.bindChipGroup(q("recipientTypeChips"), {
      value: fieldValue("recipient_type"),
      onChange(nextValue) {
        setHiddenValue("recipient_type", nextValue);
        refreshAll();
      }
    });
  }

  function registerManualFlags() {
    q("summary").addEventListener("input", () => {
      state.summaryManual = true;
      refreshAll();
    });
    q("official_note").addEventListener("input", () => {
      state.noteManual = true;
      refreshAll();
    });
    q("requested_percent").addEventListener("input", () => {
      state.percentManual = Boolean(fieldValue("requested_percent"));
      if (!fieldValue("requested_amount")) {
        state.amountManual = false;
      }
      syncCalculationFields("percent");
      refreshAll();
    });
    q("requested_amount").addEventListener("input", () => {
      state.amountManual = Boolean(fieldValue("requested_amount"));
      if (!fieldValue("requested_percent")) {
        state.percentManual = false;
      }
      syncCalculationFields("amount");
      refreshAll();
    });
  }

  function attachEvents() {
    [
      "employee_select",
      "team_select",
      "department_select",
      "site_select",
      "report_period",
      "period_start",
      "period_end",
      "salary_rate",
      "base_amount",
      "manual_increase_reason",
      "comment",
      "act_number",
      "request_id",
      "accident_id",
      "ktu_protocol_number",
      "ktu_proposed_by_select",
      "ktu_agreed_by_select"
    ].forEach((id) => {
      q(id).addEventListener("change", refreshAll);
      q(id).addEventListener("input", refreshAll);
    });

    registerManualFlags();

    q("composeSummary").addEventListener("click", () => {
      state.summaryManual = false;
      composeSummary(true);
      refreshAll();
    });
    q("composeNote").addEventListener("click", () => {
      state.noteManual = false;
      composeNote(true);
      refreshAll();
    });

    q("addBasisRow").addEventListener("click", () => addRow("basisRows", basisRowNode));
    q("addDisciplineRow").addEventListener("click", () => addRow("disciplineRows", disciplineRowNode));
    q("addDistributionRow").addEventListener("click", () => addRow("distributionRows", distributionRowNode));
    q("addDocumentRow").addEventListener("click", () => addRow("documentRows", documentRowNode));
    q("checkPremium").addEventListener("click", () => refreshAll());
    q("saveDraft").addEventListener("click", () => submitForm("draft"));
    q("sendPremium").addEventListener("click", () => submitForm("submit"));

    q("app").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-row]");
      if (!button) {
        return;
      }
      const row = button.closest(".rsu-subcard");
      if (row) {
        row.remove();
        refreshAll();
      }
    });

    q("app").addEventListener("input", (event) => {
      if (event.target.closest("#basisRows, #disciplineRows, #distributionRows, #documentRows")) {
        refreshAll();
      }
    });

    q("app").addEventListener("change", (event) => {
      if (event.target.closest("#basisRows, #disciplineRows, #distributionRows, #documentRows")) {
        refreshAll();
      }
    });
  }

  function seedRows() {
    addRow("basisRows", basisRowNode);
    addRow("documentRows", documentRowNode);
  }

  function initPage() {
    const content = window.RSU_UI.mountPageLayout("#app");
    if (!content) {
      return;
    }

    content.appendChild(createCard(
      "<div class=\"rsu-section-title\">Форма представления на премию</div>",
      `
        <div class="premium-muted-list">
          <div>• выбор по ФИО, названию бригады, подразделения и объекта;</div>
          <div>• автоподстановка инициатора, роли и контекста из Telegram и статических каталогов;</div>
          <div>• повторяемые карточки вместо длинных технических полей;</div>
          <div>• резюме и проверка комплектности перед sendData.</div>
        </div>
        <div class="rsu-inline-list">
          <span class="rsu-service-note">Ручные ID скрыты</span>
          <span class="rsu-service-note">Telegram WebApp sendData сохранён</span>
          <span class="rsu-service-note">Русский интерфейс сохранён</span>
        </div>
      `
    ));

    content.appendChild(buildContextCard());
    content.appendChild(buildRecipientCard());
    content.appendChild(buildCalculationCard());
    content.appendChild(buildEvidenceCard());
    content.appendChild(buildReviewCard());

    populateCurrentUser();
    fillCatalogSelects();
    applyDefaults();
    bindChipGroups();
    seedRows();
    attachEvents();
    refreshAll();
  }

  document.addEventListener("DOMContentLoaded", initPage);
})();
