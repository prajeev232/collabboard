import { useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { clearAccessToken } from "../../api/http";
import { useNavigate } from "react-router-dom";

const AVATAR_KEY = "collab_avatar_data_url";

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

type Props = {
  /** Optional label next to avatar (ex: user name/email). */
  label?: string;

  /** Where to redirect after logout */
  loginHref?: string;

  /** Called when user clicks Settings (for now you can just toast) */
  onSettings?: () => void;
};

const ProfileMenu = ({ label, loginHref = "/login", onSettings }: Props) => {
  const nav = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const avatarSrc = useMemo(() => {
    return localStorage.getItem(AVATAR_KEY);
  }, []);

  const [localAvatar, setLocalAvatar] = useState<string | null>(avatarSrc);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    clearAccessToken();
    handleClose();
    window.location.href = loginHref;
  };

  const handleSettings = () => {
    handleClose();
    onSettings?.();
  };

  const handlePickPhoto = () => {
    handleClose();
    fileRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-select same file
    if (!file) return;

    // basic validation
    if (!file.type.startsWith("image/")) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      localStorage.setItem(AVATAR_KEY, dataUrl);
      setLocalAvatar(dataUrl);
    } catch {
      // ignore for now; you can add a toast callback if you want
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {/* hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFileChange}
      />

      {label && (
        <Typography
          variant="body2"
          sx={{ mr: 1, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          color="text.secondary"
        >
          {label}
        </Typography>
      )}

      <Tooltip title="Account">
        <IconButton onClick={handleOpen} size="small" sx={{ p: 0.5 }}>
          <Avatar
            src={localAvatar ?? undefined}
            sx={{ width: 34, height: 34, fontSize: 14 }}
          >
            {/* fallback letter */}
            {(label?.trim()?.[0] ?? "U").toUpperCase()}
          </Avatar>
          <ArrowDropDownIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <MenuItem onClick={handlePickPhoto}>
          <ListItemIcon>
            <PhotoCameraIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Upload photo</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ProfileMenu;
