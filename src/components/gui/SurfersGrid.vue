<template>
  <div id="tab-surfers" class="panel" style="display: none">
    <div class="modal-body grid-2" style="padding: 8px">
      <div v-for="(s, i) in uiSurfers" :key="s.id" class="card">
        <div class="card-title">{{ s.name }}</div>
        <div>
          <label
            ><input type="checkbox" v-model="s.isUnlocked" /> Unlocked</label
          >
        </div>
        <div>
          <label
            >Level
            <input
              type="number"
              v-model.number="s.level"
              min="1"
              max="20"
              pattern="[0-9]*"
              @input="
                (e) => (e.target.value = e.target.value.replace(/\D/g, ''))
              "
          /></label>
        </div>
        <div>
          <label
            >Highscore
            <input
              type="number"
              v-model.number="s.highScore"
              min="0"
              pattern="[0-9]*"
              @input="
                (e) => (e.target.value = e.target.value.replace(/\D/g, ''))
              "
          /></label>
        </div>
        <div>
          <label
            >Selected Skin
            <select v-model="s.selectedSkin">
              <option :value="null">-- none --</option>
              <option v-for="sk in skinsList()" :key="sk.id" :value="sk.id">
                {{ sk.name }} ({{ sk.id }})
              </option>
            </select>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(["uiSurfers", "skinsList"]);
</script>

<style scoped></style>
