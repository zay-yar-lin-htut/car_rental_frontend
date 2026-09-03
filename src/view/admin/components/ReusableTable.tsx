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
	type SxProps,
	type TableCellProps,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

export interface Column<T> {
	id: string;
	label: string;
	align?: string;
	sx?: SxProps<Theme>;
	render?: (row: T) => React.ReactNode;
}

interface ReusableTableProps<T> {
	columns: Column<T>[];
	data: T[];
	loading: boolean;
	error: string | null;
	page: number;
	rowsPerPage: number;
	total: number;
	onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
	onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	title?: React.ReactNode;
	rowsPerPageOptions?: number[];
	keyExtractor?: (row: T) => string | number;
	onRowClick?: (row: T) => void;
}

const ReusableTable = <T extends object>({
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
}: ReusableTableProps<T>) => {
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
									align={column.align as TableCellProps["align"] || "left"}
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
												align={column.align as TableCellProps["align"] || "left"}
												sx={{
													color: "var(--text-color)",
												}}>
												<Skeleton variant='text' />
											</TableCell>
										))}
									</TableRow>
							  ))
							: pagedData.map((row) => (
									<TableRow
										key={keyExtractor ? keyExtractor(row) : (row as { id?: string | number }).id ?? "row"}
										onClick={onRowClick ? () => onRowClick(row) : undefined}
										sx={onRowClick ? { cursor: "pointer" } : undefined}>
										{columns.map((column) => (
											<TableCell
												key={column.id}
												align={column.align as TableCellProps["align"] || "left"}
												sx={column.sx}>
												{column.render
													? column.render(row)
													: (row as Record<string, unknown>)[column.id] as React.ReactNode}
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
