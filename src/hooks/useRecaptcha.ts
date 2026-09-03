import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const useRecaptcha = () => {
	const { executeRecaptcha } = useGoogleReCaptcha();

	const getRecaptchaToken = async (action = "submit"): Promise<string | null> => {
		if (!executeRecaptcha) return null;
		return await executeRecaptcha(action);
	};

	return { getRecaptchaToken };
};

export default useRecaptcha;