import React from "react"
import { DashboardIcon, ChallengeIcon, AwardIcon, SettingIcon, Logo } from "./icons"
import { ActiveState } from "~options";

interface SidebarProps {
    active: string;
    setActive: React.Dispatch<React.SetStateAction<ActiveState>>
}

function Sidebar({ active, setActive }: SidebarProps) {
    return (
        <div className="flex flex-col select-none m-1 sticky top-2 h-[calc(100vh-16px)] w-64 bg-container 
                        rounded-lg border-[2px] border-container-outline">
            <div className="flex items-center mt-3 space-x-2">
                <Logo className="h-16 w-16" />
                <strong className="text-primary font-bold text-2xl h-full leading-[3.2rem]">ZenSurf</strong>
            </div>

            <div className="mt-6 ml-6 flex flex-col grow space-y-2">
                <p className=" text-base uppercase text-muted pb-3">app</p>

                <div onClick={() => setActive(ActiveState.Dashboard)} className={`flex w-56 h-10 rounded-md -ml-4 cursor-pointer border-l-[4px] ${active == "dashboard" ? 'border-l-primary bg-container-outline' : 'border-transparent'}`}>
                    <div className="flex ml-6 space-x-2">
                        <span className="uppercase text-sm flex items-center"><ChallengeIcon className="h-5 w-5" /></span>
                        <span className="uppercase text-sm flex items-center pb-[2px]">dashboard</span>
                    </div>
                </div>


                <div onClick={() => setActive(ActiveState.Challenges)} className={`flex w-56 h-10 rounded-md -ml-4 cursor-pointer border-l-[4px] ${active == "challenges" ? 'border-l-primary bg-container-outline' : 'border-transparent'}`}>
                    <div className="flex ml-6 space-x-2">
                        <span className="uppercase text-sm flex items-center"><DashboardIcon className="h-5 w-5" /></span>
                        <span className="uppercase text-sm flex items-center pb-[2px]">leaderboard</span>
                    </div>
                </div>

                <div onClick={() => setActive(ActiveState.Settings)} className={`flex w-56 h-10 rounded-md -ml-4 cursor-pointer border-l-[4px] ${active == "settings" ? 'border-l-primary bg-container-outline' : 'border-transparent'}`}>
                    <div className="flex ml-6 space-x-2">
                        <span className="uppercase text-sm flex items-center"><SettingIcon className="h-5 w-5" /></span>
                        <span className="uppercase text-sm flex items-center pb-[2px]">settings</span>
                    </div>
                </div>

            </div>


            <div className="mt-6 mb-3 flex flex-col">
                <hr className="w-52 border-t-[2px] my-3 border-container-outline mx-auto" />
                <p className="text-sm ml-6 uppercase text-muted">account</p>
            </div>
        </div >
    )
}

export default Sidebar
