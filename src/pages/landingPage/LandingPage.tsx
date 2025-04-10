import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task, TimerSettings } from '@/lib/types';

import Settings from '@/components/Settings';
import TaskList from '@/components/TaskList';
import FocusScore from '@/components/FocusScore';
import Timer from '@/components/Timer';

const LandingPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  });
  const [focusHistory, setFocusHistory] = useState<
    { date: string; completed: number }[]
  >([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('pomodoro-tasks');
    const savedSettings = localStorage.getItem('pomodoro-settings');
    const savedHistory = localStorage.getItem('pomodoro-history');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSettings) setTimerSettings(JSON.parse(savedSettings));
    if (savedHistory) setFocusHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(timerSettings));
  }, [timerSettings]);

  useEffect(() => {
    localStorage.setItem('pomodoro-history', JSON.stringify(focusHistory));
  }, [focusHistory]);

  const handleTaskComplete = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
          : task
      )
    );

    // Updating focus history
    const today = new Date().toISOString().split('T')[0];
    const historyIndex = focusHistory.findIndex((h) => h.date === today);

    if (historyIndex >= 0) {
      const newHistory = [...focusHistory];
      newHistory[historyIndex] = {
        ...newHistory[historyIndex],
        completed: newHistory[historyIndex].completed + 1,
      };
      setFocusHistory(newHistory);
    } else {
      setFocusHistory([...focusHistory, { date: today, completed: 1 }]);
    }
  };

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <h1 className='text-3xl font-bold text-center mb-8'>Pomodoro Focus</h1>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2'>
          <Timer
            settings={timerSettings}
            currentTask={currentTask}
            onComplete={handleTaskComplete}
          />

          <Tabs defaultValue='tasks' className='mt-8 '>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='tasks'>Tasks</TabsTrigger>
              <TabsTrigger value='settings'>Settings</TabsTrigger>
            </TabsList>
            <TabsContent value='tasks'>
              <TaskList
                tasks={tasks}
                setTasks={setTasks}
                currentTask={currentTask}
                setCurrentTask={setCurrentTask}
              />
            </TabsContent>
            <TabsContent value='settings'>
              <Settings
                settings={timerSettings}
                setSettings={setTimerSettings}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className='bg-slate-50 rounded-lg p-4'>
          <FocusScore focusHistory={focusHistory} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
