'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  User,
  UserCircle,
  Building2,
  BedDouble,
  ListChecks,
  Users2,
  BookOpen,
  ClipboardList,
  Utensils,
  LayoutDashboard,
  TableProperties,
  Receipt,
  FileText,
  FolderTree,
  PackageSearch,
  ShoppingCart,
  BarChart3,
  Calculator,
  Banknote,
  Bed,
  UserPen,
  PartyPopper,
  LogOut,
  HandPlatter,
} from 'lucide-react';
import TableRestaurantOutlinedIcon from '@mui/icons-material/TableRestaurantOutlined';
import TableBarOutlinedIcon from '@mui/icons-material/TableBarOutlined';
import { useAuth } from '@/context';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMouseEnter = (index) => setOpenDropdown(index);
  const handleMouseLeave = () => setOpenDropdown(null);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const access = auth?.user?.access || [];

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: '#1e3a8a',
          boxShadow: 3,
          zIndex: 1200,
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" passHref>
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <Image
                src="https://res.cloudinary.com/deyxdpnom/image/upload/v1760010903/logo_f027a1ac91.webp"
                alt="BookingMaster.in"
                width={130}
                height={30}
                priority
              />
            </Box>
          </Link>

          {/* Desktop Menu */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 3,
              alignItems: 'center',
            }}
          >
            {' '}
            {/* ========== Admin ========== */}
            {access.includes('admin') && (
              <Box
                onMouseEnter={() => handleMouseEnter(1)}
                onMouseLeave={handleMouseLeave}
                sx={{ position: 'relative' }}
              >
                <Button
                  sx={{ color: 'white', textTransform: 'none' }}
                  startIcon={<User size={18} />}
                >
                  Admin
                </Button>
                {openDropdown === 1 && (
                  <DropdownMenu
                    items={[
                      {
                        href: '/master/users',
                        icon: <Users2 size={16} />,
                        label: 'Users',
                      },
                      {
                        href: '/master/profile',
                        icon: <UserCircle size={16} />,
                        label: 'Profile',
                      },
                    ]}
                  />
                )}
              </Box>
            )}
            {/* ========== Property ========== */}
            {access.includes('property') && (
              <Box
                onMouseEnter={() => handleMouseEnter(2)}
                onMouseLeave={handleMouseLeave}
                sx={{ position: 'relative' }}
              >
                <Button
                  sx={{ color: 'white', textTransform: 'none' }}
                  startIcon={<Building2 size={18} />}
                >
                  Property
                </Button>
                {openDropdown === 2 && (
                  <DropdownMenu
                    items={[
                      {
                        href: '/property/categories',
                        icon: <ListChecks size={16} />,
                        label: 'Room Categories',
                      },
                      {
                        href: '/property/rooms',
                        icon: <BedDouble size={16} />,
                        label: 'Room List',
                      },
                      {
                        href: '/property/customers',
                        icon: <Users2 size={16} />,
                        label: 'Guests',
                      },
                      {
                        href: '/property/dob-doa-report',
                        icon: <PartyPopper size={16} />,
                        label: 'DOB & DOA Report',
                      },
                      {
                        href: '/property/payment-methods',
                        icon: <Banknote size={16} />,
                        label: 'Payment Methods',
                      },
                    ]}
                  />
                )}
              </Box>
            )}
            {/* ========== Frontoffice ========== */}
            {access.includes('frontoffice') && (
              <Box
                onMouseEnter={() => handleMouseEnter(3)}
                onMouseLeave={handleMouseLeave}
                sx={{ position: 'relative' }}
              >
                <Button
                  sx={{ color: 'white', textTransform: 'none' }}
                  startIcon={<UserPen size={18} />}
                >
                  Frontoffice
                </Button>
                {openDropdown === 3 && (
                  <DropdownMenu
                    items={[
                      {
                        href: '/',
                        icon: <LayoutDashboard size={16} />,
                        label: 'Room Dashboard',
                      },
                      {
                        href: '/front-office/room-booking',
                        icon: <BookOpen size={16} />,
                        label: 'Booking',
                      },
                      {
                        href: '/front-office/room-invoice',
                        icon: <ClipboardList size={16} />,
                        label: 'Room Invoice',
                      },
                      {
                        href: '/front-office/room-booking-report',
                        icon: <ClipboardList size={16} />,
                        label: 'Booking Report',
                      },
                      {
                        href: '/front-office/room-invoice-report',
                        icon: <ClipboardList size={16} />,
                        label: 'Invoice Report',
                      },
                    ]}
                  />
                )}
              </Box>
            )}
            {/* ========== Housekeeping ========== */}
            {access.includes('housekeeping') && (
              <Box
                onMouseEnter={() => handleMouseEnter(4)}
                onMouseLeave={handleMouseLeave}
                sx={{ position: 'relative' }}
              >
                <Button
                  sx={{ color: 'white', textTransform: 'none' }}
                  startIcon={<Bed size={18} />}
                >
                  Housekeeping
                </Button>
                {openDropdown === 4 && (
                  <DropdownMenu
                    items={[
                      {
                        href: '/house-keeping',
                        icon: <LayoutDashboard size={16} />,
                        label: 'Dashboard',
                      },
                    ]}
                  />
                )}
              </Box>
            )}
            {/* ========== Restaurant ========== */}
            {access.includes('restaurant') && (
              <Box
                onMouseEnter={() => handleMouseEnter(5)}
                onMouseLeave={handleMouseLeave}
                sx={{ position: 'relative' }}
              >
                <Button
                  sx={{ color: 'white', textTransform: 'none' }}
                  startIcon={<Utensils size={18} />}
                >
                  Restaurant
                </Button>
                {openDropdown === 5 && (
                  <DropdownMenu
                    items={[
                      {
                        href: '/restaurant/table-orders',
                        icon: <HandPlatter size={16} />,
                        label: 'Table Orders',
                      },
                      {
                        href: '/restaurant/table-bookings',
                        icon: (
                          <TableRestaurantOutlinedIcon
                            sx={{ fontSize: '17px' }}
                          />
                        ),
                        label: 'Table Booking',
                      },

                      {
                        href: '/restaurant/invoices',
                        icon: <Receipt size={16} />,
                        label: 'Invoice',
                      },
                      {
                        href: '/restaurant/menu-items',
                        icon: <BookOpen size={16} />,
                        label: 'Restaurant Menu',
                      },
                      {
                        href: '/restaurant/tables',
                        icon: (
                          <TableBarOutlinedIcon sx={{ fontSize: '17px' }} />
                        ),
                        label: 'Tables',
                      },

                      {
                        href: '/restaurant/invoice-report',
                        icon: <FileText size={16} />,
                        label: 'Invoice Report',
                      },
                    ]}
                  />
                )}
              </Box>
            )}
            {/* ========== Inventory ========== */}
            {access.includes('inventory') && (
              <Box
                onMouseEnter={() => handleMouseEnter(6)}
                onMouseLeave={handleMouseLeave}
                sx={{ position: 'relative' }}
              >
                <Button
                  sx={{ color: 'white', textTransform: 'none' }}
                  startIcon={<ShoppingCart size={18} />}
                >
                  Inventory
                </Button>
                {openDropdown === 6 && (
                  <DropdownMenu
                    items={[
                      {
                        href: '/inventory/category',
                        icon: <FolderTree size={16} />,
                        label: 'Category',
                      },
                      {
                        href: '/inventory/inventory-item',
                        icon: <PackageSearch size={16} />,
                        label: 'Inventory List',
                      },
                      {
                        href: '/inventory/purchase-entries',
                        icon: <ShoppingCart size={16} />,
                        label: 'Purchase Item',
                      },
                      {
                        href: '/inventory/sales-entries',
                        icon: <Receipt size={16} />,
                        label: 'Sales Item',
                      },
                      {
                        href: '/inventory/stock-report',
                        icon: <BarChart3 size={16} />,
                        label: 'Stock Report',
                      },
                    ]}
                  />
                )}
              </Box>
            )}
            {/* ========== Accounts ========== */}
            {access.includes('accounts') && (
              <Box
                onMouseEnter={() => handleMouseEnter(7)}
                onMouseLeave={handleMouseLeave}
                sx={{ position: 'relative' }}
              >
                <Button
                  sx={{ color: 'white', textTransform: 'none' }}
                  startIcon={<Calculator size={18} />}
                >
                  Accounts
                </Button>
                {openDropdown === 7 && (
                  <DropdownMenu
                    items={[
                      {
                        href: '/expenses',
                        icon: <ClipboardList size={16} />,
                        label: 'Manage Expenses',
                      },
                      {
                        href: '/inventory/stock-report',
                        icon: <ShoppingCart size={16} />,
                        label: 'Stock Report',
                      },
                      {
                        href: '/restaurant/invoice-report',
                        icon: <Utensils size={16} />,
                        label: 'Restaurant Invoice Report',
                      },
                      {
                        href: '/reports/booking-report',
                        icon: <ClipboardList size={16} />,
                        label: 'Room Invoice Report',
                      },
                      {
                        href: '/reports/income-expense-report',
                        icon: <ClipboardList size={16} />,
                        label: 'Income Expense Report',
                      },
                    ]}
                  />
                )}
              </Box>
            )}
            {/* Logout */}
            <Button
              onClick={logout}
              sx={{
                bgcolor: 'red',
                '&:hover': { bgcolor: 'darkred' },
                color: '#fff',
                borderRadius: 2,
                px: 2,
              }}
              startIcon={<LogOut size={18} />}
            >
              Logout
            </Button>
          </Box>

          {/* Mobile Hamburger */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton onClick={toggleDrawer(true)} color="inherit">
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/master/users">
                <ListItemIcon>
                  <Users2 size={18} />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/property/roomlist">
                <ListItemIcon>
                  <BedDouble size={18} />
                </ListItemIcon>
                <ListItemText primary="Rooms" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={logout}>
                <ListItemIcon>
                  <LogOut size={18} />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

/* 🔹 Reusable dropdown component */
function DropdownMenu({ items }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        bgcolor: 'white',
        color: 'black',
        borderRadius: 1,
        boxShadow: 3,
        minWidth: 200,
        zIndex: 2000,
      }}
    >
      {items.map((item, idx) => (
        <Link key={idx} href={item.href} className="my-link">
          <Box
            sx={{
              fontSize: '15px',
              lineHeight: '1em',
              p: 1.2,
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                bgcolor: '#f0f0f0',
                color: 'primary.main',
                borderRadius: 1,
              },
            }}
          >
            {item.icon}
            <span style={{ marginLeft: 8 }}>{item.label}</span>
          </Box>
        </Link>
      ))}
    </Box>
  );
}
