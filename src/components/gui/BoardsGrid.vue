<template>
  <div id="tab-boards" class="panel" style="display: none">
    <div class="modal-body grid-2" style="padding: 8px">
      <div v-for="(b, i) in uiBoards" :key="b.id" class="card">
        <div class="card-title">{{ b.name }}</div>
        <div>
          <label
            ><input type="checkbox" v-model="b.isUnlocked" /> Unlocked</label
          >
        </div>
        <div>
          <label
            >Level
            <input
              type="number"
              v-model.number="b.level"
              min="1"
              max="20"
              pattern="[0-9]*"
              @input="
                (e) => (e.target.value = e.target.value.replace(/\D/g, ''))
              "
          /></label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(["uiBoards"]);
</script>

<style scoped></style>
