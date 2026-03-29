<template>
  <div id="tab-player" class="panel" style="display: none">
    <label>Level</label>
    <input
      type="number"
      id="level"
      min="1"
      max="2147483647"
      pattern="[0-9]*"
      @input="(e) => (e.target.value = e.target.value.replace(/\D/g, ''))" />
    <label>XP</label>
    <input
      type="number"
      id="xp"
      min="1"
      max="2147483647"
      pattern="[0-9]*"
      @input="(e) => (e.target.value = e.target.value.replace(/\D/g, ''))" />

    <div style="margin-top: 12px">
      <label>Character</label>
      <select v-model="state.selectedCharacter">
        <option :value="null">-- keep current --</option>
        <option v-for="(c, idx) in state.surfers" :key="idx" :value="c">
          {{
            (state.charactersLinks &&
              state.charactersLinks[idx] &&
              state.charactersLinks[idx].name) ||
            c
          }}
        </option>
      </select>
    </div>

    <div style="margin-top: 8px">
      <label>Board</label>
      <select v-model="state.selectedBoard">
        <option :value="null">-- keep current --</option>
        <option
          v-for="(b, idx) in state.boards"
          :key="idx"
          :value="b.dataTag || b.id || b">
          {{
            (state.boardsLinks &&
              state.boardsLinks[idx] &&
              state.boardsLinks[idx].name) ||
            b.dataTag ||
            b.id ||
            b
          }}
        </option>
      </select>
    </div>

    <div style="margin-top: 8px">
      <label>Skin</label>
      <select v-model="state.selectedSkin">
        <option :value="null">-- keep current --</option>
        <option v-for="sk in skinsList()" :key="sk.id" :value="sk.id">
          {{ sk.name }} ({{ sk.id }})
        </option>
      </select>
    </div>

    <div style="margin-top: 8px">
      <label>District</label>
      <select v-model="state.selectedDistrict">
        <option :value="null">-- keep current --</option>
        <option
          v-for="d in state.districts"
          :key="d.dataTag || d.id || d"
          :value="d.dataTag || d.id || d">
          {{ d.name || d.ladderId || d.id || d }}
        </option>
      </select>
    </div>

    <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center">
      <button class="btn" @click.prevent="$emit('unlock')">
        Unlock All Districts
      </button>
      <button class="btn" @click.prevent="$emit('refresh')">
        Refresh Data
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(["state", "skinsList"]);
const emit = defineEmits(["unlock", "refresh"]);
</script>

<style scoped></style>
