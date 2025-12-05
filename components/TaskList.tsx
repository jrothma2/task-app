import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskRow from "./TaskRow";
import { Task } from "@/types/models";

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
  onReword: (taskId: string) => Promise<{
    original: { title: string | null; description: string | null };
    suggested: { title: string; description: string };
  }>;
  onAcceptReword: (taskId: string, title: string, description: string) => Promise<void>;
}

const TaskList = ({ tasks, onDelete, onToggleComplete, onReword, onAcceptReword }: TaskListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[50px] py-2"></TableHead>
          <TableHead className="py-2">Title</TableHead>
          <TableHead className="w-[100px] py-2">Label</TableHead>
          <TableHead className="w-[120px] py-2">Due Date</TableHead>
          <TableHead className="w-[100px] text-right py-2">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TaskRow
            key={task.task_id}
            task={task}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            onReword={onReword}
            onAcceptReword={onAcceptReword}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default TaskList;
