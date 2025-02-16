import React, { useState, useEffect } from 'react'
import axios from "axios";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { Top3Medal, AwardIcon } from '~components/icons';

export default function Leaderboard() {
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        const getLeaderboardData = async () => {
            try {
                const response = await axios.get(`${process.env.PLASMO_PUBLIC_SERVER_URL}/leaderboard`);
                setLeaderboardData(response.data);
            } catch (err) {
                console.error(err);
            }
        }
        getLeaderboardData();
    }, []);

    const top3Colors = ["#ffd700", "#dadcd9", "#ce8946"]


    return (
        <div className='flex h-full w-full items-center justify-center'>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Award</TableHead>
                        <TableHead className="w-[100px]">User</TableHead>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Current Streak</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        leaderboardData.sort((a, b) => b.streak_count - a.streak_count).slice(0, 3).map((datum, idx) => (
                            <TableRow>
                                <TableCell><Top3Medal fill={top3Colors[idx]} className='h-6 w-6' /></TableCell>
                                <TableCell className="font-medium">{datum.user_id}</TableCell>
                                <TableCell>{datum.wallet_id}</TableCell>
                                <TableCell>{datum.streak_count}</TableCell>
                            </TableRow>
                        ))
                    }


                    {
                        leaderboardData.sort((a, b) => b.streak_count - a.streak_count).slice(3, leaderboardData.length).map((datum, idx) => (
                            <TableRow>
                                <TableCell><AwardIcon fill="#fff" className='h-6 w-6' /></TableCell>
                                <TableCell className="font-medium">{datum.user_id}</TableCell>
                                <TableCell>{datum.wallet_id}</TableCell>
                                <TableCell>{datum.streak_count}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table >
        </div>
    )
}

