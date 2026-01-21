// Artist Training Planner
// Stores checklist completion in localStorage (per division+area+artist)

const TRAINING = [
  // Performance Skills
  {
    area: "Performance",
    title: "Live show coaching",
    checklist: [
      "Stage presence: posture, movement, energy control",
      "Audience interaction: call-and-response, eye contact, cues",
      "Mic technique: distance, dynamics, avoiding distortion",
      "Set pacing: transitions, dead-air elimination"
    ],
    owner: ["Entertainment"],
    support: ["VPS"]
  },
  {
    area: "Performance",
    title: "Vocal & movement refinement",
    checklist: [
      "Warm-up routine and breath control",
      "Pitch/stamina targets for live delivery",
      "Movement blocking (if applicable)",
      "Rehearsal recording + review notes"
    ],
    owner: ["Entertainment"],
    support: ["VPS"]
  },

  // Image & Brand
  {
    area: "Brand",
    title: "Image consistency system",
    checklist: [
      "Core look defined (wardrobe direction + do/don’t list)",
      "Styling coordination for upcoming appearances",
      "Visual consistency across content",
      "Brand story: 3 talking points that match visuals"
    ],
    owner: ["Entertainment"],
    support: ["VPS"]
  },

  // Music Production & Songwriting
  {
    area: "Production",
    title: "Production & songwriting development",
    checklist: [
      "Session goals (hook / verse / structure)",
      "Reference tracks selected",
      "Recording standards (takes, comping, cleanup)",
      "Release-ready deliverables (versions/stems as needed)"
    ],
    owner: ["APS"],
    support: ["BIS", "VPS"]
  },

  // Marketing & Promotion
  {
    area: "Marketing",
    title: "Short-form content + campaign alignment",
    checklist: [
      "Platform plan (TikTok/IG): cadence + formats",
      "On-camera delivery coaching: hooks + repeatability",
      "Asset list (clips, cutdowns, thumbnails, captions)",
      "DSP plan inputs (timing, metadata readiness)"
    ],
    owner: ["VPS"],
    support: ["Entertainment", "BIS"]
  },
  {
    area: "Marketing",
    title: "Radio + press readiness",
    checklist: [
      "Core talking points (tight, repeatable, safe)",
      "Interview practice (2-min story, 15-sec answers)",
      "Press/EPK asset checklist validated",
      "Outreach plan owner and timeline"
    ],
    owner: ["BIS"],
    support: ["Entertainment", "VPS"]
  },

  // Business & Career Management
  {
    area: "Business",
    title: "Business fundamentals + industry navigation",
    checklist: [
      "Finance basics (budget, advances, royalties awareness)",
      "Contract basics (rights, splits, approvals)",
      "Exec/network etiquette (how to speak, follow-up behavior)",
      "Team roles clarity (manager/agent/PR/legal)"
    ],
    owner: ["BIS"],
    support: ["Entertainment"]
  },

  // Professional Conduct & Growth
  {
    area: "Conduct",
    title: "Professionalism & sustainability",
    checklist: [
      "Accountability habits (showing up, deadlines, communication)",
      "Handling feedback without spiraling",
      "Long-term roadmap (next 30/90 days)",
      "Team communication norms"
    ],
    owner: ["BIS"],
    support: ["Entertainment"]
  }
];

const $ = (id) => document.getElementById(id);

const divisionEl = $("division");
const areaEl = $("area");
const artistEl = $("artist");
const dateEl = $("date");
const notesEl = $("notes");

const genBtn = $("gen");
const copyChecklistBtn = $("copyChecklist");
const copyPlanBtn = $("copyPlan");
const resetBtn = $("reset");

const listEl = $("list");
const planEl = $("plan");
const summaryEl = $("summary");

function keyBase() {
  const artist = (artistEl.value || "").trim() || "UnknownArtist";
  const division = divisionEl.value || "All";
  const area = areaEl.value || "All";
  return `ATP::${artist}::${division}::${area}`;
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(keyBase()) || "{}");
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(keyBase(), JSON.stringify(state));
}

function matchesDivision(item, division) {
  if (division === "All") return true;
  const allDivs = new Set([...(item.owner || []), ...(item.support || [])].map(x => String(x)));
  return allDivs.has(division);
}

function matchesArea(item, area) {
  if (area === "All") return true;
  return item.area === area;
}

function buildFiltered() {
  const division = divisionEl.value;
  const area = areaEl.value;
  return TRAINING.filter(i => matchesDivision(i, division) && matchesArea(i, area));
}

function render() {
  const state = loadState();
  const items = buildFiltered();

  listEl.innerHTML = "";

  let total = 0;
  let done = 0;

  for (const item of items) {
    const owner = (item.owner || []).join(", ") || "—";
    const support = (item.support || []).join(", ") || "—";

    const card = document.createElement("div");
    card.className = "item";

    const header = document.createElement("div");
    header.className = "itemTop";
    header.innerHTML = `
      <div>
        <div class="k">${escapeHtml(item.title)}</div>
        <div class="muted">${escapeHtml(areaLabel(item.area))}</div>
      </div>
      <div class="tags">
        <span class="tag">Owner: ${escapeHtml(owner)}</span>
        <span class="tag">Support: ${escapeHtml(support)}</span>
      </div>
    `;

    const checks = document.createElement("div");
    checks.className = "check";

    item.checklist.forEach((c, idx) => {
      total += 1;
      const id = `${item.title}::${idx}`;
      const checked = Boolean(state[id]);

      if (checked) done += 1;

      const row = document.createElement("label");
      row.className = "chk";
      row.innerHTML = `
        <input type="checkbox" data-id="${escapeHtml(id)}" ${checked ? "checked" : ""} />
        <span>${escapeHtml(c)}</span>
      `;
      checks.appendChild(row);
    });

    card.appendChild(header);
    card.appendChild(checks);
    listEl.appendChild(card);
  }

  summaryEl.textContent = `${items.length} modules • ${done}/${total} checklist items complete`;

  // bind checkbox events
  listEl.querySelectorAll('input[type="checkbox"][data-id]').forEach(cb => {
    cb.addEventListener("change", () => {
      const st = loadState();
      const id = cb.getAttribute("data-id");
      st[id] = cb.checked;
      saveState(st);
      render(); // refresh counts
      buildPlan(); // keep plan in sync
    });
  });

  buildPlan();
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function areaLabel(area){
  switch(area){
    case "Performance": return "Performance Skills";
    case "Brand": return "Image & Brand";
    case "Production": return "Music Production & Songwriting";
    case "Marketing": return "Marketing & Promotion";
    case "Business": return "Business & Career Management";
    case "Conduct": return "Professional Conduct & Growth";
    default: return area;
  }
}

function buildPlan() {
  const state = loadState();
  const items = buildFiltered();

  const artist = (artistEl.value || "").trim() || "[Artist]";
  const date = (dateEl.value || "").trim() || "[Date]";
  const division = divisionEl.value || "All";
  const area = areaEl.value || "All";
  const notes = (notesEl.value || "").trim();

  const lines = [];
  lines.push("ARTIST TRAINING SESSION PLAN");
  lines.push("");
  lines.push(`Artist: ${artist}`);
  lines.push(`Date: ${date}`);
  lines.push(`Division filter: ${division}`);
  lines.push(`Area filter: ${area === "All" ? "All" : areaLabel(area)}`);
  if (notes) lines.push(`Notes: ${notes}`);
  lines.push("");
  lines.push("Modules:");

  for (const item of items) {
    lines.push(`- ${item.title}`);
    lines.push(`  Owner: ${(item.owner || []).join(", ") || "—"}`);
    lines.push(`  Support: ${(item.support || []).join(", ") || "—"}`);

    item.checklist.forEach((c, idx) => {
      const id = `${item.title}::${idx}`;
      const mark = state[id] ? "[x]" : "[ ]";
      lines.push(`    ${mark} ${c}`);
    });

    lines.push("");
  }

  planEl.textContent = lines.join("\n");
}

function copyText(text) {
  return navigator.clipboard.writeText(text);
}

genBtn.addEventListener("click", () => render());

copyChecklistBtn.addEventListener("click", async () => {
  // copy only checklist portion from plan
  const full = planEl.textContent || "";
  const idx = full.indexOf("Modules:");
  const part = idx >= 0 ? full.slice(idx) : full;
  await copyText(part.trim());
});

copyPlanBtn.addEventListener("click", async () => {
  await copyText((planEl.textContent || "").trim());
});

resetBtn.addEventListener("click", () => {
  localStorage.removeItem(keyBase());
  render();
});

// auto-initialize once
render();
