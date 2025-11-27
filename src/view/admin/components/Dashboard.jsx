import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  LinearProgress,
  Tooltip,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import {
  AttachMoney,
  TrendingUp,
  Build,
  WarningAmber,
  LocalShipping,
  AssignmentReturn,
  Refresh,
  CalendarToday,
  DirectionsCar,
  People,
  BookOnline,
} from "@mui/icons-material";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { useSnackbar } from "../../../contexts/ErrorMessage";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSnackbar } = useSnackbar();
  const dataServices = createDataServices();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dataServices.retrieve(
        API_ENDPOINTS.Dashboard.base,
        API_ENDPOINTS.Dashboard.getData
      );

      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || "Failed to load dashboard data");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      showSnackbar("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "MMK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusChip = (status) => {
    const map = {
      completed: { color: "success", label: "Completed" },
      on_rent: { color: "info", label: "On Rent" },
      pending: { color: "warning", label: "Pending" },
      cancelled: { color: "error", label: "Cancelled" },
      confirmed: { color: "primary", label: "Confirmed" },
    };
    const config = map[status] || { color: "default", label: status.replace("_", " ").toUpperCase() };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
      />
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  const totalCars = dashboardData.total_cars || 0;
  const availablePercent = totalCars > 0 ? (dashboardData.available_cars / totalCars) * 100 : 0;
  const rentedPercent = totalCars > 0 ? (dashboardData.rented_cars / totalCars) * 100 : 0;
  const maintenancePercent = totalCars > 0 ? (dashboardData.maintenance_cars / totalCars) * 100 : 0;

  const totalStaff = dashboardData.total_staff || 0;
  const deliveryPercent = totalStaff > 0 ? (dashboardData.delivery_staff / totalStaff) * 100 : 0;
  const takebackPercent = totalStaff > 0 ? (dashboardData.takeback_staff / totalStaff) * 100 : 0;
  const maintenanceStaffPercent = totalStaff > 0 ? (dashboardData.maintenance_staff / totalStaff) * 100 : 0;
  const freePercent = totalStaff > 0 ? (dashboardData.free_staff / totalStaff) * 100 : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="" color="text.primary">
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Welcome back! Here's what's happening today.
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchDashboardData} size="large" color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <CalendarToday fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Box>

      {/* 4 KPI Cards — EXACT 25% each */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          {
            title: "Today's Revenue",
            value: formatCurrency(dashboardData.today_revenue),
            icon: <AttachMoney sx={{ fontSize: 40 }} />,
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          },
          {
            title: "Monthly Revenue",
            value: formatCurrency(dashboardData.month_revenue),
            icon: <TrendingUp sx={{ fontSize: 40 }} />,
            color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          },
          {
            title: "Today's Bookings",
            value: dashboardData.today_bookings || 0,
            icon: <BookOnline sx={{ fontSize: 40 }} />,
            color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          },
          {
            title: "Monthly Bookings",
            value: dashboardData.month_bookings || 0,
            icon: <BookOnline sx={{ fontSize: 40 }} />,
            color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            {/* md={3} → exactly 25% width */}
            <Card
              sx={{
                background: item.color,
                color: "white",
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                overflow: "hidden",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "translateY(-8px)" },
                height: 160,
              }}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      {item.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 64,
                      height: 64,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Two Charts — EXACT 50% each */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          {/* md={6} → exactly 50% */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: 380 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Revenue Last 7 Days
            </Typography>
            <LineChart
              xAxis={[{ data: dashboardData.revenue_chart.labels, scaleType: 'band' }]}
              series={[
                {
                  data: dashboardData.revenue_chart.data,
                  label: 'Revenue (MMK)',
                  area: true,
                  color: '#667eea',
                },
              ]}
              height={320}
              margin={{ top: 10, bottom: 50, left: 60, right: 20 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* md={6} → exactly 50% */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3, height: 380 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Bookings Last 7 Days
            </Typography>
            <LineChart
              xAxis={[{ data: dashboardData.bookings_chart.labels, scaleType: 'band' }]}
              series={[
                {
                  data: dashboardData.bookings_chart.data,
                  label: 'Bookings Count',
                  area: true,
                  color: '#f093fb',
                },
              ]}
              height={320}
              margin={{ top: 10, bottom: 50, left: 60, right: 20 }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Everything below is 100% untouched — your original code */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, mb: 5 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <DirectionsCar color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight="bold">
            Cars Status (Total: {totalCars})
          </Typography>
        </Stack>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Available ({dashboardData.available_cars})</Typography>
              <Typography variant="body2" fontWeight="bold">{availablePercent.toFixed(0)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={availablePercent} color="success" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Rented ({dashboardData.rented_cars})</Typography>
              <Typography variant="body2" fontWeight="bold">{rentedPercent.toFixed(0)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={rentedPercent} color="info" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">In Maintenance ({dashboardData.maintenance_cars})</Typography>
              <Typography variant="body2" fontWeight="bold">{maintenancePercent.toFixed(0)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={maintenancePercent} color="warning" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, mb: 5 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <People color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight="bold">
            Staff Status (Total: {totalStaff})
          </Typography>
        </Stack>
        <Stack spacing={2}>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">In Delivery Tasks ({dashboardData.delivery_staff})</Typography>
              <Typography variant="body2" fontWeight="bold">{deliveryPercent.toFixed(0)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={deliveryPercent} color="primary" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">In Take-Back Tasks ({dashboardData.takeback_staff})</Typography>
              <Typography variant="body2" fontWeight="bold">{takebackPercent.toFixed(0)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={takebackPercent} color="secondary" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">In Maintenance Tasks ({dashboardData.maintenance_staff})</Typography>
              <Typography variant="body2" fontWeight="bold">{maintenanceStaffPercent.toFixed(0)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={maintenanceStaffPercent} color="warning" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Free ({dashboardData.free_staff})</Typography>
              <Typography variant="body2" fontWeight="bold">{freePercent.toFixed(0)}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={freePercent} color="success" sx={{ mt: 1, height: 8, borderRadius: 4 }} />
          </Box>
        </Stack>
      </Paper>

      {dashboardData.payments_by_staff?.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: "hidden", mb: 5, boxShadow: 3 }}>
          <Box sx={{ p: 3, bgcolor: "primary.main", color: "white" }}>
            <Typography variant="h6" fontWeight="bold">
              Payments Collected by Staff
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell><strong>Staff Name</strong></TableCell>
                  <TableCell align="right"><strong>Total Collected (MMK)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.payments_by_staff.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{item.staff_name}</TableCell>
                    <TableCell align="right" fontWeight="bold">{formatCurrency(item.total_collected)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {dashboardData.maintenance_queue?.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: "hidden", mb: 5, boxShadow: 3 }}>
          <Box sx={{ p: 3, bgcolor: "primary.main", color: "white" }}>
            <Typography variant="h6" fontWeight="bold">
              Maintenance Queue ({dashboardData.maintenance_queue.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.100" }}>
                  <TableCell><strong>Vehicle</strong></TableCell>
                  <TableCell><strong>Issue</strong></TableCell>
                  <TableCell><strong>Estimated Cost</strong></TableCell>
                  <TableCell><strong>Reported</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.maintenance_queue.map((item) => (
                  <TableRow key={item.maintenance_id} hover>
                    <TableCell>
                      <strong>{item.model}</strong><br />
                      <Typography variant="caption" color="text.secondary">{item.license_plate}</Typography>
                    </TableCell>
                    <TableCell>{item.description || "—"}</TableCell>
                    <TableCell>{item.cost ? formatCurrency(item.cost) : "Pending"}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 3 }}>
        <Box sx={{ p: 3, bgcolor: "primary.main", color: "white" }}>
          <Typography variant="h6" fontWeight="bold">
            Recent Bookings (Latest 10)
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell><strong>Ticket</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Vehicle</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Amount</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dashboardData.recent_bookings?.map((booking) => (
                <TableRow key={booking.booking_id} hover>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary">#{booking.ticket_number}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <People fontSize="small" color="action" />
                      <Box>
                        <Typography fontWeight="medium">{booking.customer_name}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{booking.car_model}</TableCell>
                  <TableCell>{getStatusChip(booking.booking_status)}</TableCell>
                  <TableCell align="right" fontWeight="bold">
                    {formatCurrency(booking.total_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;