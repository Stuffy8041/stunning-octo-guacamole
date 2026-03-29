<script setup>
import converter from "../helpers/converter";
import Swal from "sweetalert2";
import { createJSONEditor } from "vanilla-jsoneditor";
import "vanilla-jsoneditor/themes/jse-theme-dark.css";
import { ref, nextTick } from "vue";
import GuiEditor from "../components/GuiEditor.vue";
import "../components/gui-editor.css";

let editor;

const editorType = ref(
  localStorage.getItem("editorType") == "basic"
    ? "basic"
    : localStorage.getItem("editorType") == "gui"
      ? "gui"
      : "advanced",
);

const guiRef = ref(null);

document.addEventListener("DOMContentLoaded", () => {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    const el = document.getElementById("betterJSONEditor");
    if (el) el.classList.add("jse-theme-dark");
  }

  let content = { text: undefined, json: {} };

  editor = new createJSONEditor({
    target: document.getElementById("betterJSONEditor"),
    props: {
      content,
      onChange: (updatedContent) => {
        content = updatedContent;
      },
    },
  });
  applyEditorType();
});

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

async function decrypt(noWarnings) {
  try {
    if (!loadedBuffer) throw new Error("No file loaded");

    const decrypted = await converter.decryptValue(loadedBuffer);

    try {
      let finalData;

      const parsed = JSON.parse(decrypted);
      finalData = parsed?.profile ? JSON.parse(parsed.profile) : parsed;

      editor.set({ json: finalData });
      const txt = document.getElementById("decryptedData-Text");
      if (txt) txt.value = JSON.stringify(finalData, null, 2);

      if (
        editorType.value == "gui" &&
        guiRef.value &&
        guiRef.value.populateFrom
      ) {
        guiRef.value.populateFrom(finalData);
      }
    } catch {
      const txt = document.getElementById("decryptedData-Text");
      if (txt) txt.value = decrypted;
    }
  } catch (e) {
    console.error(e);
    if (!noWarnings) {
      Swal.fire(
        "Invalid data",
        "Make sure this is a valid encrypted profile file",
        "warning",
      );
    }
  } finally {
  }
}

let jsonWrap = { version: 3, lastUpdated: "", profile: "", hash: null };

async function getEncryptedData() {
  let data;

  if (editorType.value == "gui") {
    if (!guiRef.value || !guiRef.value.readToInner)
      throw new Error("GUI editor not ready");
    const obj = await guiRef.value.readToInner();
    data = JSON.stringify(obj);
  } else {
    data = editor.get().json || editor.get().text;
  }

  if (!loadedBuffer) throw new Error("No file loaded");

  const decrypted = await converter.decryptValue(loadedBuffer);

  let finalData;
  if (decrypted && typeof decrypted === "object") {
    finalData =
      typeof decrypted.profile === "string"
        ? JSON.parse(decrypted.profile)
        : decrypted.profile || {};
  } else {
    finalData = {};
  }

  const jsonWrapCopy = {
    ...jsonWrap,
    version: finalData.version || 3,
    lastUpdated: finalData.lastUpdated || new Date().toISOString(),
    profile: typeof data === "string" ? data : JSON.stringify(data),
  };

  const encrypted = await converter.encryptValue(jsonWrapCopy);
  return encrypted;
}

async function download() {
  let filename = "profile";
  try {
    let fileContent = await getEncryptedData();
    const blob = new Blob([fileContent], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    Toast.fire({ icon: "success", title: "Success" });
  } catch (e) {
    console.error(e);
    Toast.fire({ icon: "error", title: "Error while encrypting" });
  }
}

let loadedBuffer = null;

function handleFileInput() {
  const file = document.getElementById("jsonFileInput").files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    loadedBuffer = new Uint8Array(event.target.result);
    const el = document.getElementById("encryptedDataText");
    if (el)
      el.value = "Loaded profile file (" + loadedBuffer.length + " bytes)";
    decrypt();
  };

  reader.onerror = function (event) {
    console.error("File could not be read! Code " + event.target.error.code);
  };

  reader.readAsArrayBuffer(file);
}

function applyEditorType() {
  try {
    const t = document.getElementById("typeSelector");
    if (editorType.value == "advanced") {
      if (t) t.value = "adv";
      document.getElementById("decryptedData-Text").style.display = "none";
      document.getElementById("betterJSONEditor").style.display = "block";
    } else if (editorType.value == "gui") {
      if (t) t.value = "gui";
      document.getElementById("decryptedData-Text").style.display = "none";
      document.getElementById("betterJSONEditor").style.display = "none";
    }
  } catch (e) {
    console.warn("applyEditorType error", e);
  }
}

async function switchEditorType() {
  const val = document.getElementById("typeSelector").value;
  if (val == "adv") {
    editorType.value = "advanced";
    localStorage.setItem("editorType", "advanced");
  } else if (val == "gui") {
    editorType.value = "gui";
    localStorage.setItem("editorType", "gui");
  }
  applyEditorType();

  await nextTick();

  try {
    if (editorType.value == "gui") {
      let dataObj = null;
      try {
        const ed = editor.get();
        if (ed && ed.json && typeof ed.json === "object") dataObj = ed.json;
        else if (ed && ed.text) dataObj = JSON.parse(ed.text);
      } catch (e) {
      }

      if (!dataObj) {
        const txt = document.getElementById("decryptedData-Text");
        if (txt && txt.value) {
          try {
            dataObj = JSON.parse(txt.value);
          } catch (e) {
            dataObj = txt.value;
          }
        }
      }

      if (guiRef.value && guiRef.value.populateFrom && dataObj) {
        guiRef.value.populateFrom(dataObj);
      }
    }

    if (editorType.value == "advanced") {
      if (guiRef.value && guiRef.value.readToInner) {
        const obj = await guiRef.value.readToInner();
        if (obj) {
          editor.set({ json: obj });
          const txt = document.getElementById("decryptedData-Text");
          if (txt) txt.value = JSON.stringify(obj, null, 2);
        }
      } else {
        const txt = document.getElementById("decryptedData-Text");
        if (txt && txt.value) {
          try {
            const parsed = JSON.parse(txt.value);
            editor.set({ json: parsed });
          } catch (e) {
            editor.set({ text: txt.value });
          }
        }
      }
    }
  } catch (e) {
    console.warn("switchEditorType transfer error", e);
  }
}
</script>

<template>
  <div class="w-full text-center font-bold text-4xl mt-10">
    Subway City JSON editor
  </div>

  <div class="flex justify-center">
    <div class="w-full max-w-5xl flex flex-col items-center">
      <div class="w-full">
        <input
          type="file"
          class="file-input file-input-sm file-input-bordered file-input-primary w-full"
          style="margin-top: 30px; margin-left: 2.5%; width: 95%"
          accept="profile"
          id="jsonFileInput"
          @input="handleFileInput()"
        />
      </div>

      <div
        style="width: 95%; margin-top: 30px; display: flex; align-items: center"
      >
        <select
          class="select select-secondary select-sm"
          style="width: 120px; margin-bottom: 10px"
          id="typeSelector"
          @change="switchEditorType()"
        >
          <option value="adv">Advanced</option>
          <option value="gui">GUI</option>
        </select>
      </div>

      <div style="display: flex; justify-content: center; width: 100%">
        <div id="betterJSONEditor" class="jsonEditor" style="width: 95%"></div>

        <textarea
          placeholder="Decrypted data"
          class="textarea textarea-bordered textarea-lg textAreaE textarea-secondary hidden"
          style="width: 95%"
          id="decryptedData-Text"
          value="{}"
        ></textarea>

        <GuiEditor
          ref="guiRef"
          v-if="editorType === 'gui'"
          style="width: 95%"
        />
      </div>

      <div
        style="
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 30px;
        "
      >
        <button
          class="btn btn-secondary"
          style="width: 95%"
          onclick="modal_act.showModal()"
        >
          Export
        </button>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <dialog id="modal_act" class="modal modal-bottom sm:modal-middle">
    <form method="dialog" class="modal-backdrop">
      <button class="w-screen h-screen"></button>
    </form>
    <div class="modal-box w-72">
      <!-- smaller width -->
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      <div class="flex justify-center items-center my-6">
        <!-- center button -->
        <button
          class="btn"
          style="height: 140px; width: 140px"
          onclick="modal_act.close()"
          @click="download()"
        >
          <div class="flex flex-col items-center justify-center">
            <svg
              fill="currentColor"
              width="64"
              height="64"
              viewBox="-5 -5 24 24"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMinYMin"
              class="jam jam-download mb-2"
            >
              <path
                d="M8 6.641l1.121-1.12a1 1 0 0 1 1.415 1.413L7.707 9.763a.997.997 0 0 1-1.414 0L3.464 6.934A1 1 0 1 1 4.88 5.52L6 6.641V1a1 1 0 1 1 2 0v5.641zM1 12h12a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2z"
              />
            </svg>
            Save file
          </div>
        </button>
      </div>
    </div>
  </dialog>

  <input type="checkbox" id="modal_loading" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box">
      <div class="w-full flex justify-center">
        <p class="py-4">
          <span class="loading loading-spinner loading-lg"></span>
        </p>
      </div>
      <div class="w-full flex justify-center">
        <p class="py-4">Loading</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile */
@media only screen and (max-width: 1000px) {
  .textAreaE {
    height: 300px;
  }

  .jsonEditor {
    height: 65vh;
  }
}

/* Desktop */
@media only screen and (min-width: 1000px) {
  .textAreaE {
    height: 55vh;
  }

  .jsonEditor {
    height: 55vh;
  }
}
</style>
