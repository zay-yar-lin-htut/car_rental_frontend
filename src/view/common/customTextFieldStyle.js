export const customTextFieldStyle = {
	"& .MuiInputBase-input": { color: "var(--text-color)" },
	"& .MuiInputLabel-root": { color: "var(--text-secondary-color)" },
	"& .MuiInputLabel-root.Mui-focused": { color: "var(--text-color)" },
	"& .MuiOutlinedInput-root": {
		"& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
		"&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
		"&.Mui-focused fieldset": { borderColor: "var(--primary-color)" },
	},
};