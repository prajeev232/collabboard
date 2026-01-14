import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
    boardName?: string;
    loading: boolean;
    error?: string | null;
    onRefresh: () => void;
    children: ReactNode;
}

const BoardTemplate = ({ boardName, loading, error, onRefresh, children }: Props) => {
    return (
        <Box sx={{ px: 1, height: "100vh", display: "flex", flexDirection: "column" }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={800} sx={{ flex: 1 }}>
                    {boardName ?? "Board"}
                </Typography>

                <Button variant="outlined" onClick={onRefresh} disabled={loading}>
                    Refresh
                </Button>
            </Stack>

            {loading && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 2 }}>
                    <CircularProgress size={20} />
                    <Typography color="text.secondary">Loading snapshot...</Typography>
                </Stack>
            )}

            {error && (
                <Box sx={{ p: 2, border: "1px solid", borderColor: "error.light", bgcolor: "error.50", borderRadius: 2 }}>
                    <Typography fontWeight={700} color="error.main">
                        Failed to load board
                    </Typography>
                    <Typography color="error.main" sx={{ mt: 0.5 }}>
                        {error}
                    </Typography>
                </Box>
            )}

            {!loading && !error && (
                <Box sx={{ flex: 1, minHeight: 0 }}>
                    {children}
                </Box>
            )}
        </Box>
    )
}

export default BoardTemplate;