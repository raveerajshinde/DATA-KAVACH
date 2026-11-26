import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, List, ListItem, ListItemText, Stack, TextField, Typography } from '@mui/material';
import QRCode from 'qrcode';
import { api, fmtDateTime } from '../api';
import { useApp, useLoad } from '../context';
import { PageHeader, SectionCard } from '../components/Common';

function Mfa() {
  const { user, login, toast } = useApp();
  const [setup, setSetup] = useState<{ secret: string; uri: string; qr: string } | null>(null);
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const refresh = async () => login(await api.post('/api/auth/refresh'));
  return (
    <SectionCard title="Multi-factor authentication">
      {user?.mfaEnabled ? (
        <Stack spacing={2}>
          <Alert severity="success">MFA is enabled for your account.</Alert>
          <TextField size="small" type="password" label="Password to disable" value={pw} onChange={e => setPw(e.target.value)} />
          <Button color="error" disabled={!pw} onClick={async () => { try { await api.post('/api/auth/mfa/disable', { password: pw }); await refresh(); toast('MFA disabled', 'warning'); } catch (e: any) { toast(e.message, 'error'); } }}>Disable MFA</Button>
        </Stack>
      ) : setup ? (
        <Stack spacing={2} alignItems="flex-start">
          <Typography variant="body2">Scan with Microsoft Authenticator, Google Authenticator or any TOTP app, then enter the 6-digit code.</Typography>
          <img src={setup.qr} alt="MFA QR code" width={180} height={180} />
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>Manual key: {setup.secret}</Typography>
          <Stack direction="row" spacing={1}><TextField size="small" label="Code" value={code} onChange={e => setCode(e.target.value)} /><Button variant="contained" onClick={async () => { try { await api.post('/api/auth/mfa/enable', { code }); await refresh(); setSetup(null); toast('MFA enabled'); } catch (e: any) { toast(e.message, 'error'); } }}>Enable</Button></Stack>
        </Stack>
      ) : (
        <Stack spacing={2}><Typography variant="body2">Protect your account with a time-based one-time code.</Typography><Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={async () => { const r = await api.post('/api/auth/mfa/setup'); setSetup({ ...r, qr: await QRCode.toDataURL(r.uri, { margin: 1, width: 360 }) }); }}>Set up MFA</Button></Stack>
      )}
    </SectionCard>
  );
}

function Password() {
  const { toast } = useApp();
  const [f, setF] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  return (
    <SectionCard title="Change password">
      <Stack spacing={1.5}>
        <TextField size="small" type="password" label="Current password" value={f.currentPassword} onChange={e => setF({ ...f, currentPassword: e.target.value })} />
        <TextField size="small" type="password" label="New password" value={f.newPassword} onChange={e => setF({ ...f, newPassword: e.target.value })} />
        <TextField size="small" type="password" label="Confirm" value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} />
        <Button variant="contained" sx={{ alignSelf: 'flex-start' }} disabled={!f.newPassword || f.newPassword !== f.confirm} onClick={async () => { try { await api.post('/api/auth/change-password', f); toast('Password changed'); setF({ currentPassword: '', newPassword: '', confirm: '' }); } catch (e: any) { toast(e.message, 'error'); } }}>Update</Button>
      </Stack>
    </SectionCard>
  );
}

function Admin() {
  const { orgId, can, toast } = useApp();
  const [tick, setTick] = useState(0);
  const [s] = useLoad<any>(() => (can('admin.settings') ? api.get(`/api/settings?orgId=${orgId ?? 0}`) : Promise.resolve(null)), [orgId], null);
  const [days, setDays] = useState('');
  useEffect(() => { if (s) setDays(s.rightsResponseDays); }, [s]);
  const [backups] = useLoad<any>(() => (can('admin.backup') ? api.get('/api/admin/backups') : Promise.resolve(null)), [tick], null);
  const [health] = useLoad<any>(() => api.get('/api/health'), [], null);
  const [busy, setBusy] = useState(false);
  return (
    <Grid container spacing={2}>
      {can('admin.settings') && <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="Rights request response period">
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" type="number" label="Target days (non-grievance requests)" value={days} onChange={e => setDays(e.target.value)} />
            <Button variant="contained" onClick={async () => { try { await api.put(`/api/settings?orgId=${orgId ?? 0}`, { rightsResponseDays: Number(days) }); toast('Saved'); } catch (e: any) { toast(e.message, 'error'); } }}>Save</Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">Grievance deadlines use the organisation's published grievance period (max 90 days, Rule 14(3)).</Typography>
        </SectionCard>
      </Grid>}
      {can('admin.backup') && <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="Backup" action={<Button variant="contained" size="small" disabled={busy} onClick={async () => { setBusy(true); try { await api.post('/api/admin/backup'); toast('Backup completed'); setTick(t => t + 1); } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(false); } }}>{busy ? 'Running...' : 'Back up now'}</Button>}>
          <Typography variant="caption" color="text.secondary">{backups?.directory}</Typography>
          <List dense sx={{ maxHeight: 220, overflow: 'auto' }}>{backups?.files?.map((f: any) => <ListItem key={f.name} divider><ListItemText primary={f.name} secondary={`${fmtDateTime(f.created)} - ${(f.size / 1048576).toFixed(1)} MB`} /></ListItem>)}</List>
          <Typography variant="caption" color="text.secondary">Scheduled backups and restore are handled by backup.ps1 / restore.ps1 on the server (see Administrator manual).</Typography>
        </SectionCard>
      </Grid>}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="System">
          {health && <Typography variant="body2">Version {health.version} - schema v{health.schema} - PDF engine: {health.pdf ? 'available (LibreOffice)' : 'not installed'}</Typography>}
        </SectionCard>
      </Grid>
    </Grid>
  );
}

export default function Settings() {
  return (
    <Box>
      <PageHeader title="Settings & Security" />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}><Mfa /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><Password /></Grid>
      </Grid>
      <Admin />
    </Box>
  );
}
