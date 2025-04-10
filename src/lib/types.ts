export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
}

export interface TimerSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}
