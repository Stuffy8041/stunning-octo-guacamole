<template>
  <div id="tab-season" class="panel p-4" style="display: none">
    <div id="sp-status" class="mb-3 font-semibold text-gray-700">Season Pass: INACTIVE</div>

    <button id="sp-btn" class="btn" @click.prevent="$emit('toggle-sp')">
      Unlock Season Pass
    </button>

    <div id="sp-points-section">
      <label class="font-medium text-gray-700">Season Pass Points</label>
      <div id="sp-points-section" class="flex items-center gap-2 mb-2">
        <input
          type="number"
          id="sp-points-val"
          min="0"
          class="border border-gray-300 rounded-md px-2 py-1 w-20 text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button class="btn" @click.prevent="$emit('apply-sp')">Set</button>
      </div>
    </div>

    <div id="msg-sp" class="text-sm text-gray-600"></div>
  </div>
</template>

<script setup>
const emit = defineEmits(["toggle-sp", "apply-sp"]);
</script>

<style scoped>
.btn {
  transition: background-color 0.2s;
}
</style>
