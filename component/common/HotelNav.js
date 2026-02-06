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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

const HotelNav = ({ auth, logout }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const handleMouseEnter = (index) => setOpenDropdown(index);
  const handleMouseLeave = () => setOpenDropdown(null);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleAccordionChange = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : null);
  };

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
          <Link href="/dashboard" passHref>
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
                        href: '/master/profile',
                        icon: <UserCircle size={16} />,
                        label: 'Profile',
                      },
                      {
                        href: '/master/pos-outlets',
                        icon: <UserCircle size={16} />,
                        label: 'POS Outlets',
                      },
                      {
                        href: '/master/hotel-users',
                        icon: <Users2 size={16} />,
                        label: 'Hotel Users',
                      },
                      {
                        href: '/master/pos-users',
                        icon: <Users2 size={16} />,
                        label: 'POS Users',
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
                        href: '/front-office/checkout-report',
                        icon: <ClipboardList size={16} />,
                        label: 'Checkout Report',
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
                        href: '/front-office/room-invoice-report',
                        icon: <ClipboardList size={16} />,
                        label: 'Room Invoice Report',
                      },
                      {
                        href: '/income-expense-report',
                        icon: <ClipboardList size={16} />,
                        label: 'Income Expense Report',
                      },
                      {
                        href: '/due-report',
                        icon: <Banknote size={16} />,
                        label: 'Due Report',
                      },
                      {
                        href: '/collection-report',
                        icon: <Calculator size={16} />,
                        label: 'Collection Report',
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
        <Box sx={{ width: 280 }} role="presentation">
          {/* Admin Section */}
          {access.includes('admin') && (
            <Accordion
              expanded={expandedSection === 'admin'}
              onChange={handleAccordionChange('admin')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <UserCircle size={18} style={{ marginRight: 8 }} />
                <span style={{ fontWeight: 'bold' }}>Admin</span>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/master/profile"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <UserCircle size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/master/pos-outlets"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <UserCircle size={16} />
                      </ListItemIcon>
                      <ListItemText primary="POS Outlets" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/master/hotel-users"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Users2 size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Hotel Users" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/master/pos-users"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Users2 size={16} />
                      </ListItemIcon>
                      <ListItemText primary="POS Users" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Property Section */}
          {access.includes('property') && (
            <Accordion
              expanded={expandedSection === 'property'}
              onChange={handleAccordionChange('property')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Building2 size={18} style={{ marginRight: 8 }} />
                <span style={{ fontWeight: 'bold' }}>Property</span>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/property/categories"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ListChecks size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Room Categories" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/property/rooms"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <BedDouble size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Room List" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/property/customers"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Users2 size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Guests" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/property/dob-doa-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <PartyPopper size={16} />
                      </ListItemIcon>
                      <ListItemText primary="DOB & DOA Report" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/property/payment-methods"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Banknote size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Payment Methods" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Frontoffice Section */}
          {access.includes('frontoffice') && (
            <Accordion
              expanded={expandedSection === 'frontoffice'}
              onChange={handleAccordionChange('frontoffice')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <UserPen size={18} style={{ marginRight: 8 }} />
                <span style={{ fontWeight: 'bold' }}>Frontoffice</span>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/front-office/room-booking"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <BookOpen size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Booking" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/front-office/room-invoice"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ClipboardList size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Room Invoice" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/front-office/checkout-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ClipboardList size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Checkout Report" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/front-office/room-invoice-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ClipboardList size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Invoice Report" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Housekeeping Section */}
          {access.includes('housekeeping') && (
            <Accordion
              expanded={expandedSection === 'housekeeping'}
              onChange={handleAccordionChange('housekeeping')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Bed size={18} style={{ marginRight: 8 }} />
                <span style={{ fontWeight: 'bold' }}>Housekeeping</span>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/house-keeping"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <LayoutDashboard size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Dashboard" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Restaurant Section */}
          {access.includes('restaurant') && (
            <Accordion
              expanded={expandedSection === 'restaurant'}
              onChange={handleAccordionChange('restaurant')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Utensils size={18} style={{ marginRight: 8 }} />
                <span style={{ fontWeight: 'bold' }}>Restaurant</span>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/restaurant/table-orders"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <HandPlatter size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Table Orders" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/restaurant/table-bookings"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <TableRestaurantOutlinedIcon
                          sx={{ fontSize: '17px' }}
                        />
                      </ListItemIcon>
                      <ListItemText primary="Table Booking" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/restaurant/invoices"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Receipt size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Invoice" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/restaurant/menu-items"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <BookOpen size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Restaurant Menu" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/restaurant/tables"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <TableBarOutlinedIcon sx={{ fontSize: '17px' }} />
                      </ListItemIcon>
                      <ListItemText primary="Tables" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/restaurant/invoice-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <FileText size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Invoice Report" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Inventory Section */}
          {access.includes('inventory') && (
            <Accordion
              expanded={expandedSection === 'inventory'}
              onChange={handleAccordionChange('inventory')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ShoppingCart size={18} style={{ marginRight: 8 }} />
                <span style={{ fontWeight: 'bold' }}>Inventory</span>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/inventory/category"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <FolderTree size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Category" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/inventory/inventory-item"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <PackageSearch size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Inventory List" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/inventory/purchase-entries"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ShoppingCart size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Purchase Item" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/inventory/sales-entries"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Receipt size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Sales Item" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/inventory/stock-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <BarChart3 size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Stock Report" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Accounts Section */}
          {access.includes('accounts') && (
            <Accordion
              expanded={expandedSection === 'accounts'}
              onChange={handleAccordionChange('accounts')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Calculator size={18} style={{ marginRight: 8 }} />
                <span style={{ fontWeight: 'bold' }}>Accounts</span>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ width: '100%' }}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/expenses"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ClipboardList size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Manage Expenses" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/inventory/stock-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ShoppingCart size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Stock Report" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/restaurant/invoice-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Utensils size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Restaurant Invoice Report" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/front-office/room-invoice-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ClipboardList size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Room Invoice Report" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/income-expense-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <ClipboardList size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Income Expense Report" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/due-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Banknote size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Due Report" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/collection-report"
                      onClick={toggleDrawer(false)}
                    >
                      <ListItemIcon>
                        <Calculator size={16} />
                      </ListItemIcon>
                      <ListItemText primary="Collection Report" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Logout Button */}
          <Box sx={{ mt: 1, borderTop: '1px solid #eee', pt: 1 }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setDrawerOpen(false);
                    logout();
                  }}
                >
                  <ListItemIcon>
                    <LogOut size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default HotelNav;

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
