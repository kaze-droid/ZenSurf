import React, { useState } from 'react'
import Sidebar from '~components/Sidebar'
import Dashboard from '~components/pages/Dashboard';
import Challenges from '~components/pages/Challenges';
import Awards from '~components/pages/Awards';
import Settings from '~components/pages/Settings';

import "~style.css"

export enum ActiveState {
    Dashboard = 'dashboard',
    Challenges = 'challenges',
    Awards = 'awards',
    Settings = 'settings'
}


function Options() {
    // For active page to display on SPA
    const [active, setActive] = useState<ActiveState>(ActiveState.Dashboard);

    const renderPage = {
        [ActiveState.Dashboard]: <Dashboard />,
        [ActiveState.Challenges]: <Challenges />,
        [ActiveState.Awards]: <Awards />,
        [ActiveState.Settings]: <Settings />
    }

    return (
        <div className='flex text-[#fff] '>
            <Sidebar active={active} setActive={setActive} />
            <div className='flex px-4 py-6 h-screen w-full'>
                {renderPage[active]}
            </div>
        </div>
    )
}

export default Options
