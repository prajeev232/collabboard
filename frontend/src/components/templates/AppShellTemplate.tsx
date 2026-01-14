import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";
import Header from "../organisms/Header";
import ProfileMenu from "../organisms/ProfileMenu";

type Props = {
  title?: string;

  headerLeft?: ReactNode;
  headerRight?: ReactNode;

  homeHref?: string;
  children: ReactNode;
};

const AppShellTemplate = ({
  title = "CollabBoard",
  headerLeft,
  headerRight,
  homeHref = "/",
  children,
}: Props) => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f9fc" }}>
      <Header
        title={title}
        left={headerLeft}
        right={headerRight ?? <ProfileMenu />}
        homeHref={homeHref}
      />

      <Container maxWidth={false} sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppShellTemplate;
