<script setup>
import { ref } from 'vue';

const props = defineProps({
  timeSettings: Array,
  timetable: Object
});

const emit = defineEmits(['save-timetable']);

const days = {
  monday: 'Hétfő',
  tuesday: 'Kedd',
  wednesday: 'Szerda',
  thursday: 'Csütörtök',
  friday: 'Péntek',
};

function saveTimetable() {
  emit('save-timetable', props.timetable);
}
</script>

<template>
  <div class="bg-white p-8 rounded-2xl shadow-xl overflow-x-auto">
    <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">Heti Órarend</h2>
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-indigo-500 text-white">
          <th class="p-4 font-bold uppercase tracking-wider border-b-2 border-indigo-600">Idő</th>
          <th v-for="dayName in Object.values(days)" :key="dayName" class="p-4 font-bold uppercase tracking-wider border-b-2 border-indigo-600 hidden md:table-cell">{{ dayName }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(time, index) in timeSettings" :key="index" class="transition-colors hover:bg-gray-50">
          <td class="p-4 text-gray-800 border-b border-gray-200 text-center font-semibold">
            <div class="text-lg">{{ time.start }}</div>
            <div class="text-xs text-gray-500">-</div>
            <div class="text-lg">{{ time.end }}</div>
          </td>
          <td v-for="(day, dayKey) in timetable" :key="dayKey" class="p-1 border-b border-gray-200">
            <input
              type="text"
              v-model="day[index].subject"
              @input="saveTimetable"
              class="w-full h-full p-3 text-center bg-transparent focus:bg-indigo-50 focus:outline-none rounded-lg transition-colors"
              :placeholder="days[dayKey]"
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>