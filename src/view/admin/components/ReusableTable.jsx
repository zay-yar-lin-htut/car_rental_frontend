import React from "react";
import Loader from "../../../Loader";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TablePagination,
	Typography,
	Skeleton,
} from "@mui/material";

const ReusableTable = ({
	columns,
	data,
	loading,
	error,
	page,
	rowsPerPage,
	total,
	onPageChange,
	onRowsPerPageChange,
	title,
	rowsPerPageOptions = [5, 10, 25],
	keyExtractor,
	onRowClick,
}) => {
	if (error) {
		return (
			<Paper sx={{ p: 2 }}>
				<Typography
					color='error'
					align='center'>
					{error}
				</Typography>
			</Paper>
		);
	}

	// Client-side pagination if data length is greater than rows per page
	// and total matches data length. This implies server-side pagination is not active for this instance.
	const isClientSidePagination =
		data.length > rowsPerPage && data.length === total;
	const pagedData = isClientSidePagination
		? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
		: data;

	return (
		<Paper
			sx={{
				p: 2,
				bgcolor: "var(--background-paper)",
				color: "var(--text-color)",
				overflowX: "auto",
			}}>
			{title && (
				<Typography
					variant='h4'
					marginBottom={2}
					gutterBottom>
					{title}
				</Typography>
			)}
			<TableContainer
				sx={{
					maxWidth: 1500,
					overflow: "auto",
				}}>
				<Table>
					<TableHead>
						<TableRow>
							{columns.map((column) => (
								<TableCell
									key={column.id}
									align={column.align || "left"}
									sx={column.sx}>
									{column.label}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{loading
							? Array.from(new Array(rowsPerPage)).map((_, index) => (
									<TableRow key={index}>
										{columns.map((column) => (
											<TableCell
												key={column.id}
												align={column.align || "left"}
												sx={{
													color: "var(--text-color)",
												}}>
												<Skeleton variant='text' />
											</TableCell>
										))}
									</TableRow>
							  ))
							: pagedData.map((row) => (
									<TableRow key={keyExtractor ? keyExtractor(row) : row.id}>
										{columns.map((column) => (
											<TableCell
												key={column.id}
												align={column.align || "left"}
												sx={column.sx}>
												{column.render ? column.render(row) : row[column.id]}
											</TableCell>
										))}
									</TableRow>
							  ))}
						{!loading && data.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									align='center'>
									No data available.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
			{onPageChange && onRowsPerPageChange && total != null && (
				<TablePagination
					rowsPerPageOptions={rowsPerPageOptions}
					component='div'
					count={total}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={onPageChange}
					onRowsPerPageChange={onRowsPerPageChange}
					sx={{ color: "var(--text-color)" }}
				/>
			)}
		</Paper>
	);
};

export default ReusableTable;
