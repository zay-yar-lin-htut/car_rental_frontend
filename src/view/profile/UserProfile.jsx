import React from "react";
import { AiFillDribbbleCircle } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { IoMdNotificationsOutline } from "react-icons/io";
import { RiChatHistoryLine } from "react-icons/ri";
import { Outlet, useNavigate } from "react-router";

const sidebarItems = [
	{
		name: "Profile",
		icon: <CgProfile style={{ width: 30, height: 30 }} />,
		navLink: "/user-profile",
	},
	{
		name: "Notification",
		icon: <IoMdNotificationsOutline style={{ width: 30, height: 30 }} />,
		navLink: "/user-profile/notification",
	},
	{
		name: "History",
		icon: <RiChatHistoryLine style={{ width: 30, height: 30 }} />,
		navLink: "/user-profile/history",
	},
];

const UserProfile = () => {
	const navigate = useNavigate();

	return (
		<>
			<div className='w-full h-screen relative flex '>
				{/* side bar  */}
				<div className='h-100vh w-20   flex flex-col bg-blue-600  items-center'>
					<div className=' h-1/4  my-4'>
						<div
							onClick={() => {
								navigate(-1);
							}}
							className='w-13 h-13 rounded-full bg-white hover:cursor-pointer '>
							<img
								src='logo.png'
								alt='Logo'
								className='w-full  h-full object-cover '
							/>
						</div>
					</div>
					<div className='flex flex-col items-center  gap-8 p-2'>
						{sidebarItems.map((item, index) => {
							const isActive = item.navLink === window.location.pathname;
							return (
								<div
									key={index}
									className={`w-12 h-12 flex items-center justify-center rounded-xl ${
										isActive
											? "bg-white text-blue-600"
											: "hover:bg-gray-700 hover:text-white"
									} cursor-pointer transition-all duration-300 ease-in-out`}
									onClick={() => navigate(item.navLink)}>
									{item.icon}
								</div>
							);
						})}
					</div>
					<div />
				</div>

				<div className=' w-full p-16  '>
					<Outlet />
				</div>
			</div>
		</>
	);
};

export default UserProfile;
