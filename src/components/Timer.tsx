import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

import { CircularProgressbarWithChildren } from 'react-circular-progressbar';

// import sound from "./../../public/notification.wav"

import type { TimerSettings, Task } from '@/lib/types';

interface TimerProps {
  settings: TimerSettings;
  currentTask: Task | null;
  onComplete: (taskId: string) => void;
}

type TimerMode = 'work' | 'break' | 'longBreak';

const Timer = ({ settings, currentTask, onComplete }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [progress, setProgress] = useState(100);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const totalTime = useRef(settings.workDuration * 60);

  useEffect(() => {
    try {
      audioRef.current = new Audio();
      audioRef.current.src = './../../public/notification.wav';

      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  useEffect(() => {
    if (mode === 'work') {
      setTimeLeft(settings.workDuration * 60);
      totalTime.current = settings.workDuration * 60;
    } else if (mode === 'break') {
      setTimeLeft(settings.breakDuration * 60);
      totalTime.current = settings.breakDuration * 60;
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
      totalTime.current = settings.longBreakDuration * 60;
    }
    setProgress(100);
  }, [settings, mode]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          setProgress((newTime / totalTime.current) * 100);
          return newTime;
        });
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error('Error playing notification sound:', err);
        });
      }

      if (mode === 'work') {
        // Completed a work session
        setCompletedSessions((prev) => prev + 1);

        if (currentTask) {
          onComplete(currentTask.id);
        }

        // Determine if it's time for a long break
        if ((completedSessions + 1) % settings.longBreakInterval === 0) {
          setMode('longBreak');
        } else {
          setMode('break');
        }
      } else {
        // Break is over, back to work
        setMode('work');
      }

      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    timeLeft,
    mode,
    settings,
    completedSessions,
    currentTask,
    onComplete,
  ]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setTimeLeft(settings.workDuration * 60);
    } else if (mode === 'break') {
      setTimeLeft(settings.breakDuration * 60);
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
    }
    setProgress(100);
  };

  const skipToNext = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMode('break');
    } else {
      setMode('work');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <Card className='shadow-md w-[400px]'>
      <CardContent className='pt-6'>
        <div className='flex justify-between items-center mb-4'>
          <Badge
            variant={mode === 'work' ? 'default' : 'secondary'}
            className='text-sm'
          >
            {mode === 'work'
              ? 'Focus Time'
              : mode === 'break'
              ? 'Short Break'
              : 'Long Break'}
          </Badge>
          <div className='text-sm text-muted-foreground'>
            Sessions: {completedSessions}
          </div>
        </div>

        {currentTask && (
          <div className='mb-4 text-center'>
            <p className='text-sm text-muted-foreground'>Current Task:</p>
            <p className='font-medium truncate'>{currentTask.title}</p>
          </div>
        )}

        {/* <Progress value={progress} className='h-2 mb-6' /> */}
        <CircularProgressbarWithChildren
          strokeWidth={2}
          value={progress}
          styles={{
            // Customize the root svg element
            root: {},
            // Customize the path, i.e. the "completed progress"
            path: {
              // Path color
              stroke: `rgba(62, 152, 199, ${progress / 100})`,
              // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
              strokeLinecap: 'butt',
              // Customize transition animation
              transition: 'stroke-dashoffset 0.5s ease 0s',
              // Rotate the path
              transform: 'rotate(0.25turn)',
              transformOrigin: 'center center',
            },
            // Customize the circle behind the path, i.e. the "total progress"
            trail: {
              // Trail color
              stroke: '#d6d6d6',
              // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
              strokeLinecap: 'butt',
              // Rotate the trail
              transform: 'rotate(0.25turn)',
              transformOrigin: 'center center',
            },
            // Customize the text
            // text: {
            //   // Text color
            //   fill: '#f88',
            //   // Text size
            //   fontSize: '14px',
            // },
            // Customize background - only used when the `background` prop is true
            background: {
              fill: '#3e98c7',
            },
          }}
        >
          <div className='text-4xl font-bold '>{formatTime(timeLeft)}</div>
        </CircularProgressbarWithChildren>
        <div className='text-center my-4'>
          <div className='flex justify-center gap-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={resetTimer}
              aria-label='Reset timer'
            >
              <RotateCcw className='h-4 w-4' />
            </Button>

            <Button
              size='lg'
              onClick={toggleTimer}
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
              className='px-8'
            >
              {isActive ? (
                <Pause className='h-5 w-5' />
              ) : (
                <Play className='h-5 w-5' />
              )}
            </Button>

            <Button
              variant='outline'
              size='icon'
              onClick={skipToNext}
              aria-label='Skip to next'
            >
              <SkipForward className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timer;
