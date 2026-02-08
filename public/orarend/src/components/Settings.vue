<script setup>
import { ref, reactive, onMounted, watch } from 'vue';

const props = defineProps({
  initialTimes: Array
});

const emit = defineEmits(['update-times', 'close']);

const localTimes = reactive(JSON.parse(JSON.stringify(props.initialTimes)));

watch(() => props.initialTimes, (newVal) => {
  Object.assign(localTimes, JSON.parse(JSON.stringify(newVal)));
}, { deep: true });

const presets = ref({});
const presetName = ref('');
const selectedPreset = ref('');

onMounted(() => {
  const savedPresets = localStorage.getItem('timetable_presets');
  if (savedPresets) {
    presets.value = JSON.parse(savedPresets);
  }
});

function applyChanges() {
  emit('update-times', JSON.parse(JSON.stringify(localTimes)));
}

function savePreset() {
  if (!presetName.value) {
    alert('Kérlek adj meg egy nevet a presetnek!');
    return;
  }
  const newPresets = { ...presets.value, [presetName.value]: JSON.parse(JSON.stringify(localTimes)) };
  presets.value = newPresets;
  localStorage.setItem('timetable_presets', JSON.stringify(newPresets));
  presetName.value = '';
  alert('Preset elmentve!');
}

function loadPreset() {
  if (!selectedPreset.value) return;
  const loadedTimes = presets.value[selectedPreset.value];
  if (loadedTimes) {
    Object.assign(localTimes, loadedTimes);
    applyChanges();
  }
}

function addLesson() {
  const lastTime = localTimes[localTimes.length - 1];
  let newStart = new Date(`1970-01-01T08:00`);
  if(lastTime) {
    newStart = new Date(`1970-01-01T${lastTime.end}`);
    newStart.setMinutes(newStart.getMinutes() + 15); // 15 minutes break
  }
  const newEnd = new Date(newStart.getTime());
  newEnd.setMinutes(newEnd.getMinutes() + 45); // 45 minutes lesson

  const formatTime = (date) => date.toTimeString().slice(0, 5);

  localTimes.push({ start: formatTime(newStart), end: formatTime(newEnd) });
}

function removeLesson(index) {
  localTimes.splice(index, 1);
}

</script>
<template>
  <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg relative">
    <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Beállítások</h2>

    <!-- Time Settings -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">Időpontok</h3>
      <div v-for="(time, index) in localTimes" :key="index" class="grid grid-cols-4 gap-4 items-center mb-3">
        <label class="font-medium text-gray-600 text-right">Óra {{ index + 1 }}:</label>
        <input type="time" v-model="time.start" class="p-3 border border-gray-300 rounded-lg col-span-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        <input type="time" v-model="time.end" class="p-3 border border-gray-300 rounded-lg col-span-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        <button @click="removeLesson(index)" class="text-red-500 hover:text-red-700 justify-self-center">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
      </div>
      <button @click="addLesson" class="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">
        Új óra hozzáadása
      </button>
      <button @click="applyChanges" class="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg">
        Alkalmaz
      </button>
    </div>

    <!-- Presets -->
    <div>
      <h3 class="text-xl font-semibold mb-4 text-gray-700">Presetek</h3>
      <div class="flex gap-4 mb-4">
        <input type="text" v-model="presetName" placeholder="Preset neve..." class="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        <button @click="savePreset" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg">
          Mentés
        </button>
      </div>
      <div class="flex gap-4">
        <select v-model="selectedPreset" class="flex-grow p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option disabled value="">Válassz presetet...</option>
          <option v-for="(preset, name) in presets" :key="name" :value="name">{{ name }}</option>
        </select>
        <button @click="loadPreset" class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg">
          Betöltés
        </button>
      </div>
    </div>
  </div>
</template>