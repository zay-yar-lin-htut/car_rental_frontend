import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	TablePagination,
	Skeleton,
	Typography,
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

	return (
		<Paper
			sx={{
				p: 2,
				// bgcolor: "var(--background-paper)",
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
					maxHeight: 500,
					maxWidth: 1500,
					overflow: "auto", // enable scrolling
				}}>
				<Table stickyHeader>
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
												align={column.align || "left"}>
												<Skeleton variant='text' />
											</TableCell>
										))}
									</TableRow>
							  ))
							: data.map((row) => (
									<TableRow key={keyExtractor ? keyExtractor(row) : row.id}>
										{columns.map((column) => (
											<TableCell
												key={column.id}
												align={column.align || "left"}>
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
				/>
			)}
		</Paper>
	);
};

export default ReusableTable;
