"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles } from "lucide-react";
import { Task } from "@/types/models";

interface RewordTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReword: (taskId: string) => Promise<{
    original: { title: string | null; description: string | null };
    suggested: { title: string; description: string };
  }>;
  onAccept: (taskId: string, title: string, description: string) => Promise<void>;
}

export function RewordTaskDialog({
  task,
  open,
  onOpenChange,
  onReword,
  onAccept,
}: RewordTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    original: { title: string | null; description: string | null };
    suggested: { title: string; description: string };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSuggestions(null);
      setError(null);
      setIsLoading(false);
      setIsAccepting(false);
    }
  }, [open]);

  const handleReword = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onReword(task.task_id);
      setSuggestions(result);
    } catch (err: any) {
      setError(err.message || "Failed to get AI suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!suggestions) return;
    setIsAccepting(true);
    try {
      await onAccept(
        task.task_id,
        suggestions.suggested.title,
        suggestions.suggested.description
      );
      onOpenChange(false);
      setSuggestions(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to update task");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSuggestions(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Reword Task with AI
          </DialogTitle>
          <DialogDescription>
            Get AI suggestions to improve the clarity and professionalism of
            your task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!suggestions && !isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Click the button below to get AI suggestions for rewording this
                task.
              </p>
              <Button onClick={handleReword} disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Suggestions
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                AI is analyzing your task...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {suggestions && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    Original Title
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {suggestions.original.title || "(No title)"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 text-primary">
                    AI Suggested Title
                  </h4>
                  <p className="text-sm bg-primary/10 p-3 rounded-md border border-primary/20">
                    {suggestions.suggested.title}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    Original Description
                  </h4>
                  <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {suggestions.original.description || "(No description)"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 text-primary">
                    AI Suggested Description
                  </h4>
                  <p className="text-sm bg-primary/10 p-3 rounded-md border border-primary/20 whitespace-pre-wrap">
                    {suggestions.suggested.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {suggestions && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setSuggestions(null);
                  setError(null);
                }}
                disabled={isAccepting}
              >
                Get New Suggestions
              </Button>
              <Button onClick={handleAccept} disabled={isAccepting}>
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Accept Suggestions"
                )}
              </Button>
            </>
          )}
          {!suggestions && !isLoading && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

