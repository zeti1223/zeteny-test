<script setup>
import { ref, reactive, onMounted } from 'vue';
import Settings from './components/Settings.vue';
import Timetable from './components/Timetable.vue';

const showSettings = ref(false);

// Default time settings for 8 periods
const defaultTimes = () => [
  { start: '08:00', end: '08:45' },
  { start: '09:00', end: '09:45' },
  { start: '10:00', end: '10:45' },
  { start: '11:00', end: '11:45' },
  { start: '12:00', end: '12:45' },
  { start: '13:00', end: '13:45' },
  { start: '14:00', end: '14:45' },
  { start: '15:00', end: '15:45' },
];

const timeSettings = reactive(defaultTimes());

const timetable = reactive({
  monday: Array(8).fill(null).map(() => ({ subject: '' })),
  tuesday: Array(8).fill(null).map(() => ({ subject: '' })),
  wednesday: Array(8).fill(null).map(() => ({ subject: '' })),
  thursday: Array(8).fill(null).map(() => ({ subject: '' })),
  friday: Array(8).fill(null).map(() => ({ subject: '' })),
});

function updateTimes(newTimes) {
  const oldLength = timeSettings.length;
  const newLength = newTimes.length;

  // Update timeSettings
  timeSettings.splice(0, timeSettings.length, ...newTimes);
  localStorage.setItem('timetable_times', JSON.stringify(newTimes));

  if (newLength > oldLength) {
    for (const day in timetable) {
      for (let i = 0; i < newLength - oldLength; i++) {
        timetable[day].push({ subject: '' });
      }
    }
  } else if (newLength < oldLength) {
    for (const day in timetable) {
      timetable[day].splice(newLength);
    }
  }

  // Save the updated timetable
  saveTimetable(timetable);

  showSettings.value = false;
}

function saveTimetable(newTimetable) {
  Object.assign(timetable, newTimetable);
  localStorage.setItem('timetable_data', JSON.stringify(newTimetable));
}

onMounted(() => {
  const savedTimes = localStorage.getItem('timetable_times');
  if (savedTimes) {
    const parsedTimes = JSON.parse(savedTimes);
    timeSettings.splice(0, timeSettings.length, ...parsedTimes);
  }

  const savedTimetable = localStorage.getItem('timetable_data');
  if (savedTimetable) {
    const parsedTimetable = JSON.parse(savedTimetable);
    // Ensure timetable structure matches timeSettings length
    const numLessons = timeSettings.length;
    for (const day in parsedTimetable) {
      if (parsedTimetable[day].length < numLessons) {
        for (let i = parsedTimetable[day].length; i < numLessons; i++) {
          parsedTimetable[day].push({ subject: '' });
        }
      } else if (parsedTimetable[day].length > numLessons) {
        parsedTimetable[day].splice(numLessons);
      }
    }
    Object.assign(timetable, parsedTimetable);
  } else {
    // If no saved timetable, initialize it based on timeSettings
    const numLessons = timeSettings.length;
    for (const day in timetable) {
      timetable[day] = Array(numLessons).fill(null).map(() => ({ subject: '' }));
    }
  }
});

</script>

<template>
  <div class="min-h-screen font-sans bg-gray-50">
    <header class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 shadow-lg">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-4xl font-extrabold tracking-tight">Órarend Készítő</h1>
        <button @click="showSettings = true" class="bg-white text-indigo-600 font-bold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition duration-300">
          Beállítások
        </button>
      </div>
    </header>

    <main class="container mx-auto p-8">
      <Timetable :time-settings="timeSettings" :timetable="timetable" @save-timetable="saveTimetable" />
    </main>

    <div v-if="showSettings" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
        <Settings :initial-times="timeSettings" @update-times="updateTimes" @close="showSettings = false" />
      </div>
    </div>
  </div>
</template>

<style>
body {
  background-color: #f8fafc; /* bg-gray-50 */
}
</style>