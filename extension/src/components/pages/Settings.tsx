import React, { useRef, useState, useEffect } from 'react'
import { Input } from '~components/ui/input'
import { RightArrow } from '~components/icons';
import { validateAndExtractDomain } from '~utils/extract-domain';
import { useToast } from '~hooks/use-toast';
import { Toaster } from '~components/ui/toaster';
import { Badge } from '~components/ui/badge';
import { X } from 'lucide-react';
import { useStorage } from '@plasmohq/storage/hook';
import { MultiSelect } from '~components/ui/multiSelect';
import axios from 'axios';
import { GlobalStore } from '~storage/global-storage';

interface BannedSiteProps {
    siteName: string;
    onRemove: () => void;
}
const BannedSite = ({ siteName, onRemove }: BannedSiteProps) => (
    <Badge className='h-9 w-full' variant='outline'>
        <span className='w-full uppercase text-sm flex items-center justify-between'>
            {siteName}
            <X className='cursor-pointer hover:text-muted' onClick={onRemove} />
        </span>
    </Badge>
);

export default function Settings() {
    const [userGoal, setUserGoal] = useStorage('userGoal', (v) => v === undefined ? "" : v);
    const [tmrGoal, setTmrGoal] = useStorage('tmrGoal', (v) => v === undefined ? "" : v);
    const [walletId, setWalletId] = useStorage('walletId', (v) => v === undefined ? "" : v);
    const [grantContinueUri, setGrantContinueUri] = useState<string | null>(null);
    const [grantAccessToken, setGrantAccessToken] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useStorage('accessToken', (v) => v === undefined ? null : v);
    const siteInputRef = useRef<HTMLInputElement | null>(null);
    const userInputRef = useRef<HTMLInputElement | null>(null);
    const userGoalRef = useRef<HTMLInputElement | null>(null);
    const moneyInputRef = useRef<HTMLInputElement | null>(null);
    const { toast } = useToast();
    const [blockedSites, setBlockedSites] = useStorage<string[]>('blockedSites', (v) => v === undefined ? [] : v);
    const [blockedTopics, setBlockedTopics] = useStorage<string[]>('blockedTopics', (v) => v === undefined ? [] : v);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationDisabled, setConfirmationDisabled] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

    const possibleBlockedSitesList = [
        { value: "anime", label: "Anime" },
        { value: "gaming", label: "Gaming" },
        { value: "gambling", label: "Gambling" },
        { value: "entertainment", label: "Entertainment" },
        { value: "reels", label: "Reels" },
    ];

    const addSite = () => {
        if (!siteInputRef.current) return;

        const input = siteInputRef.current.value;
        const result = validateAndExtractDomain(input);

        if (!result.isValid) {
            toast({
                variant: "destructive",
                title: 'Uh oh! Something went wrong',
                description: `Invalid Input: ${result.error}`
            });
            return;
        }

        // Clear input
        setBlockedSites((prevSites) => {
            const newSites = new Set(prevSites);
            const prevSize = newSites.size;
            newSites.add(result.domain);
            const newSize = newSites.size;

            // Check if its duplicate
            if (prevSize === newSize) {
                toast({
                    variant: "destructive",
                    title: 'Uh oh! Something went wrong',
                    description: `Invalid Input: Duplicate Blacklisted Site`
                });
            }
            const newSitesArr = Array.from(newSites);
            return newSitesArr;
        });
        siteInputRef.current.value = '';
        return;
    }

    const removeSite = (siteToRemove: string) => {
        setBlockedSites((prevSites) => prevSites.filter((site) => site !== siteToRemove));
    }

    const addUser = async () => {
        axios.post(`${process.env.PLASMO_PUBLIC_SERVER_URL}/new-user`)

        const userInput = userInputRef.current?.value;

        if (!userInput || !userInput.startsWith('https://ilp.interledger-test.dev/')) {
            toast({
                variant: "destructive",
                title: 'Uh oh! Something went wrong',
                description: `Invalid User Input: must be of format https://ilp.interledger-test.dev/`
            });
            return;
        }

        try {
            const response = await axios.post(`${process.env.PLASMO_PUBLIC_SERVER_URL}/new-user`, { wallet_id: userInput },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // Clear input on success
            if (userInputRef.current) {
                setWalletId(userInputRef.current.value);
                userInputRef.current.value = '';
            }

            toast({
                title: 'Success',
                description: `Successfully added user!`
            });


        } catch (error) {
            console.error('Error adding user:', error);
            toast({
                variant: "destructive",
                title: 'Uh oh! Something went wrong',
                description: `Invalid User Input: ${error}`
            });
        }
    }

    const addGoal = () => {
        // Get current date and format it consistently
        const currentDate = new Date();
        const today = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

        // Extract dates from existing goals if they exist
        const userGoalDate = userGoal ? userGoal.split(/(\d{2}\/\d{2}\/\d{4})/)[1] : null;
        const tmrGoalDate = tmrGoal ? tmrGoal.split(/(\d{2}\/\d{2}\/\d{4})/)[1] : null;

        // Check if goals need to be updated based on dates
        if (userGoalDate && userGoalDate !== today) {
            // Today's goal is outdated, shift tomorrow's goal to today if it exists
            if (tmrGoalDate === today) {
                // Tomorrow's goal becomes today's goal
                setUserGoal(tmrGoal);
                setTmrGoal(null);
            } else {
                // Clear outdated goal
                setUserGoal(null);
            }
        }

        if (tmrGoalDate && tmrGoalDate !== tomorrowDate) {
            // Tomorrow's goal is outdated, clear it
            setTmrGoal(null);
        }

        // Now handle the new goal input
        if (!userGoalRef.current?.value) {
            toast({
                variant: "destructive",
                title: 'Please enter a valid wallet address',
                description: `Invalid User Input: must be of format https://ilp.interledger-test.dev/`
            });
            return;
        }

        // Set the new goal based on what's missing
        if (!userGoal) {
            // No today's goal, set it for today
            setUserGoal(userGoalRef.current.value + today);
        } else if (!tmrGoal) {
            // Today's goal exists, set tomorrow's goal
            setTmrGoal(userGoalRef.current.value + tomorrowDate);
        } else {
            toast({
                variant: "destructive",
                title: 'Oops you cannot modify the goal for today and tomorrow at the same time',
                description: `Both today's and tomorrow's goals are already set`
            });
        }
    }

    const validateAndAddGoal = () => {
        if (!userGoalRef.current?.value) {
            toast({
                variant: "destructive",
                title: 'Please enter a goal',
                description: "You need to specify a time goal in minutes"
            });
            return;
        }

        const goalValue = userGoalRef.current.value;
        // Check if input is a valid positive number
        if (isNaN(Number(goalValue)) || Number(goalValue) <= 0) {
            toast({
                variant: "destructive",
                title: 'Invalid goal format',
                description: "Please enter a positive number of minutes"
            });
            return;
        }

        addGoal();
    }

    const removeTmrGoal = () => {
        setTmrGoal(null);
        toast({
            title: "Goal removed",
            description: "Tomorrow's goal has been removed"
        });
    }

    const validateAndAddMoney = async () => {
        if (!moneyInputRef.current?.value) {
            toast({
                variant: "destructive",
                title: 'Please enter an amount',
                description: "You need to specify a dollar amount"
            });
            return;
        }

        // Remove $ if present and trim whitespace
        const amount = moneyInputRef.current.value.replace('$', '').trim();
        
        // Check if it's a valid positive number with up to 2 decimal places
        if (!/^\d+(\.\d{0,2})?$/.test(amount) || parseFloat(amount) <= 0) {
            toast({
                variant: "destructive",
                title: 'Invalid amount format',
                description: "Please enter a valid positive dollar amount (e.g. $10 or $10.50)"
            });
            return;
        }

        try {
            if (!walletId.startsWith("https://ilp.interledger-test.dev/")) {
                toast({
                    variant: "destructive",
                    title: 'Invalid wallet ID',
                    description: "Please enter a valid wallet ID"
                });
                return
            }
            const response = await axios.post(`${process.env.PLASMO_PUBLIC_SERVER_URL}/initiate-payment`, {senderWallet: walletId, receiverWallet: "https://ilp.interledger-test.dev/1b62a0b8", amount: parseFloat(amount) * 100 });
            
            setGrantContinueUri(response.data.grantContinueUri);
            setGrantAccessToken(response.data.grantAccessToken);
            
            setRedirectUrl(response.data.redirectUrl);
            setShowConfirmation(true);
            
            // Open the redirect URL in a new tab
            window.open(response.data.redirectUrl, '_blank');
        } catch (error) {
            toast({
                variant: "destructive",
                title: 'Transfer failed',
                description: "Failed to initiate money transfer. Please try again."
            });
        }
    }

    const handleConfirmation = async (confirmed: boolean) => {
        setConfirmationDisabled(true);
        // TODO: Store confirmation status
        if (confirmed) {
            const response = await axios.post(`${process.env.PLASMO_PUBLIC_SERVER_URL}/get-continue-uri`, { grantAccessToken, grantContinueUri});
            const accessToken = response.data.access_token;
            setAccessToken(accessToken);
        }
        toast({
            title: confirmed ? "Payment confirmed" : "Payment cancelled",
            description: confirmed ? "Thank you for your contribution!" : "Maybe next time!"
        });
    }

    return (
        <div className='space-y-3 flex flex-col w-full h-full'>
            <div className='flex space-x-3 w-full h-[50%]'>

                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 w-[70%] h-full'>
                    <span className='text-xl pb-3 font-mono'><span className='text-primary'>Digital Wallet</span> information</span>

                    {/* Wallet Input */}
                    <div className='relative'>
                        <Input
                            className='h-10 w-56 font-serif mb-4'
                            type='text'
                            placeholder={walletId.startsWith("https://ilp.interledger-test.dev/") ? "Wallet configured: " + walletId : "e.g. https://ilp.interledger-test.dev/alice"}
                            ref={userInputRef}
                            disabled={walletId.startsWith("https://ilp.interledger-test.dev/")}
                            onKeyDown={event => { if (event.key === 'Enter') addUser() }}
                        />
                    </div>

                    {/* Goals Section */}
                    <div className='mt-6'>
                        <span className='text-lg font-mono mb-4 block'>Daily <span className='text-primary'>Goals</span></span>
                        
                        {/* Display current goals */}
                        <div className='flex space-x-8 mb-4'>
                            <div className='flex flex-col space-y-2'>
                                <span className='text-sm font-medium'>Today's Goal</span>
                                {userGoal ? (
                                    <Badge variant='outline' className='px-4 py-2'>
                                        {userGoal.split(/(\d{2}\/\d{2}\/\d{4})/)[0]} minutes
                                    </Badge>
                                ) : (
                                    <span className='text-muted-foreground italic'>No goal set</span>
                                )}
                            </div>
                            
                            <div className='flex flex-col space-y-2'>
                                <span className='text-sm font-medium'>Tomorrow's Goal</span>
                                {tmrGoal ? (
                                    <Badge variant='outline' className='px-4 py-2 pr-2 flex items-center justify-between'>
                                        <span>{tmrGoal.split(/(\d{2}\/\d{2}\/\d{4})/)[0]} minutes</span>
                                        <X 
                                            className='ml-2 h-4 w-4 cursor-pointer hover:text-destructive transition-colors'
                                            onClick={removeTmrGoal}
                                        />
                                    </Badge>
                                ) : (
                                    <span className='text-muted-foreground italic'>No goal set</span>
                                )}
                            </div>
                        </div>

                        {/* Goal input section */}
                        <div className='flex space-x-4 items-center'>
                            <div className='relative flex-1 max-w-[14rem]'>
                                <Input
                                    className='h-10 w-full font-serif pr-16'
                                    type='text'
                                    placeholder='e.g. 30'
                                    ref={userGoalRef}
                                    onKeyDown={event => { if (event.key === 'Enter') validateAndAddGoal() }}
                                />
                                <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                                    minutes
                                </span>
                            </div>

                            <div 
                                className="flex cursor-pointer h-9 p-2 items-center transition-all rounded-[4px]
                                focus-visible:outline focus-visible:outline-neutral-800
                                bg-primary-light hover:bg-primary active:scale-[98%] w-28"
                                onClick={validateAndAddGoal}
                            >
                                <span className="uppercase text-sm flex items-center">
                                    <RightArrow className="h-5 w-5" />
                                </span>
                                <span className="uppercase text-sm flex items-center">
                                    set goal
                                </span>
                            </div>
                        </div>

                        {/* Money Input Section */}
                        <div className='mt-6'>
                            <span className='text-lg font-mono mb-4 block'>Set <span className='text-primary'>Money</span> Amount</span>
                            
                            <div className='flex space-x-4 items-center'>
                                {!showConfirmation ? (
                                    <>
                                        <div className='relative flex-1 max-w-[14rem]'>
                                            <Input
                                                className='h-10 w-full font-serif pl-6'
                                                type='text'
                                                placeholder='e.g. 10.50'
                                                ref={moneyInputRef}
                                                onKeyDown={event => { if (event.key === 'Enter') validateAndAddMoney() }}
                                            />
                                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                                                $
                                            </span>
                                        </div>

                                        <div 
                                            className="flex cursor-pointer h-9 p-2 items-center transition-all rounded-[4px]
                                            focus-visible:outline focus-visible:outline-neutral-800
                                            bg-primary-light hover:bg-primary active:scale-[98%] w-28"
                                            onClick={validateAndAddMoney}
                                        >
                                            <span className="uppercase text-sm flex items-center">
                                                <RightArrow className="h-5 w-5" />
                                            </span>
                                            <span className="uppercase text-sm flex items-center">
                                                set amount
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className='flex space-x-4'>
                                        <button
                                            className={`px-4 py-2 rounded-md ${confirmationDisabled ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
                                            onClick={() => handleConfirmation(true)}
                                            disabled={confirmationDisabled}
                                        >
                                            Yes, Completed
                                        </button>
                                        <button
                                            className={`px-4 py-2 rounded-md ${confirmationDisabled ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
                                            onClick={() => handleConfirmation(false)}
                                            disabled={confirmationDisabled}
                                        >
                                            No, Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Money explanation */}
                            <div className='text-sm text-muted-foreground mt-4'>
                                <p>Set an amount to contribute to your goal.</p>
                                <p>This will be used for your daily challenges.</p>
                                {showConfirmation && !confirmationDisabled && (
                                    <p className='text-primary mt-2'>Please confirm if you completed the payment in the new tab.</p>
                                )}
                            </div>
                        </div>

                        {/* Goal explanation */}
                        <div className='text-sm text-muted-foreground mt-4'>
                            <p>Goals will automatically update at midnight.</p>
                            <p>You can set goals for today and tomorrow.</p>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 w-[30%] h-full'>
                    <span className='text-xl pb-2 font-mono'>Your <span className='text-primary'>privacy </span>is <span className='text-primary'>important</span></span>

                    <blockquote className="text-lg border-muted border-l-2 pl-6 mb-2 italic">
                        We understand that addiction recovery can be sensitive
                    </blockquote>


                    <strong className='tracking-tight text-base my-2'>
                        Your data stays yours — always. Your browsing history, blacklisted sites, and identity your <a className='underline text-secondary' href='https://support.google.com/chrome/a/answer/9902456?hl=en' target='_blank'>never leaves your device;</a>
                    </strong>


                    <strong className='tracking-tight text-base my-2'>
                        To process anonymous challenge rewards, we make sure to only use <a className='underline text-secondary' href='https://cloudian.com/guides/data-protection/data-encryption-the-ultimate-guide/' target='_blank'>encrypted data</a> so nothing gets sent to our servers
                    </strong>

                </div>
            </div>

            <div className='flex space-x-3 w-full h-[50%]'>

                {/* Blacklist sites container */}
                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 w-[60%] h-full'>
                    <span className='text-xl pb-3 font-mono'>Sites to <span className='text-primary'>blacklist</span></span>

                    <div className='flex space-x-4'>
                        <Input
                            className='h-10 w-56 font-serif'
                            type='text' placeholder='e.g. youtube.com'
                            ref={siteInputRef}
                            onKeyDown={event => { if (event.key === 'Enter') addSite() }} />


                        <div className="flex cursor-pointer h-9 p-2 items-center transition-all rounded-[4px]
                        focus-visible:outline focus-visible:outline-neutral-800
                        bg-primary-light hover:bg-primary active:scale-[98%] w-28" onClick={() => addSite()}>

                            <span className="uppercase text-sm flex items-center">
                                <RightArrow className="h-5 w-5" />
                            </span>

                            <span className="uppercase text-sm flex items-center">
                                enter
                            </span>
                        </div>
                    </div>
                    <div className="pt-4 flex flex-col space-y-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                        {Array.from({ length: Math.ceil(blockedSites.length / 3) }, (_, rowIndex) => (
                            <div key={rowIndex} className="flex space-x-3">
                                {blockedSites.slice(rowIndex * 3, (rowIndex + 1) * 3).map((site, idx) => (
                                    <div key={idx} className="w-1/3">
                                        <BannedSite
                                            siteName={site}
                                            onRemove={() => removeSite(site)}
                                        />
                                    </div>
                                ))}
                                {/* Add invisible placeholder items to maintain layout */}
                                {[...Array(3 - (blockedSites.slice(rowIndex * 3, (rowIndex + 1) * 3).length))].map((_, idx) => (
                                    <div key={`placeholder-${idx}`} className="w-1/3" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Blacklist sites explanation */}
                <div className='flex flex-col bg-container rounded-md border border-2 border-container-outline p-8 w-[40%] h-full'>
                    <span className='text-xl pb-3 font-mono'><span className='text-primary'>Blacklisting</span> by common <span className='text-primary'>topics</span></span>
                    <MultiSelect options={possibleBlockedSitesList} placeholder='' onValueChange={setBlockedTopics} defaultValue={blockedTopics} />
                </div>
            </div>

            <Toaster />
        </div>
    )
}


