import { Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Task } from '@/types';

interface TaskTableProps {
  tasks: Task[];
  onAdd: (task: Omit<Task, 'id'>) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function TaskTable({ tasks, onUpdate, onDelete }: TaskTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Revenue</TableCell>
          <TableCell>Time (h)</TableCell>
          <TableCell>ROI</TableCell>
          <TableCell>Priority</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map(task => (
          <TableRow key={task.id}>
            <TableCell>{task.title}</TableCell>
            <TableCell>${task.revenue.toLocaleString()}</TableCell>
            <TableCell>{task.timeTaken}</TableCell>
            <TableCell>{task.revenue && task.timeTaken ? (task.revenue / task.timeTaken).toFixed(1) : '-'}</TableCell>
            <TableCell>{task.priority}</TableCell>
            <TableCell>{task.status}</TableCell>
            <TableCell>
              <IconButton
                onClick={e => {
                  e.stopPropagation(); // Prevent row click
                  onUpdate(task.id, {}); // Open edit dialog
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={e => {
                  e.stopPropagation(); // Prevent row click
                  onDelete(task.id); // Open delete confirmation
                }}
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
