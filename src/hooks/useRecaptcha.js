import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const useRecaptcha = () => {
	const { executeRecaptcha } = useGoogleReCaptcha();

	const getRecaptchaToken = async (action = "submit") => {
		if (!executeRecaptcha) return null;
		return await executeRecaptcha(action);
	};

	return { getRecaptchaToken };
};

export default useRecaptcha;