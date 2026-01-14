import { Box, Typography } from '@mui/material';

const EmptyCards = () => {
    return (
        <Box 
        sx = {{
            p: 2,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "grey.300",
            bgcolor: "common.white",
        }}
        >
            <Typography fontWeight={700}>No cards</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Add a new card to get started
            </Typography>
        </Box>
    );
}

export default EmptyCards;