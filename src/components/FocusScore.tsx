import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface FocusScoreProps {
  focusHistory: { date: string; completed: number }[];
}

const FocusScore = ({ focusHistory }: FocusScoreProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [focusScore, setFocusScore] = useState(0);

  useEffect(() => {
    // Calculate streak
    let currentStreak = 0;
    const sortedHistory = [...focusHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedHistory.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = sortedHistory.find((h) => h.date === today);
      setTodayCount(todayEntry?.completed || 0);

      const hasEntryToday = todayEntry && todayEntry.completed > 0;

      if (hasEntryToday) {
        currentStreak = 1;

        const checkDate = new Date();

        for (let i = 1; i < 100; i++) {
          // Limit to avoid infinite loop
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toISOString().split('T')[0];
          const entry = sortedHistory.find((h) => h.date === dateStr);

          if (entry && entry.completed > 0) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    setStreak(currentStreak);

    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      const entry = focusHistory.find((h) => h.date === dateStr);
      last7Days.push({
        day: dayName,
        pomodoros: entry?.completed || 0,
      });
    }

    setChartData(last7Days);

    // Score formula: (streak * 10) + (average daily pomodoros * 5)
    const totalPomodoros = focusHistory.reduce(
      (sum, day) => sum + day.completed,
      0
    );
    const avgPomodoros =
      focusHistory.length > 0
        ? totalPomodoros / Math.min(focusHistory.length, 7)
        : 0;

    const score = Math.round(currentStreak * 10 + avgPomodoros * 5);
    setFocusScore(score);
  }, [focusHistory]);

  const getScoreLevel = (score: number) => {
    if (score >= 100) return { label: 'Master', color: 'bg-green-500' };
    if (score >= 70) return { label: 'Expert', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'Intermediate', color: 'bg-yellow-500' };
    if (score >= 20) return { label: 'Beginner', color: 'bg-orange-500' };
    return { label: 'Novice', color: 'bg-slate-500' };
  };

  const scoreLevel = getScoreLevel(focusScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex justify-between items-center'>
          <span>Focus Score</span>
          <Badge className={scoreLevel.color}>{scoreLevel.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-center mb-6'>
          <div className='text-5xl font-bold'>{focusScore}</div>
          <p className='text-sm text-muted-foreground mt-1'>
            Your productivity score
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-6'>
          <div className='bg-slate-100 rounded-lg p-3 text-center'>
            <div className='text-2xl font-bold'>{streak}</div>
            <p className='text-xs text-muted-foreground'>Day streak</p>
          </div>
          <div className='bg-slate-100 rounded-lg p-3 text-center'>
            <div className='text-2xl font-bold'>{todayCount}</div>
            <p className='text-xs text-muted-foreground'>Today's pomodoros</p>
          </div>
        </div>

        <div className='h-[180px] mt-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis dataKey='day' fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip
                formatter={(value) => [`${value} pomodoros`, 'Completed']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar
                dataKey='pomodoros'
                fill='#6366f1'
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='mt-4 text-xs text-muted-foreground text-center'>
          <p>
            Focus Score is calculated based on your streak and daily completion
            rate
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FocusScore;
