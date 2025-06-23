import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS CSS
import { API_ENDPOINTS, AUTH_CONFIG } from "../../services/Configuration";
import { createDataServices } from "../../services/DataServices";
import { useSnackbar } from "../../contexts/ErrorMessage";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);
const dataServices = createDataServices();

const Home = () => {
	const [logouting, setLogouting] = useState(false);
	const isLogin = AUTH_CONFIG.isAuthenticated();
	const navigate = useNavigate();
	const { showSnackbar } = useSnackbar();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navRef = useRef(null);

	// Navigation links data
	const navLinks = [
		{ to: "/", label: "Home", active: true },
		{ to: "/cars", label: "Our Cars", active: false },
		{ to: "/pricing", label: "Pricing", active: false },
		{ to: "/locations", label: "Locations", active: false },
		{ to: "/about", label: "About Us", active: false },
		{ to: "/contact", label: "Contact", active: false },
	];

	const handleLogout = () => {
		setLogouting(true);

		dataServices
			.Logout(API_ENDPOINTS.auth.logout)
			.then((response) => {
				setLogouting(false);
				AUTH_CONFIG.clearToken();
				AUTH_CONFIG.clearUserData();
				showSnackbar(response.message, "success");
			})
			.catch((error) => {
				console.error("Logout failed:", error);
				setLogouting(false);
				showSnackbar(error.message, "error");
			});
	};
	console.log("Auth Token:", AUTH_CONFIG.getToken());
	console.log("user Data :", AUTH_CONFIG.getUserData()); // Assuming this returns user data if logged in

	useEffect(() => {
		// Initialize AOS
		AOS.init({
			duration: 1000, // Animation duration
			once: false, // Whether animation should happen only once
			mirror: true, // Whether elements should animate out while scrolling past them
			easing: "ease-in-out", // Easing type
		});

		// Initial state of navbar
		gsap.set(navRef.current, {
			backgroundColor: "rgba(255, 255, 255, 0.8)",
			backdropFilter: "blur(0px)",
			height: "64px",
		});

		// Create animation for navbar on scroll
		const navAnimation = gsap.timeline({
			scrollTrigger: {
				trigger: "body",
				start: "top top",
				end: "50px",
				scrub: true,
			},
		});

		navAnimation.to(navRef.current, {
			backgroundColor: "rgba(255, 255, 255, 0.95)",
			backdropFilter: "blur(8px)",
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
			height: "60px",
			duration: 0.3,
			ease: "power2.out",
		});

		return () => {
			// Clean up ScrollTrigger when component unmounts
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
		};
	}, []);

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Navigation Bar */}
			<nav
				ref={navRef}
				className='sticky top-0 z-50 transition-all duration-300'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-16'>
						{/* Logo */}
						<div className='flex-shrink-0 flex items-center'>
							<Link
								to='/'
								className='text-blue-800 font-bold font-serif text-xl'>
								JourneyWheel
							</Link>
						</div>

						{/* Desktop Navigation Links */}
						<div className='hidden lg:flex items-center space-x-8'>
							{navLinks.map((link) => (
								<Link
									key={link.to}
									to={link.to}
									className={`${
										link.active
											? "text-gray-800 border-b-2 border-blue-600"
											: "text-gray-600 hover:border-b-2 hover:border-blue-600"
									} hover:text-blue-600 px-3 py-2 text-sm font-medium`}>
									{link.label}
								</Link>
							))}
						</div>

						{/* Auth Buttons */}
						<div className='hidden md:flex items-center space-x-4'>
							{isLogin ? (
								<>
									<Link
										onClick={handleLogout}
										className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300 flex items-center'>
										{logouting ? (
											<>
												<svg
													className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
													xmlns='http://www.w3.org/2000/svg'
													fill='none'
													viewBox='0 0 24 24'>
													<circle
														className='opacity-25'
														cx='12'
														cy='12'
														r='10'
														stroke='currentColor'
														strokeWidth='4'></circle>
													<path
														className='opacity-75'
														fill='currentColor'
														d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
												</svg>
												Logging out...
											</>
										) : (
											"Logout"
										)}
									</Link>
									<div
										onClick={() => navigate("/user-profile")}
										className='bg-amber-900 w-10 h-10 rounded-full overflow-hidden hover:cursor-pointer '>
										<img
											src='https://cdn.pixabay.com/photo/2025/05/09/01/22/waiting-9588284_1280.jpg'
											alt='user-avatar'
											className='w-10 h-10 object-cover '
										/>
									</div>
								</>
							) : (
								<>
									<Link
										to='/login'
										className='text-blue-600 border border-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition duration-300'>
										Login
									</Link>
									<Link
										to='/register'
										className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition duration-300'>
										Register
									</Link>
								</>
							)}
						</div>

						{/* Mobile menu button */}
						<div className='lg:hidden flex items-center'>
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'>
								<span className='sr-only'>Open main menu</span>
								{/* Icon when menu is closed */}
								{!isMenuOpen ? (
									<svg
										className='block h-6 w-6'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										aria-hidden='true'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M4 6h16M4 12h16M4 18h16'
										/>
									</svg>
								) : (
									/* Icon when menu is open */
									<svg
										className='block h-6 w-6'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										aria-hidden='true'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M6 18L18 6M6 6l12 12'
										/>
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile menu, show/hide based on menu state */}
				{isMenuOpen && (
					<div className='lg:hidden  bg-white'>
						<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
							{navLinks.map((link) => (
								<Link
									key={link.to}
									to={link.to}
									className={`${
										link.active
											? "bg-blue-50 text-blue-600"
											: "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
									} block px-3 py-2 rounded-md text-base font-medium`}>
									{link.label}
								</Link>
							))}
						</div>
						<div className='pt-4 pb-3 border-t border-gray-200 md:hidden'>
							<div className='flex items-center px-5 space-x-3'>
								{isLogin ? (
									<Link
										onClick={handleLogout}
										className='text-blue-600 border border-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 w-full text-center'>
										Logout
									</Link>
								) : (
									<>
										<Link
											to='/login'
											className='text-blue-600 border border-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 w-full text-center'>
											Login
										</Link>
										<Link
											to='/register'
											className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 w-full text-center'>
											Register
										</Link>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</nav>

			{/* Main content area */}
			<div className='w-full h-[calc(100vh-4rem)] relative'>
				<div className='lg:max-w-[70%] h-full mix-w-full    bg-blue-600'>
					<div className='max-w-[600px] h-[20rem]    lg:h-full px-4 lg:ml-42 lg:px-0  flex flex-col justify-center'>
						<p
							data-aos='fade-right'
							className='text-white text-base sm:text-xl font-bold uppercase'>
							Find Your Dream Car
						</p>
						<h1
							data-aos='fade-right'
							className='text-3xl sm:text-4xl font-bold text-white py-4'>
							Experience the <br />
							<span className='text-blue-400'>
								Best <br />
							</span>{" "}
							Car Rental
						</h1>
						<p
							data-aos='fade-right'
							className='text-gray-300 text-sm  sm:text-lg py-4'>
							We offer a wide range of cars to suit every need and budget.
						</p>
					</div>
				</div>
				<div
					data-aos='fade-left'
					className='absolute top-[25%]  right-[15%] hidden lg:inline lg:w-[30rem] lg:h-96'>
					<img
						src='/home-img.png'
						alt='home-car'
						className='w-full h-full object-contain'
					/>
				</div>
				<div
					// data-aos='slide-up'
					className='min-w-full h-2/5 lg:hidden bg-slate-50 absolute bottom-0 left-0 '>
					<div
						data-aos='fade-left'
						className='sm:w-[25rem] w-72 h-72 sm:h-[25rem] relative left-[25%]   sm:-top-[80%] -top-[50%] '>
						<img
							src='/home-img.png'
							alt='home-car'
							className='w-full h-full object-contain'
						/>
					</div>
				</div>

				{/* Add some scrollable content to test the animation */}
				<div className='py-20 bg-cyan-900'>
					<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
						<div className='text-center'>
							<h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
								Find Your Perfect Ride
							</h2>
							<p className='mt-4 text-xl text-gray-500'>
								Browse our extensive collection of vehicles for any occasion
							</p>
						</div>

						{/* Add more content sections to enable scrolling */}
						{[...Array(5)].map((_, i) => (
							<div
								key={i}
								className='mt-20 bg-white p-10 rounded-lg shadow-md'>
								<h3 className='text-2xl font-bold text-gray-800'>
									Section {i + 1}
								</h3>
								<p className='mt-4 text-gray-600'>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
									do eiusmod tempor incididunt ut labore et dolore magna aliqua.
									Ut enim ad minim veniam, quis nostrud exercitation ullamco
									laboris nisi ut aliquip ex ea commodo consequat.
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
