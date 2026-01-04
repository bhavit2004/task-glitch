import React, { useState } from 'react';
import { Task, Priority, Status } from '@/types';
import { Box, Button, MenuItem, Select, TextField } from '@mui/material';
import { useTasksContext } from '@/context/TasksContext';

interface TaskFormProps {
  initialTask?: Partial<Omit<Task, 'id' | 'createdAt'>>;
  onClose?: () => void;
}

export default function TaskForm({ initialTask, onClose }: TaskFormProps) {
  const { addTask } = useTasksContext();

  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [revenue, setRevenue] = useState(initialTask?.revenue ?? 0);
  const [timeTaken, setTimeTaken] = useState(initialTask?.timeTaken ?? 1);
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? 'Low');
  const [status, setStatus] = useState<Status>(initialTask?.status ?? 'Todo');
  const [notes, setNotes] = useState(initialTask?.notes ?? '');

  const handleSubmit = () => {
    addTask({
      title,
      revenue,
      timeTaken: timeTaken <= 0 ? 1 : timeTaken,
      priority,
      status,
      notes,
      createdAt: new Date().toISOString(),
    }); // createdAt and id handled internally
    onClose?.();
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth />
      <TextField
        label="Revenue"
        type="number"
        value={revenue}
        onChange={e => setRevenue(Number(e.target.value))}
        fullWidth
      />
      <TextField
        label="Time Taken (h)"
        type="number"
        value={timeTaken}
        onChange={e => setTimeTaken(Number(e.target.value))}
        fullWidth
      />
      <Select value={priority} onChange={e => setPriority(e.target.value as Priority)} fullWidth>
        <MenuItem value="High">High</MenuItem>
        <MenuItem value="Medium">Medium</MenuItem>
        <MenuItem value="Low">Low</MenuItem>
      </Select>
      <Select value={status} onChange={e => setStatus(e.target.value as Status)} fullWidth>
        <MenuItem value="Todo">Todo</MenuItem>
        <MenuItem value="In Progress">In Progress</MenuItem>
        <MenuItem value="Done">Done</MenuItem>
      </Select>
      <TextField
        label="Notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />
      <Button variant="contained" onClick={handleSubmit}>
        Save Task
      </Button>
    </Box>
  );
}
