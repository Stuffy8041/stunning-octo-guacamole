<script setup>
import { ref, reactive, onMounted, defineExpose } from "vue";
import { fetchFilesFromLatestRelease } from "../helpers/releaseLoader";
import { unlockAllDistricts, ensureSelectables } from "../helpers/gamedata";
import WalletPanel from "./gui/WalletPanel.vue";
import PlayerPanel from "./gui/PlayerPanel.vue";
import SurfersGrid from "./gui/SurfersGrid.vue";
import BoardsGrid from "./gui/BoardsGrid.vue";
import SeasonPanel from "./gui/SeasonPanel.vue";

const guiInner = ref(null);

const GITHUB_OWNER = "HerrErde";
const GITHUB_REPO = "city-source";
const FILENAMES = [
  "boards_data.json",
  "boards_links.json",
  "characters_links.json",
  "districts_data.json",
  "surfers_data.json",
  "surfersskins_data.json"
];

const state = reactive({
  loading: true,
  error: null,
  boards: [],
  surfers: [],
  skins: [],
  districts: [],
  charactersLinks: [],
  boardsLinks: [],
  selectedCharacter: null,
  selectedBoard: null,
  selectedSkin: null,
  selectedDistrict: null
});

const TAGS = {
  COINS: -633437229,
  KEYS: -1085419483,
  REVIVE: 1669706535,
  BOARDTOKENS: -1509662453,
  CHARTOKENS: -1878560402,
  TICKETS: 722065917
};
const uiSurfers = ref([]);
const uiBoards = ref([]);

function getW(obj, tag) {
  return (obj && obj.wallet ? obj.wallet : []).find((w) => w.dataTag === tag);
}

async function loadGameData() {
  state.loading = true;
  state.error = null;
  const remote = await fetchFilesFromLatestRelease(
    GITHUB_OWNER,
    GITHUB_REPO,
    FILENAMES
  );
  for (const f of FILENAMES) {
    let data = remote[f];
    if (!data) {
      // fallback to test folder
      try {
        const r = await fetch(`/test/${f}`);
        if (r.ok) data = await r.json();
      } catch (e) {}
    }
    if (data) {
      if (f.includes("surfers") && !f.includes("skins")) state.surfers = data;
      else if (f.includes("boards") && !f.includes("links"))
        state.boards = data;
      else if (f.includes("districts"))
        state.districts = data.districts || data;
      else if (f.includes("skins")) state.skins = data;
      else if (f.includes("characters")) state.charactersLinks = data;
      else if (f.includes("boards_links")) state.boardsLinks = data;
    }
  }
  state.loading = false;
  buildUiArrays();
}

function buildUiArrays() {
  uiSurfers.value = [];
  const surfersData = state.surfers || [];

  // helper to normalize a character name to a key used in skins map
  const normKey = (v) =>
    v && String(v).toLowerCase().replace(/[^a-z0-9]/g, "") ? String(v).toLowerCase().replace(/[^a-z0-9]/g, "") : null;

  if (Array.isArray(surfersData)) {
    surfersData.forEach((item, idx) => {
      const idVal = item && typeof item === "object" ? item.dataTag || item.id || item : item;
      const profile =
        (guiInner.value && guiInner.value.surferProfiles
          ? guiInner.value.surferProfiles
          : []
        ).find((p) => String(p.id) === String(idVal)) || {};

      const rawName = (state.charactersLinks && state.charactersLinks[idx] && state.charactersLinks[idx].name) || (item && item.name) || item && item.key || null;
      const name = rawName || String(idVal);
      const sel = profile && profile.selectedSkin != null ? profile.selectedSkin : null;

      // build allowed skins for this surfer from state.skins if available
      let allowedSkins = [];
      try {
        const k = normKey(rawName || item && item.key || "");
        if (k && state.skins && state.skins[k]) {
          allowedSkins = Object.keys(state.skins[k]).map((n) => ({ id: state.skins[k][n], name: n }));
        } else if (item && Array.isArray(item.skins)) {
          // new format: surfer item directly lists allowed skin ids
          allowedSkins = item.skins.map((sid) => {
            // try to find a name from the skins map
            let foundName = String(sid);
            if (state.skins) {
              for (const sk in state.skins) {
                for (const nm in state.skins[sk]) {
                  if (state.skins[sk][nm] === sid) {
                    foundName = nm;
                    break;
                  }
                }
                if (foundName !== String(sid)) break;
              }
            }
            return { id: sid, name: foundName };
          });
        }
      } catch (e) {}

      uiSurfers.value.push({
        id: idVal,
        name,
        isUnlocked: !!profile.isUnlocked,
        level: profile.level || 1,
        highScore: profile.highScore || 0,
        // normalize 0 (no skin) to null so selects show "none"
        selectedSkin: sel === 0 ? null : sel,
        allowedSkins
      });
    });
  } else if (surfersData && typeof surfersData === "object") {
    // old format: object mapping key -> id
    Object.keys(surfersData).forEach((key, idx) => {
      const val = surfersData[key];
      const idVal = val && typeof val === "object" ? val.dataTag || val.id || val : val;
      const profile =
        (guiInner.value && guiInner.value.surferProfiles
          ? guiInner.value.surferProfiles
          : []
        ).find((p) => String(p.id) === String(idVal)) || {};
      const name = (state.charactersLinks && state.charactersLinks[idx] && state.charactersLinks[idx].name) || (val && val.name) || key;
      const sel = profile && profile.selectedSkin != null ? profile.selectedSkin : null;

      let allowedSkins = [];
      try {
        if (state.skins && state.skins[key]) {
          allowedSkins = Object.keys(state.skins[key]).map((n) => ({ id: state.skins[key][n], name: n }));
        }
      } catch (e) {}

      uiSurfers.value.push({
        id: idVal,
        name,
        isUnlocked: !!profile.isUnlocked,
        level: profile.level || 1,
        highScore: profile.highScore || 0,
        selectedSkin: sel === 0 ? null : sel,
        allowedSkins
      });
    });
  }

  uiBoards.value = (state.boards || []).map((b, idx) => {
    const idVal = b && typeof b === "object" ? b.dataTag || b.id || b : b;
    const profile =
      (guiInner.value && guiInner.value.boardProfiles
        ? guiInner.value.boardProfiles
        : []
      ).find((p) => String(p.id) === String(idVal)) || {};
    const name =
      (state.boardsLinks &&
        state.boardsLinks[idx] &&
        state.boardsLinks[idx].name) ||
      (b && b.name) ||
      String(idVal);
    return {
      id: idVal,
      name,
      isUnlocked: !!profile.isUnlocked,
      level: profile.level || 1
    };
  });
}

function populateFrom(finalData) {
  if (!finalData) return;
  guiInner.value = finalData;
  ensureSelectables(guiInner.value);
  state.selectedCharacter = guiInner.value.character ?? null;
  state.selectedBoard = guiInner.value.selectedBoard ?? null;
  // find first non-zero selectedSkin from any surfer profile
  state.selectedSkin = null;
  const sps = guiInner.value.surferProfiles || [];
  for (const p of sps) {
    if (p && p.selectedSkin != null && p.selectedSkin !== 0) {
      state.selectedSkin = p.selectedSkin;
      break;
    }
  }
  state.selectedDistrict = guiInner.value.district ?? null;

  buildUiArrays();

  const setInput = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v != null ? String(v) : "";
  };

  const getCount = (tag) => {
    const w = getW(guiInner.value, tag);
    return w ? w.count : 0;
  };

  setInput("coins", getCount(TAGS.COINS));
  setInput("keys", getCount(TAGS.KEYS));
  setInput("revives", getCount(TAGS.REVIVE));
  setInput("boardtokens", getCount(TAGS.BOARDTOKENS));
  setInput("chartokens", getCount(TAGS.CHARTOKENS));
  setInput("tickets", getCount(TAGS.TICKETS));

  setInput("level", guiInner.value.level ?? "");
  setInput("xp", guiInner.value.xp ?? "");

  const spStatus = document.getElementById("sp-status");
  const spBtn = document.getElementById("sp-btn");
  setInput("sp-points-val", guiInner.value.seasonPassPoints || 0);
  if (spStatus) {
    spStatus.textContent = guiInner.value.seasonPassPurchased
      ? "Season Pass: ACTIVE ✓"
      : "Season Pass: INACTIVE";
  }
  if (spBtn) {
    spBtn.textContent = guiInner.value.seasonPassPurchased
      ? "Lock Season Pass"
      : "Unlock Season Pass";
  }
}

function skinsList() {
  const out = [];
  try {
    for (const key of Object.keys(state.skins || {})) {
      const v = state.skins[key];
      if (typeof v === "object") {
        for (const skey of Object.keys(v)) {
          out.push({ id: v[skey], name: skey });
        }
      }
    }
  } catch (e) {}
  return out;
}

function readToInner() {
  if (!guiInner.value) guiInner.value = {};
  if (!Array.isArray(guiInner.value.wallet)) guiInner.value.wallet = [];

  const setW = (tag, val) => {
    let i = getW(guiInner.value, tag);
    if (i) i.count = val;
    else guiInner.value.wallet.push({ dataTag: tag, count: val });
  };

  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : null;
  };

  setW(TAGS.COINS, parseInt(getVal("coins")) || 0);
  setW(TAGS.KEYS, parseInt(getVal("keys")) || 0);
  setW(TAGS.BOARDTOKENS, parseInt(getVal("boardtokens")) || 0);
  setW(TAGS.CHARTOKENS, parseInt(getVal("chartokens")) || 0);
  setW(TAGS.TICKETS, parseInt(getVal("tickets")) || 0);
  setW(TAGS.REVIVE, parseInt(getVal("revives")) || 0);

  guiInner.value.level = parseInt(getVal("level")) || guiInner.value.level || 0;
  guiInner.value.xp = parseInt(getVal("xp")) || guiInner.value.xp || 0;

  if (state.selectedCharacter != null)
    guiInner.value.character = state.selectedCharacter;
  if (state.selectedBoard != null)
    guiInner.value.selectedBoard = state.selectedBoard;
  if (state.selectedDistrict != null)
    guiInner.value.district = state.selectedDistrict;

  if (
    state.selectedSkin != null &&
    Array.isArray(guiInner.value.surferProfiles)
  ) {
    const sp = guiInner.value.surferProfiles[0];
    if (sp) sp.selectedSkin = state.selectedSkin;
  }

  guiInner.value.surferProfiles = guiInner.value.surferProfiles || [];
  uiSurfers.value.forEach((u) => {
    const exists = guiInner.value.surferProfiles.find(
      (p) => String(p.id) === String(u.id)
    );
    if (exists) {
      exists.isUnlocked = !!u.isUnlocked;
      exists.wasSeen = !!u.isUnlocked;
      exists.level = Math.min(u.level || 1, 20);
      exists.highScore = u.highScore || 0;
      if (u.selectedSkin != null) exists.selectedSkin = u.selectedSkin;
    } else {
      guiInner.value.surferProfiles.push({
        id: u.id,
        isUnlocked: !!u.isUnlocked,
        wasSeen: !!u.isUnlocked,
        level: Math.min(u.level || 1, 20),
        highScore: u.highScore || 0
      });
    }
  });

  guiInner.value.boardProfiles = guiInner.value.boardProfiles || [];
  uiBoards.value.forEach((u) => {
    const exists = guiInner.value.boardProfiles.find(
      (p) => String(p.id) === String(u.id)
    );
    if (exists) {
      exists.isUnlocked = !!u.isUnlocked;
      exists.wasSeen = !!u.isUnlocked;
      exists.level = Math.min(u.level || 1, 20);
    } else {
      guiInner.value.boardProfiles.push({
        id: u.id,
        isUnlocked: !!u.isUnlocked,
        wasSeen: !!u.isUnlocked,
        level: Math.min(u.level || 1, 20)
      });
    }
  });

  guiInner.value.seasonPassPurchased =
    guiInner.value.seasonPassPurchased || false;
  guiInner.value.seasonPassPoints =
    parseInt(getVal("sp-points-val")) || guiInner.value.seasonPassPoints || 0;

  return guiInner.value;
}

async function unlockDistrictsAll() {
  if (!guiInner.value) guiInner.value = {};
  try {
    unlockAllDistricts(guiInner.value, state.districts || []);
    populateFrom(guiInner.value);
  } catch (e) {
    console.error(e);
  }
}

defineExpose({
  populateFrom,
  readToInner,
  unlockDistrictsAll,
  loadGameData: loadGameData
});

onMounted(async () => {
  await loadGameData();
});

function switchTab(name, btn) {
  document
    .querySelectorAll("#guiEditor .panel")
    .forEach((p) => (p.style.display = "none"));
  document
    .querySelectorAll("#guiEditor .tab")
    .forEach((t) => t.classList.remove("active"));
  const panel = document.getElementById("tab-" + name);
  if (panel) panel.style.display = "block";
  if (btn) btn.classList.add("active");
}

function toggleSP() {
  const spStatus = document.getElementById("sp-status");
  const spBtn = document.getElementById("sp-btn");
  if (!spStatus || !spBtn) return;

  const isActive = spStatus.dataset.active === "true";

  spStatus.dataset.active = (!isActive).toString();

  spStatus.textContent = !isActive
    ? "Season Pass: ACTIVE ✓"
    : "Season Pass: INACTIVE";
  spStatus.classList.toggle("text-green-600", !isActive);
  spStatus.classList.toggle("text-gray-700", isActive);

  spBtn.textContent = !isActive ? "Lock Season Pass" : "Unlock Season Pass";
}

function applySpPoints() {
  const el = document.getElementById("sp-points-val");
  const v = el ? parseInt(el.value) || 0 : 0;
  const msg = document.getElementById("msg-sp");
  if (msg) msg.textContent = "Points set: " + v;
}
</script>

<template>
  <div id="guiEditor">
    <div
      class="tabs"
      style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px">
      <button
        class="tab active"
        @click="
          (e) => {
            switchTab('wallet', e.target);
          }
        ">
        Wallet
      </button>
      <button
        class="tab"
        @click="
          (e) => {
            switchTab('player', e.target);
          }
        ">
        Player
      </button>
      <button
        class="tab"
        @click="
          (e) => {
            switchTab('surfers', e.target);
          }
        ">
        Surfers
      </button>
      <button
        class="tab"
        @click="
          (e) => {
            switchTab('boards', e.target);
          }
        ">
        Boards
      </button>
      <button
        class="tab"
        @click="
          (e) => {
            switchTab('season', e.target);
          }
        ">
        Season
      </button>
    </div>

    <WalletPanel />

    <PlayerPanel
      :state="state"
      :skinsList="skinsList"
      @unlockdistricts="unlockDistrictsAll"
      @refresh="loadGameData" />

    <SurfersGrid :uiSurfers="uiSurfers" :skinsList="skinsList" />

    <BoardsGrid :uiBoards="uiBoards" />

    <SeasonPanel @toggle-sp="toggleSP" @apply-sp="applySpPoints" />
  </div>
</template>

<style src="./gui-editor.css" scoped></style>
