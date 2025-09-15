import React, { useRef, useState } from "react";

const addMinutes = (time, minutes) => {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
};

const Settings = ({
  lessonTimes,
  setLessonTimes,
  classrooms,
  setClassrooms,
  setIsSettingsOpen,
}) => {
  const fileInputRef = useRef(null);
  const [newClassroom, setNewClassroom] = useState("");

  const handleTimeChange = (index, type, value) => {
    const newLessonTimes = [...lessonTimes];
    if (type === "start") {
      newLessonTimes[index].start = value;
      newLessonTimes[index].end = addMinutes(value, 45);
    } else {
      newLessonTimes[index].end = value;
    }
    setLessonTimes(newLessonTimes);
  };

  const handleSavePreset = () => {
    const preset = { lessonTimes, classrooms };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(preset, null, 2),
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "orarend-preset.json";
    link.click();
  };

  const handleLoadPreset = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedPreset = JSON.parse(e.target.result);
        if (
          loadedPreset.lessonTimes &&
          Array.isArray(loadedPreset.lessonTimes) &&
          loadedPreset.lessonTimes.length === 8 &&
          loadedPreset.lessonTimes.every((t) => t.start && t.end) &&
          Array.isArray(loadedPreset.classrooms)
        ) {
          setLessonTimes(loadedPreset.lessonTimes);
          setClassrooms(loadedPreset.classrooms);
        } else {
          alert("Érvénytelen preset fájl.");
        }
      } catch (error) {
        alert("Hiba a fájl beolvasása közben.");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadClick = () => {
    fileInputRef.current.click();
  };

  const handleAddClassroom = () => {
    if (newClassroom && !classrooms.includes(newClassroom)) {
      setClassrooms([...classrooms, newClassroom]);
      setNewClassroom("");
    }
  };

  const handleNewClassroomKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddClassroom();
    }
  };

  const handleRemoveClassroom = (roomToRemove) => {
    setClassrooms(classrooms.filter((room) => room !== roomToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Beállítások
        </h2>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Tanórák időpontjai
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessonTimes.map((time, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <label className="w-24 font-bold text-gray-600 dark:text-gray-300">
                  {index + 1}. óra
                </label>
                <input
                  className="p-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-gray-800 dark:text-white"
                  type="time"
                  value={time.start}
                  onChange={(e) =>
                    handleTimeChange(index, "start", e.target.value)
                  }
                />
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <input
                  className="p-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-gray-800 dark:text-white"
                  type="time"
                  value={time.end}
                  onChange={(e) =>
                    handleTimeChange(index, "end", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Termek
          </h3>
          <div className="flex flex-col gap-2 mb-4">
            {classrooms.map((room) => (
              <div
                key={room}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {room}
                </span>
                <button
                  className="bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600 transition-colors"
                  onClick={() => handleRemoveClassroom(room)}
                >
                  Törlés
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
              type="text"
              value={newClassroom}
              onChange={(e) => setNewClassroom(e.target.value)}
              onKeyDown={handleNewClassroomKeyDown}
              placeholder="Új terem neve"
            />
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 font-semibold transition-colors"
              onClick={handleAddClassroom}
            >
              Hozzáad
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className="py-3 px-4 border-none rounded-lg cursor-pointer font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            onClick={handleSavePreset}
          >
            Beállítások mentése
          </button>
          <button
            className="py-3 px-4 border-none rounded-lg cursor-pointer font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors"
            onClick={handleLoadClick}
          >
            Beállítások betöltése
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLoadPreset}
            accept=".json"
            style={{ display: "none" }}
          />
        </div>
        <button
          className="w-full py-3 mt-4 border-none rounded-lg cursor-pointer font-bold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          onClick={() => setIsSettingsOpen(false)}
        >
          Bezár
        </button>
      </div>
    </div>
  );
};

export default Settings;
