import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import TaskMap from "./TaskMap";
import ReusableTable from "./ReusableTable";
import ConfirmDialog from "../../../common/ConfirmDialog";
import {
  Box,
  TextField,
  Button,
  Chip,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  AssignmentTurnedIn as ClaimIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { createDataServices } from "../../../services/DataServices";
import { API_ENDPOINTS } from "../../../services/Configuration";
import { useUserRole } from "../../../contexts/userRoleContext";
import { useSnackbar } from "../../../contexts/ErrorMessage";

const TaskManagement = () => {
  const { role } = useUserRole();
  const { showSnackbar } = useSnackbar();
  const dataService = useMemo(() => createDataServices(), []);

  // States
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("delivery");
  const [officeFilter, setOfficeFilter] = useState(""); // Start empty (controlled)
  const [officeLocations, setOfficeLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasTasks, setHasTasks] = useState(true); // true = no tasks (disable claim)

  // Dialog states
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedTaskForClaim, setSelectedTaskForClaim] = useState(null);

  const isFetching = useRef(false);

  // Fetch tasks when status or office changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      setError(null);

      try {
        let response;
        const endpoint =
          statusFilter === "take_back"
            ? `${API_ENDPOINTS.staff.tdyTakeBack}?office_id=${officeFilter}`
            : `${API_ENDPOINTS.staff.tdyDeli}?office_id=${officeFilter}`;

        response = await dataService.retrieve(
          API_ENDPOINTS.staff.baseStaff,
          endpoint
        );

        const taskList = (response.data || []).map((task) => ({
          ...task,
          booking_id: task.booking_id || task.id,
          type: statusFilter === "delivery" ? "Delivery" : "Take Back",
        }));

        setTasks(taskList);
      } catch (err) {
        setError("Failed to fetch tasks. Please try again later.");
        setTasks([]);
        showSnackbar("Failed to load tasks", "error");
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    // Only fetch if officeFilter is valid
    if (officeFilter) {
      fetchTasks();
    } else {
      setLoading(false); // No office selected yet
      setTasks([]);
    }
  }, [statusFilter, officeFilter, dataService, showSnackbar]);

  // Check if staff already has assigned tasks
  const checkHasTasks = useCallback(async () => {
    try {
      const response = await dataService.retrieve(
        API_ENDPOINTS.staff.baseStaff,
        API_ENDPOINTS.staff.staffHaveTask
      );
      setHasTasks(response.data === true); // true = has no tasks
    } catch (error) {
      console.error("Failed to check staff tasks:", error);
      setHasTasks(true); // default safe: disable claim
    }
  }, [dataService]);

  useEffect(() => {
    checkHasTasks();
  }, [checkHasTasks]);

  useEffect(() => {
    const offices = [
      { id: 2, location_name: 'Yangon' },
      { id: 1, location_name: 'Mandalay' }
    ];
    setOfficeLocations(offices);
    if (!officeFilter) {
      setOfficeFilter(offices[0].id);
    }
  }, [officeFilter]);

  // View Details Dialog
  const handleOpenViewDialog = (task) => {
    setSelectedTask(task);
    setCurrentLocation(null);
    setShowRoute(false);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedTask(null);
    setCurrentLocation(null);
    setShowRoute(false);
  };

  const handleViewRoute = () => {
    if (!navigator.geolocation) {
      showSnackbar("Geolocation is not supported by this browser.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setShowRoute(true);
      },
      (error) => {
        console.error("Geolocation error:", error);
        showSnackbar("Unable to get your location. Please allow location access.", "error");
      }
    );
  };

  // Claim Task
  const handleClaim = (task) => {
    setSelectedTaskForClaim(task);
    setOpenConfirm(true);
  };

  const handleConfirmClaim = async () => {
    if (!selectedTaskForClaim) return;

    try {
      const endpoint =
        selectedTaskForClaim.type === "Delivery"
          ? API_ENDPOINTS.staff.claimDelivery(selectedTaskForClaim.booking_id)
          : API_ENDPOINTS.staff.claimTakeBack(selectedTaskForClaim.booking_id);

      await dataService.retrieve(API_ENDPOINTS.staff.baseStaff, endpoint);

      // Remove claimed task
      setTasks((prev) => prev.filter((t) => t.booking_id !== selectedTaskForClaim.booking_id));

      // Refresh task availability
      await checkHasTasks();

      showSnackbar("Task claimed successfully!", "success");
    } catch (error) {
      console.error("Failed to claim task:", error);
      showSnackbar("Failed to claim the task. Please try again.", "error");
    } finally {
      setOpenConfirm(false);
      setSelectedTaskForClaim(null);
    }
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedTaskForClaim(null);
  };

  // Filters
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleOfficeFilterChange = (e) => {
    setOfficeFilter(e.target.value);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasks;

    const term = searchTerm.toLowerCase();
    return tasks.filter(
      (task) =>
        task.ticket_number?.toLowerCase().includes(term) ||
        task.model?.toLowerCase().includes(term) ||
        task.license_plate?.toLowerCase().includes(term) ||
        task.booking_id?.toString().includes(term)
    );
  }, [tasks, searchTerm]);

  // Table columns
  const columns = [
    { id: "booking_id", label: "Booking ID" },
    { id: "ticket_number", label: "Ticket Number" },
    { id: "model", label: "Car Model" },
    { id: "license_plate", label: "License Plate" },
    {
      id: "datetime",
      label: "Date/Time",
      render: (task) =>
        new Date(task.return_datetime || task.pickup_datetime).toLocaleString(),
    },
    { id: "minutes_until", label: "Minutes Until" },
    {
      id: "status",
      label: "Status",
      render: (task) => (
        <Chip
          label={task.is_overdue ? "Overdue" : "On Time"}
          color={task.is_overdue ? "error" : "success"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      align: "center",
      render: (task) => (
        <>
          <Tooltip title="View Details">
            <IconButton onClick={() => handleOpenViewDialog(task)}>
              <VisibilityIcon sx={{ color: "var(--text-color)" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={hasTasks ? "You already have tasks" : "Claim Task"}>
            <span>
              <IconButton
                onClick={() => handleClaim(task)}
                disabled={hasTasks}
                color="primary"
              >
                <ClaimIcon />
              </IconButton>
            </span>
          </Tooltip>
        </>
      ),
    },
  ];

  // Access control
  if (role !== "staff") {
    return (
      <Paper sx={{ p: 4, bgcolor: "var(--background-paper)", color: "var(--text-color)" }}>
        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>
        <Typography>You do not have permission to access this page.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, bgcolor: "var(--background-paper)", color: "var(--text-color)" }}>
      <Typography variant="h4" marginBottom={3} gutterBottom>
        Delivery & Takeback
      </Typography>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "flex-end",
        }}
      >
        <TextField
          label="Search by ticket, model, plate..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: 280 }}
        />

        <FormControl variant="outlined" sx={{ minWidth: 240 }}>
          <InputLabel>Office Location</InputLabel>
          <Select
            value={officeFilter}
            onChange={handleOfficeFilterChange}
            label="Office Location"
            disabled={officeLocations.length === 0}
          >
            {officeLocations.length === 0 ? (
              <MenuItem disabled>
                <em>Loading offices...</em>
              </MenuItem>
            ) : (
              officeLocations.map((office) => (
                <MenuItem key={office.id} value={office.id}>
                  {office.location_name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl variant="outlined" sx={{ minWidth: 160 }}>
          <InputLabel>Type</InputLabel>
          <Select value={statusFilter} onChange={handleStatusFilterChange} label="Type">
            <MenuItem value="delivery">Delivery</MenuItem>
            <MenuItem value="take_back">Take Back</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <ReusableTable
        columns={columns}
        data={filteredTasks}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        total={filteredTasks.length}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        keyExtractor={(task) => task.booking_id}
      />

      {/* View Details Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">
                {selectedTask.type}: {selectedTask.model}
              </Typography>
              <Typography><strong>Ticket:</strong> {selectedTask.ticket_number}</Typography>
              <Typography><strong>License Plate:</strong> {selectedTask.license_plate}</Typography>
              <Typography>
                <strong>Time:</strong>{" "}
                {new Date(selectedTask.return_datetime || selectedTask.pickup_datetime).toLocaleString()}
              </Typography>
              <Typography><strong>Minutes Until:</strong> {selectedTask.minutes_until}</Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                <Chip
                  label={selectedTask.is_overdue ? "Overdue" : "On Time"}
                  color={selectedTask.is_overdue ? "error" : "success"}
                  size="small"
                />
              </Typography>

              <Box sx={{ height: 400, mt: 3, borderRadius: 1, overflow: "hidden" }}>
                <TaskMap
                  start={showRoute ? currentLocation : null}
                  end={{
                    lat:
                      selectedTask.type === "Delivery"
                        ? selectedTask.pickup_latitude
                        : selectedTask.dropoff_latitude,
                    lng:
                      selectedTask.type === "Delivery"
                        ? selectedTask.pickup_longitude
                        : selectedTask.dropoff_longitude,
                  }}
                  type={selectedTask.type}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleViewRoute}
            disabled={showRoute}
          >
            {showRoute ? "Route Shown" : "Show My Route"}
          </Button>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Claim Dialog */}
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmClaim}
        title="Claim Task"
        message={`Are you sure you want to claim this ${selectedTaskForClaim?.type?.toLowerCase()} task? (Booking ID: ${selectedTaskForClaim?.booking_id})`}
        confirmText="Yes, Claim"
        cancelText="Cancel"
      />
    </Paper>
  );
};

export default TaskManagement;