import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  homeHref?: string;
};

const Header = ({ title = "CollabBoard", left, right, homeHref = "/" }: Props) => {
  const nav = useNavigate();
  const onHome = () => nav(homeHref);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        bgcolor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          px: { xs: 2, md: 3 },
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={900}
          onClick={onHome}
          title="Go to boards"
          sx={{
            cursor: "pointer",
            userSelect: "none",
            letterSpacing: -0.2,
            "&:hover": { opacity: 0.85 },
          }}
        >
          {title}
        </Typography>

        {left && <Box sx={{ display: "flex", alignItems: "center" }}>{left}</Box>}

        <Box sx={{ flex: 1 }} />

        {right && <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{right}</Box>}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
