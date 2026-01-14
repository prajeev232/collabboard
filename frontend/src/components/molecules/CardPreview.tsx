import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { CardPriority } from "../../api/cards";

type Props = {
  title: string;
  description?: string; // kept for compatibility, not shown in preview
  priority?: CardPriority;
  dueDate?: string | null;
  onClick?: () => void;
};

const priorityChipColor = (p: CardPriority): "default" | "warning" | "error" | "success" => {
  switch (p) {
    case "LOW":
      return "success";
    case "MEDIUM":
      return "warning";
    case "HIGH":
      return "error";
  }
};

const startOfLocalDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getDueMeta = (iso?: string | null) => {
  if (!iso) return { label: null as string | null, isOverdue: false, isToday: false };

  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return { label: null, isOverdue: false, isToday: false };

  const today = startOfLocalDay(new Date());
  const dueDay = startOfLocalDay(due);

  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  const isToday = diffDays === 0;
  const isOverdue = diffDays < 0;

  let label = dueDay.toLocaleDateString();
  if (diffDays === 0) label = "Today";
  else if (diffDays === 1) label = "Tomorrow";
  else if (diffDays === -1) label = "Yesterday";

  return { label, isOverdue, isToday };
};

const priorityLabel = (p?: CardPriority) => p ?? "MEDIUM";

const CardPreview = ({ title, priority, dueDate, onClick }: Props) => {
  const due = getDueMeta(dueDate);

  return (
    <Card variant="outlined" sx={{ bgcolor: "common.white", borderRadius: 0 }}>
      <CardActionArea onClick={onClick} disabled={!onClick}>
        <CardContent sx={{ py: 1.25, "&:last-child": { pb: 1.25 } }}>
          {/* Row 1: Title */}
          <Typography fontWeight={800} sx={{ wordBreak: "break-word" }}>
            {title}
          </Typography>

          {/* Row 2: Due date (left) + Priority (right) */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 0.75 }}>
            {due.label ? (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: due.isOverdue ? 800 : 600,
                  color: due.isOverdue ? "error.main" : due.isToday ? "warning.main" : "text.secondary",
                  whiteSpace: "nowrap",
                }}
              >
                {due.isOverdue ? "⚠ Overdue: " : "Due: "}
                {due.label}
              </Typography>
            ) : (
              // keeps layout stable even when no due date
              <Box />
            )}

            <Chip
              size="small"
              label={priorityLabel(priority)}
              color={priority ? priorityChipColor(priority) : "default"}
              variant="filled"
              sx={{ height: 22, borderRadius: 1 }}
            />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CardPreview;
