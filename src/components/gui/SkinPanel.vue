<template>
  <div id="tab-skins" class="panel" style="display: none">
    <div class="modal-body" style="padding: 8px">
      <div
        class="skins-grid"
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 12px;
        "
      >
        <div
          v-for="surfer in surfers"
          :key="surfer.id"
          class="surfer-card"
          style="border: 1px solid #ccc; border-radius: 8px; padding: 12px"
        >
          <div
            class="surfer-header"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-weight: bold;
              margin-bottom: 8px;
              padding-bottom: 8px;
              border-bottom: 1px solid #ddd;
            "
          >
            <div>{{ surfer.name }}</div>
            <label style="display: flex; align-items: center; gap: 8px">
              <input
                type="checkbox"
                :checked="
                  surfer.skins &&
                  surfer.skins.length &&
                  surfer.skins.every((s) => s.isUnlocked)
                "
                :disabled="!surfer.skins || surfer.skins.length === 0"
                @change="(e) => toggleSurferSkins(surfer.id, e.target.checked)"
              />
              <span style="font-size: 0.9em">All skins</span>
            </label>
          </div>

          <div
            class="skins-list"
            style="display: flex; flex-direction: column; gap: 6px"
          >
            <div
              v-for="skin in surfer.skins"
              :key="skin.id"
              class="skin-item"
              style="display: flex; align-items: center; gap: 8px"
            >
              <input
                type="checkbox"
                :id="`skin-${skin.id}`"
                v-model="skin.isUnlocked"
                @change="updateSkinData(surfer.id, skin.id, skin.isUnlocked)"
              />
              <label
                :for="`skin-${skin.id}`"
                style="margin: 0; cursor: pointer; flex: 1"
              >
                {{ skin.name }}
              </label>
              <span style="font-size: 0.8em; color: #666">{{ skin.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  uiSurfers: Array,
  skinsList: Function,
  surferSkinProfiles: Array,
  skins: Object, // state.skins from GuiEditor
});

const emit = defineEmits(["update-skins"]);

const surfers = ref([]);

// Build surfer cards with their skins
function buildSurfersList() {
  surfers.value = (props.uiSurfers || []).map((surfer) => {
    const skins = (surfer.allowedSkins || []).map((skin) => {
      // Find if this skin is unlocked in the profile
      const skinProfile = (props.surferSkinProfiles || []).find(
        (sp) => sp.id === skin.id,
      );
      return {
        id: skin.id,
        name: skin.name,
        isUnlocked: skinProfile ? !!skinProfile.isUnlocked : false,
      };
    });

    return {
      id: surfer.id,
      name: surfer.name,
      skins,
    };
  });
}

function updateSkinData(surferId, skinId, isUnlocked) {
  emit("update-skins", { surferId, skinId, isUnlocked });
}

function unlockSurferskins(surferId) {
  const surfer = surfers.value.find((s) => s.id === surferId);
  if (surfer) {
    surfer.skins.forEach((skin) => {
      skin.isUnlocked = true;
      updateSkinData(surferId, skin.id, true);
    });
  }
}

function lockSurferskins(surferId) {
  const surfer = surfers.value.find((s) => s.id === surferId);
  if (surfer) {
    surfer.skins.forEach((skin) => {
      skin.isUnlocked = false;
      updateSkinData(surferId, skin.id, false);
    });
  }
}

function toggleSurferSkins(surferId, unlock) {
  if (unlock) unlockSurferskins(surferId);
  else lockSurferskins(surferId);
}

watch(() => props.uiSurfers, buildSurfersList, { immediate: true, deep: true });
watch(() => props.surferSkinProfiles, buildSurfersList, {
  immediate: true,
  deep: true,
});
</script>

<style scoped>
.btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #e0e0e0;
  border-color: #999;
}

.btn-primary {
  background: #4caf50;
  color: white;
  border-color: #45a049;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #f44336;
  color: white;
  border-color: #da190b;
}

.btn-secondary:hover {
  background: #da190b;
}

.btn-small {
  padding: 4px 8px;
  font-size: 0.85em;
}
</style>
