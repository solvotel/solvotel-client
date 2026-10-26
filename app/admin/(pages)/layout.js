'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  Badge,
  Stack,
} from '@mui/material';

import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  DashboardOutlined,
  SubscriptionsOutlined,
  NotificationsOutlined,
  AccountCircleOutlined,
  LogoutOutlined,
  SettingsOutlined,
  HotelOutlined,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useAuth } from '@/context';
import { parseCookies } from 'nookies';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 76;

const menuItems = [
  { label: 'Dashboard', icon: <DashboardOutlined />, href: '/admin/dashboard' },
  {
    label: 'Hotel Subscriptions',
    icon: <ApartmentIcon />,
    href: '/admin/hotel-subscriptions',
  },
  {
    label: 'POS Outlet Subscriptions',
    icon: <PointOfSaleIcon />,
    href: '/admin/pos-outlet-subscriptions',
  },
];

export default function AdminLayout({ children }) {
  const { auth, logout } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const drawerWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setCollapsed(!collapsed);
  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  // check authenticated
  useEffect(() => {
    const { user } = parseCookies();
    const parsedUser = JSON.parse(user || 'null');

    if (!parsedUser || parsedUser?.role.name !== 'Admin') {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    router.push('/admin/login');
  };

  // ───────── Sidebar content ─────────
  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0a2e4b',
        color: '#fff',
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          px: collapsed && !isMobile ? 0 : 2.5,
          py: 2.5,
          minHeight: 72,
        }}
      >
        <Box
          component={Link}
          href="/admin/dashboard"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <HotelOutlined />
          </Box>
          {(!collapsed || isMobile) && (
            <Typography variant="h6" fontWeight={700} noWrap>
              Solvotel
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <IconButton
            onClick={handleCollapseToggle}
            size="small"
            sx={{ color: '#fff', display: collapsed ? 'none' : 'inline-flex' }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + '/');
          const button = (
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                minHeight: 48,
                justifyContent:
                  collapsed && !isMobile ? 'center' : 'flex-start',
                px: collapsed && !isMobile ? 1.5 : 2,
                bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                '& .MuiListItemIcon-root': { color: '#fff' },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed && !isMobile ? 0 : 2,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.href} disablePadding>
              {collapsed && !isMobile ? (
                <Tooltip title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Expand button when collapsed */}
      {collapsed && !isMobile && (
        <Box sx={{ p: 1.5 }}>
          <Tooltip title="Expand menu" placement="right">
            <IconButton
              onClick={handleCollapseToggle}
              sx={{
                color: '#fff',
                width: '100%',
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.05)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Version */}
      {(!collapsed || isMobile) && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            v1.0.0 · Admin Panel
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* ───────── AppBar ───────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          color: 'text.primary',
          borderBottom: '1px solid #e5e7eb',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {menuItems.find(
                (m) =>
                  pathname === m.href || pathname?.startsWith(m.href + '/'),
              )?.label || 'Admin'}
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1}>
            {/* <IconButton color="inherit" size="large">
              <Badge badgeContent={3} color="error">
                <NotificationsOutlined />
              </Badge>
            </IconButton> */}

            <Tooltip title="Account">
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
                <Avatar sx={{ width: 38, height: 38, bgcolor: '#1b4a6b' }}>
                  <AccountCircleOutlined />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ───────── Profile Menu ───────── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {auth?.user?.username || 'Admin User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {auth?.user?.email || 'admin@solvotel.com'}
          </Typography>
        </Box>
        <Divider />
        {/* <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem> */}
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutOutlined fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* ───────── Sidebar ───────── */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="admin navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* ───────── Main Content ───────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64 } }} />
        <Box sx={{ p: { xs: 2, sm: 3, md: 2 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
