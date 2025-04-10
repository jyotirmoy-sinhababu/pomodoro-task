import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { TimerSettings } from '@/lib/types';

interface SettingsProps {
  settings: TimerSettings;
  setSettings: React.Dispatch<React.SetStateAction<TimerSettings>>;
}

const Settings = ({ settings, setSettings }: SettingsProps) => {
  const [workDuration, setWorkDuration] = useState(
    settings.workDuration.toString()
  );
  const [breakDuration, setBreakDuration] = useState(
    settings.breakDuration.toString()
  );
  const [longBreakDuration, setLongBreakDuration] = useState(
    settings.longBreakDuration.toString()
  );
  const [longBreakInterval, setLongBreakInterval] = useState(
    settings.longBreakInterval.toString()
  );

  const handleSaveSettings = () => {
    setSettings({
      workDuration: Number.parseInt(workDuration) || 25,
      breakDuration: Number.parseInt(breakDuration) || 5,
      longBreakDuration: Number.parseInt(longBreakDuration) || 15,
      longBreakInterval: Number.parseInt(longBreakInterval) || 4,
    });
  };
  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='work-duration'>Work Duration (minutes)</Label>
            <Input
              id='work-duration'
              type='number'
              min='1'
              value={workDuration}
              onChange={(e) => setWorkDuration(e.target.value)}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='break-duration'>Break Duration (minutes)</Label>
            <Input
              id='break-duration'
              type='number'
              min='1'
              value={breakDuration}
              onChange={(e) => setBreakDuration(e.target.value)}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='long-break-duration'>
              Long Break Duration (minutes)
            </Label>
            <Input
              id='long-break-duration'
              type='number'
              min='1'
              value={longBreakDuration}
              onChange={(e) => setLongBreakDuration(e.target.value)}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='long-break-interval'>
              Long Break Interval (sessions)
            </Label>
            <Input
              id='long-break-interval'
              type='number'
              min='1'
              value={longBreakInterval}
              onChange={(e) => setLongBreakInterval(e.target.value)}
            />
          </div>

          <Button className='w-full' onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Settings;
