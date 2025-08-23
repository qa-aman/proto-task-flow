import { useState } from "react";
import { X, Calendar, Clock, User, MessageSquare, Paperclip, Plus, Send, Reply, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskDetailProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (task: any) => void;
  teamMembers: any[];
}

const TaskDetail = ({ task, isOpen, onClose, onUpdate, teamMembers }: TaskDetailProps) => {
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [timeLogEntry, setTimeLogEntry] = useState("");
  const [attachToTimesheet, setAttachToTimesheet] = useState(false);
  
  const [comments, setComments] = useState([
    {
      id: 1,
      author: { name: "John Doe", initials: "JD" },
      content: "Started working on this task. Will update wireframes based on feedback.",
      timestamp: "2024-01-15 10:30",
      replies: [
        {
          id: 2,
          author: { name: "Sarah Johnson", initials: "SJ" },
          content: "Great! Let me know if you need any clarification on the requirements.",
          timestamp: "2024-01-15 11:15"
        }
      ]
    },
    {
      id: 3,
      author: { name: "Mike Wilson", initials: "MW" },
      content: "Uploaded the latest design mockups for review.",
      timestamp: "2024-01-16 14:20",
      replies: []
    }
  ]);

  const handleSave = () => {
    onUpdate(editedTask);
    onClose();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: { name: "Current User", initials: "CU" },
        content: newComment,
        timestamp: new Date().toLocaleString(),
        replies: []
      };
      
      if (replyTo) {
        const parentIndex = comments.findIndex(c => c.id === replyTo);
        if (parentIndex !== -1) {
          const updatedComments = [...comments];
          updatedComments[parentIndex].replies.push({
            id: Date.now(),
            author: { name: "Current User", initials: "CU" },
            content: newComment,
            timestamp: new Date().toLocaleString()
          });
          setComments(updatedComments);
        }
        setReplyTo(null);
      } else {
        setComments([...comments, comment]);
      }
      
      setNewComment("");
    }
  };

  const handleLogTime = () => {
    if (timeLogEntry && parseFloat(timeLogEntry) > 0) {
      const newTimeSpent = editedTask.timeSpent + parseFloat(timeLogEntry);
      setEditedTask({ ...editedTask, timeSpent: newTimeSpent });
      setTimeLogEntry("");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "border-kanban-open text-kanban-open";
      case "progress": return "border-kanban-progress text-kanban-progress";
      case "blocked": return "border-kanban-blocked text-kanban-blocked";
      case "done": return "border-kanban-done text-kanban-done";
      default: return "border-muted";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-2">
                {editedTask.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(editedTask.priority) as any}>
                  {editedTask.priority} priority
                </Badge>
                <Badge variant="outline" className={getStatusColor(editedTask.status)}>
                  {editedTask.status}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <Separator />

            {/* Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Comments</h3>
                <Badge variant="outline">{comments.length}</Badge>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start gap-3 p-4 bg-surface rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {comment.author.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 p-0 h-auto text-xs"
                          onClick={() => setReplyTo(comment.id)}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="ml-8 flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {reply.author.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">{reply.author.name}</span>
                            <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                          </div>
                          <p className="text-xs text-foreground">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="space-y-2">
                {replyTo && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Reply className="h-3 w-3" />
                    Replying to comment
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto text-xs"
                      onClick={() => setReplyTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Textarea
                    placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={handleAddComment} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Properties */}
            <div className="space-y-4">
              <h3 className="font-semibold">Task Properties</h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select 
                    value={editedTask.assignee?.id?.toString() || ""} 
                    onValueChange={(value) => {
                      const member = teamMembers.find(m => m.id.toString() === value);
                      setEditedTask({ ...editedTask, assignee: member });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editedTask.status} 
                    onValueChange={(value) => setEditedTask({ ...editedTask, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="progress">In Progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={editedTask.priority} 
                    onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={editedTask.startDate}
                      onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={editedTask.endDate}
                      onChange={(e) => setEditedTask({ ...editedTask, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Time Tracking */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Tracking
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-surface rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Time Spent</div>
                  <div className="text-2xl font-bold">{editedTask.timeSpent}h</div>
                </div>

                <div className="space-y-2">
                  <Label>Log Time (hours)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      value={timeLogEntry}
                      onChange={(e) => setTimeLogEntry(e.target.value)}
                    />
                    <Button onClick={handleLogTime} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="timesheet"
                    checked={attachToTimesheet}
                    onCheckedChange={(checked) => setAttachToTimesheet(checked as boolean)}
                  />
                  <Label htmlFor="timesheet" className="text-sm">
                    Attach to Timesheet
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* File Attachments */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments
              </h3>
              
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              
              <div className="text-sm text-muted-foreground text-center">
                No files attached
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetail;