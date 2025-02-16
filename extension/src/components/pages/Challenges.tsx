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

    console.log(leaderboardData);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">User</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead className="text-right">Current Streak</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    leaderboardData.map((datum, idx) => (
                        <>
                            <TableCell className="font-medium">{datum.user_id}</TableCell>
                            <TableCell>{datum.wallet_id}</TableCell>
                            <TableCell className="text-right">{datum.streak_count}</TableCell>
                        </>
                    ))
                }
            </TableBody>
        </Table>
    )
}

