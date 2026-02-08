import { useState, useEffect, useMemo, Fragment } from 'react';
import Settings from './Settings';
import Autocomplete from './Autocomplete';

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#247BA0', '#F2E205', '#F2B705', '#F29F05'];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const defaultLessonTimes = Array.from({ length: 8 }, (_, i) => ({
  start: `${(i + 8).toString().padStart(2, '0')}:00`,
  end: `${(i + 8).toString().padStart(2, '0')}:45`,
}));

const defaultClassrooms = ['101', '102', 'Tornaterem', 'Informatika'];

const timeToMinutes = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const PIXELS_PER_MINUTE = 2.0;

function App() {
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('events');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  const [lessonTimes, setLessonTimes] = useState(() => {
    const saved = localStorage.getItem('schedulePreset');
    const preset = saved ? JSON.parse(saved) : {};
    return preset.lessonTimes && preset.lessonTimes.length === 8 ? preset.lessonTimes : defaultLessonTimes;
  });
  const [classrooms, setClassrooms] = useState(() => {
    const saved = localStorage.getItem('schedulePreset');
    const preset = saved ? JSON.parse(saved) : {};
    return preset.classrooms || defaultClassrooms;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', day: 'Hétfő', lesson: '1', classroom: classrooms[0] || '' });
  const [editingEvent, setEditingEvent] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const preset = { lessonTimes, classrooms };
    localStorage.setItem('schedulePreset', JSON.stringify(preset));
  }, [lessonTimes, classrooms]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const scheduleLayout = useMemo(() => {
    return lessonTimes.map((lesson, index) => {
      const lessonDuration = timeToMinutes(lesson.end) - timeToMinutes(lesson.start);
      const lessonHeight = Math.max(20, lessonDuration * PIXELS_PER_MINUTE);

      let breakDuration = 0;
      if (index < lessonTimes.length - 1) {
        const nextLesson = lessonTimes[index + 1];
        breakDuration = timeToMinutes(nextLesson.start) - timeToMinutes(lesson.end);
      }
      const breakHeight = Math.max(0, breakDuration * PIXELS_PER_MINUTE);

      return {
        lessonHeight,
        breakHeight,
      };
    });
  }, [lessonTimes]);

  const days = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'];
  const dayMap = { 1: 'Hétfő', 2: 'Kedd', 3: 'Szerda', 4: 'Csütörtök', 5: 'Péntek' };
  const currentDay = dayMap[new Date().getDay()];

  const handleAddOrUpdateEvent = () => {
    const eventToSave = { ...newEvent, lesson: parseInt(newEvent.lesson) };
    if (editingEvent) {
      setEvents(events.map(event => event.id === editingEvent.id ? { ...event, ...eventToSave } : event));
    } else {
      setEvents([...events, { ...eventToSave, id: Date.now(), color: getRandomColor() }]);
    }
    setIsModalOpen(false);
    setNewEvent({ title: '', day: 'Hétfő', lesson: '1', classroom: classrooms[0] || '' });
    setEditingEvent(null);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({ ...event, lesson: event.lesson.toString() });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const openNewEventModal = () => {
    setEditingEvent(null);
    setNewEvent({ title: '', day: 'Hétfő', lesson: '1', classroom: classrooms[0] || '' });
    setIsModalOpen(true);
  }

  const lessonAsInt = parseInt(newEvent.lesson);
  const isSaveDisabled = 
    !newEvent.title || 
    !newEvent.classroom || 
    !Number.isInteger(lessonAsInt) || 
    lessonAsInt < 1 || 
    lessonAsInt > lessonTimes.length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Órarend</h1>
        <div className="flex items-center gap-4">
          <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-600 dark:text-gray-300" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '☀️' : '🌙'}</button>
          <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-600 dark:text-gray-300" onClick={() => setIsSettingsOpen(true)}>⚙️</button>
        </div>
      </div>

      {isSettingsOpen && <Settings lessonTimes={lessonTimes} setLessonTimes={setLessonTimes} classrooms={classrooms} setClassrooms={setClassrooms} setIsSettingsOpen={setIsSettingsOpen} />}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-40">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-96 flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{editingEvent ? 'Esemény szerkesztése' : 'Új esemény'}</h2>
            <input
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
              type="text"
              placeholder="Esemény neve"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <select className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white" value={newEvent.day} onChange={(e) => setNewEvent({ ...newEvent, day: e.target.value })}>
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <input
              className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
              type="number"
              placeholder={`Tanóra (1-${lessonTimes.length})`}
              value={newEvent.lesson}
              onChange={(e) => setNewEvent({ ...newEvent, lesson: e.target.value })}
            />
            <Autocomplete 
              options={classrooms}
              value={newEvent.classroom}
              onChange={(value) => setNewEvent({ ...newEvent, classroom: value })}
              placeholder="Terem"
            />
            <button 
              className="w-full p-3 border-none rounded-md text-white font-bold cursor-pointer mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
              onClick={handleAddOrUpdateEvent} 
              disabled={isSaveDisabled}>{editingEvent ? 'Mentés' : 'Hozzáad'}</button>
            <button 
              className="w-full p-3 border-none rounded-md text-gray-800 dark:text-white font-bold cursor-pointer bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-300"
              onClick={() => { setIsModalOpen(false); setEditingEvent(null); }}>Mégse</button>
          </div>
        </div>
      )}

      <div className="flex-grow flex overflow-auto">
        <div className="flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 sticky left-0 z-20">
          <div className="h-12 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 bg-white dark:bg-gray-800"></div>
          {lessonTimes.map((time, index) => (
            <Fragment key={index}>
              <div className="flex flex-col justify-center items-center p-2 px-4 box-border border-b border-gray-200 dark:border-gray-700" style={{ minWidth: '150px', height: scheduleLayout[index].lessonHeight }}>
                <div className="font-bold text-lg text-gray-800 dark:text-white">{index + 1}. óra</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{time.start} - {time.end}</div>
              </div>
              {index < lessonTimes.length - 1 && (
                <div className="flex justify-center items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 box-border border-b border-dashed border-gray-200 dark:border-gray-700" style={{ height: scheduleLayout[index].breakHeight }}>
                  {scheduleLayout[index].breakHeight > 15 && 'Szünet'}
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <div className="flex flex-grow">
          {days.map(day => (
            <div key={day} className={`flex-1 min-w-[150px] border-l border-gray-200 dark:border-gray-700 ${day === currentDay ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <div className="text-center font-bold py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 h-12 sticky top-0 z-10 text-gray-800 dark:text-white">{day}</div>
              {lessonTimes.map((_, index) => (
                <Fragment key={index}>
                  <div className="box-border border-b border-gray-200 dark:border-gray-700 p-1" style={{ height: scheduleLayout[index].lessonHeight }}>
                    {events
                      .filter(event => event.day === day && event.lesson === (index + 1))
                      .map((event) => (
                        <div key={event.id} className="text-white p-2 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap flex justify-between items-center h-full box-border shadow-lg" style={{ backgroundColor: event.color }}>
                          <div className="flex flex-col gap-1">
                            <div className="font-bold text-base">{event.title}</div>
                            <div className="text-sm opacity-90">{event.classroom}</div>
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-transparent border-none text-white cursor-pointer p-0 text-lg opacity-80 hover:opacity-100" onClick={() => handleEditEvent(event)}>✏️</button>
                            <button className="bg-transparent border-none text-white cursor-pointer p-0 text-lg opacity-80 hover:opacity-100" onClick={() => handleDeleteEvent(event.id)}>🗑️</button>
                          </div>
                        </div>
                      ))}
                  </div>
                  {index < lessonTimes.length - 1 && (
                    <div className="box-border border-b border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50" style={{ height: scheduleLayout[index].breakHeight }}></div>
                  )}
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
       <button className="bg-blue-600 text-white py-3 px-5 rounded-full cursor-pointer text-lg fixed bottom-6 right-6 z-50 hover:bg-blue-700 shadow-lg transition-transform transform hover:scale-105" onClick={openNewEventModal}>+</button>
    </div>
  );
}

export default App;