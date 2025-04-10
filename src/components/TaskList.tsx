import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Edit, Trash, Play } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentTask: Task | null;
  setCurrentTask: React.Dispatch<React.SetStateAction<Task | null>>;
}

const TaskList = ({
  tasks,
  setTasks,
  currentTask,
  setCurrentTask,
}: TaskListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState('1');

  const openNewTaskDialog = () => {
    setEditingTask(null);
    setTaskTitle('');
    setEstimatedPomodoros('1');
    setIsDialogOpen(true);
  };

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setEstimatedPomodoros(task.estimatedPomodoros.toString());
    setIsDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) return;

    if (editingTask) {
      // Update existing task
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: taskTitle,
                estimatedPomodoros: Number.parseInt(estimatedPomodoros) || 1,
              }
            : task
        )
      );

      // Update current task if it's the one being edited
      if (currentTask && currentTask.id === editingTask.id) {
        setCurrentTask({
          ...currentTask,
          title: taskTitle,
          estimatedPomodoros: Number.parseInt(estimatedPomodoros) || 1,
        });
      }
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskTitle,
        estimatedPomodoros: Number.parseInt(estimatedPomodoros) || 1,
        completedPomodoros: 0,
      };
      setTasks([...tasks, newTask]);
    }

    setIsDialogOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));

    // If deleting the current task, clear it
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask(null);
    }
  };

  const handleSetCurrentTask = (task: Task) => {
    setCurrentTask(task);
  };
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Tasks</CardTitle>
        <Button size='sm' onClick={openNewTaskDialog}>
          <Plus className='h-4 w-4 mr-2' />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className='text-center py-6 text-muted-foreground'>
            No tasks yet. Add a task to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead className='w-[100px] text-right'>Progress</TableHead>
                <TableHead className='w-[80px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  className={currentTask?.id === task.id ? 'bg-slate-50' : ''}
                >
                  <TableCell>
                    <div className='font-medium'>{task.title}</div>
                    <div className='text-sm text-muted-foreground'>
                      {task.completedPomodoros} / {task.estimatedPomodoros}{' '}
                      pomodoros
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>
                    <Progress
                      value={
                        (task.completedPomodoros / task.estimatedPomodoros) *
                        100
                      }
                      className='h-2'
                    />
                  </TableCell>
                  <TableCell>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleSetCurrentTask(task)}
                        disabled={currentTask?.id === task.id}
                      >
                        <Play className='h-4 w-4' />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => openEditTaskDialog(task)}
                          >
                            <Edit className='h-4 w-4 mr-2' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.id)}
                            className='text-destructive'
                          >
                            <Trash className='h-4 w-4 mr-2' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='task-title'>Task Title</Label>
                <Input
                  id='task-title'
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder='What are you working on?'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='estimated-pomodoros'>Estimated Pomodoros</Label>
                <Input
                  id='estimated-pomodoros'
                  type='number'
                  min='1'
                  value={estimatedPomodoros}
                  onChange={(e) => setEstimatedPomodoros(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask}>
                {editingTask ? 'Save Changes' : 'Add Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TaskList;
