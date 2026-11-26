import { ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Menu, MenuItem, Select, Stack, Toolbar, Tooltip, Typography, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import BusinessIcon from '@mui/icons-material/Business';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import StorageIcon from '@mui/icons-material/Storage';
import PolicyIcon from '@mui/icons-material/Policy';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ArticleIcon from '@mui/icons-material/Article';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SecurityIcon from '@mui/icons-material/Security';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TimelineIcon from '@mui/icons-material/Timeline';
import DescriptionIcon from '@mui/icons-material/Description';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useApp } from '../context';
import { APP_NAME } from '../api';

const W = 252;

const nav: { section: string; items: { to: string; label: string; icon: ReactNode; perm: string }[] }[] = [
  { section: 'Overview', items: [
    { to: '/', label: 'Dashboard', icon: <DashboardIcon />, perm: 'assessment.view' },
    { to: '/organizations', label: 'Organisation & Branding', icon: <BusinessIcon />, perm: 'org.view' },
  ] },
  { section: 'Assess', items: [
    { to: '/assessments', label: 'Compliance Assessment', icon: <FactCheckIcon />, perm: 'assessment.view' },
    { to: '/inventory', label: 'Data Inventory & Flows', icon: <StorageIcon />, perm: 'inventory.view' },
    { to: '/dpia', label: 'Impact Assessments', icon: <PolicyIcon />, perm: 'dpia.view' },
    { to: '/security', label: 'Security Safeguards', icon: <SecurityIcon />, perm: 'security.view' },
    { to: '/vendors', label: 'Vendors & Processors', icon: <HandshakeIcon />, perm: 'vendor.view' },
  ] },
  { section: 'Operate', items: [
    { to: '/consent', label: 'Consent Management', icon: <HowToRegIcon />, perm: 'consent.view' },
    { to: '/rights', label: 'Data Principal Rights', icon: <RecordVoiceOverIcon />, perm: 'rights.view' },
    { to: '/incidents', label: 'Breaches & Incidents', icon: <ReportProblemIcon />, perm: 'incident.view' },
    { to: '/policies', label: 'Policies & Notices', icon: <ArticleIcon />, perm: 'policy.view' },
    { to: '/roadmap', label: 'Remediation Roadmap', icon: <TimelineIcon />, perm: 'roadmap.view' },
    { to: '/evidence', label: 'Evidence Repository', icon: <FolderIcon />, perm: 'evidence.view' },
  ] },
  { section: 'Report', items: [
    { to: '/reports', label: 'Report Generator', icon: <DescriptionIcon />, perm: 'report.view' },
    { to: '/templates', label: 'Template Designer', icon: <DesignServicesIcon />, perm: 'template.view' },
  ] },
  { section: 'Administration', items: [
    { to: '/requirements', label: 'Requirement Library', icon: <MenuBookIcon />, perm: 'assessment.view' },
    { to: '/users', label: 'Users & Roles', icon: <PeopleIcon />, perm: 'admin.users' },
    { to: '/audit', label: 'Audit Trail', icon: <ReceiptLongIcon />, perm: 'admin.audit' },
    { to: '/settings', label: 'Settings & Security', icon: <SettingsIcon />, perm: '' },
  ] },
];

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden><path d="M32 4 8 13v17c0 15 10 26 24 30 14-4 24-15 24-30V13L32 4z" fill="#F2A900" /><path d="M32 12 16 18v12c0 10 7 18 16 21 9-3 16-11 16-21V18l-16-6z" fill="#fff" /><path d="m25 31 5 5 10-11" stroke="#0B3D91" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, can, logout, orgs, orgId, selectOrg } = useApp();
  const wide = useMediaQuery('(min-width:1100px)');
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const loc = useLocation();

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#0A2A63', color: '#DCE6F7', overflowY: 'auto' }}>
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ px: 2.5, py: 2.2 }}>
        <Logo />
        <Box>
          <Typography fontWeight={800} letterSpacing={0.3} color="#fff" lineHeight={1.1}>{APP_NAME}</Typography>
          <Typography variant="caption" sx={{ color: '#9FB3D9' }}>DPDP Compliance Suite</Typography>
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      {nav.map(s => {
        const items = s.items.filter(i => !i.perm || can(i.perm));
        if (items.length === 0) return null;
        return (
          <List key={s.section} dense subheader={<ListSubheader disableSticky sx={{ bgcolor: 'transparent', color: '#7F95C2', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: '32px', mt: 1 }}>{s.section}</ListSubheader>}>
            {items.map(i => {
              const active = i.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(i.to);
              return (
                <ListItemButton key={i.to} component={NavLink} to={i.to} onClick={() => setOpen(false)}
                  sx={{ mx: 1, borderRadius: 1.5, mb: 0.25, color: active ? '#fff' : '#C9D6EE', bgcolor: active ? 'rgba(242,169,0,0.18)' : 'transparent', borderLeft: active ? '3px solid #F2A900' : '3px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                  <ListItemIcon sx={{ minWidth: 34, color: active ? '#F2A900' : '#8EA5D1', '& svg': { fontSize: 20 } }}>{i.icon}</ListItemIcon>
                  <ListItemText primary={i.label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 700 : 500 }} />
                </ListItemButton>
              );
            })}
          </List>
        );
      })}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6FB' }}>
      <Drawer variant={wide ? 'permanent' : 'temporary'} open={wide || open} onClose={() => setOpen(false)} sx={{ width: W, flexShrink: 0, '& .MuiDrawer-paper': { width: W, border: 0 } }}>{drawer}</Drawer>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
          <Toolbar sx={{ gap: 2 }}>
            {!wide && <IconButton onClick={() => setOpen(true)}><MenuIcon /></IconButton>}
            <BusinessIcon color="action" fontSize="small" />
            <Select size="small" value={orgId ?? ''} displayEmpty onChange={e => selectOrg(Number(e.target.value))} sx={{ minWidth: 260, '& .MuiSelect-select': { py: 0.8 } }}>
              {orgs.length === 0 && <MenuItem value=""><em>No organisation yet</em></MenuItem>}
              {orgs.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            </Select>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={`${user?.name} - ${user?.role}`}>
              <IconButton onClick={e => setAnchor(e.currentTarget)}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>{user?.name?.split(' ').map(s => s[0]).slice(0, 2).join('')}</Avatar></IconButton>
            </Tooltip>
            <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
              <Box sx={{ px: 2, py: 1 }}><Typography fontWeight={700}>{user?.name}</Typography><Typography variant="caption" color="text.secondary">{user?.email}<br />{user?.role}</Typography></Box>
              <Divider />
              <MenuItem component={NavLink} to="/settings" onClick={() => setAnchor(null)}>Account security</MenuItem>
              <MenuItem onClick={() => { setAnchor(null); logout(); }}>Sign out</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 1600, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}
