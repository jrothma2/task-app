"use client";

import { useState, useMemo } from "react";
import { useTaskManager } from "@/hooks/useTaskManager";
import { Button } from "@/components/ui/button";
import TaskList from "@/components/TaskList";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { PlusCircle, ClipboardList, ArrowUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type SortOption = "title" | "label" | "due_date" | "none";

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("none");
  const { createTask, refreshTasks, tasks, deleteTask, toggleTaskComplete } =
    useTaskManager();

  const handleCreateTask = async (title: string, description: string) => {
    await createTask(title, description);
    await refreshTasks();
    console.log(`New Task Created: ${title}`);
    setIsDialogOpen(false);
  };

  const sortedTasks = useMemo(() => {
    if (sortBy === "none") return tasks;

    const sorted = [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "label":
          const labelA = a.label || "";
          const labelB = b.label || "";
          if (labelA === labelB) {
            // If labels are the same, sort by title
            return (a.title || "").localeCompare(b.title || "");
          }
          return labelA.localeCompare(labelB);
        case "due_date":
          // Tasks without due dates go to the end
          if (!a.due_date && !b.due_date) {
            return (a.title || "").localeCompare(b.title || "");
          }
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [tasks, sortBy]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Tasks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Enter the details for your new task below.
              </DialogDescription>
            </DialogHeader>
            <CreateTaskForm onSubmit={handleCreateTask} />
          </DialogContent>
        </Dialog>
      </div>
      {tasks.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <Label htmlFor="sort-by" className="text-sm font-medium">
                Organize by:
              </Label>
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger id="sort-by" className="w-[180px]">
                <SelectValue placeholder="Select sort option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="label">Label</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-md">
            <TaskList
              tasks={sortedTasks}
              onDelete={deleteTask}
              onToggleComplete={toggleTaskComplete}
            />
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <p className="text-gray-500">Create a Task to get started.</p>
        </div>
      )}
    </div>
  );
}
