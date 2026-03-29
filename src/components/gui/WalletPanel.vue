<template>
  <div id="tab-wallet" class="panel active">
    <label>Coins</label>
    <input
      id="coins"
      type="number"
      min="0"
      max="2147483647"
      step="1"
      inputmode="numeric"
      pattern="[0-9]*"
      @input="(e) => (e.target.value = e.target.value.replace(/\D/g, ''))" />

    <label>Keys</label>
    <input
      id="keys"
      type="number"
      min="0"
      max="2147483647"
      step="1"
      inputmode="numeric"
      pattern="[0-9]*"
      @input="(e) => (e.target.value = e.target.value.replace(/\D/g, ''))" />

    <label>Revives</label>
    <input
      id="revives"
      type="number"
      min="0"
      max="2147483647"
      step="1"
      inputmode="numeric"
      pattern="[0-9]*"
      @input="(e) => (e.target.value = e.target.value.replace(/\D/g, ''))" />

    <label>Board Tokens</label>
    <input
      id="boardtokens"
      type="number"
      min="0"
      max="2147483647"
      step="1"
      inputmode="numeric"
      pattern="[0-9]*"
      @input="(e) => (e.target.value = e.target.value.replace(/\D/g, ''))" />

    <label>Character Tokens</label>
    <input
      id="chartokens"
      type="number"
      min="0"
      max="2147483647"
      step="1"
      inputmode="numeric"
      pattern="[0-9]*"
      @input="(e) => (e.target.value = e.target.value.replace(/\D/g, ''))" />

    <label>Tickets</label>
    <input
      id="tickets"
      type="number"
      min="0"
      max="2147483647"
      step="1"
      inputmode="numeric"
      pattern="[0-9]*"
      @input="(e) => (e.target.value = e.target.value.replace(/\D/g, ''))" />
  </div>
</template>

<script setup></script>

<style scoped></style>
