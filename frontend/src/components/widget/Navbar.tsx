"use client"
import { Globe, User, Settings, LogOut } from "lucide-react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image";
import Logo from "../../../public/KAI-Logo.png"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Checked = DropdownMenuCheckboxItemProps["checked"]

export default function Navbar() {
    const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true)
    const [showPanel, setShowPanel] = React.useState<Checked>(false)
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [userName, setUserName] = React.useState("")
    const [userEmail, setUserEmail] = React.useState("")
    const router = useRouter();

    // Fetch user data from API if not in localStorage
    const fetchUserData = React.useCallback(async () => {
        try {
            const response = await fetch("http://localhost:5000/api/user/session", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem("user_email", userData.email);
                localStorage.setItem("user_name", userData.nama_keluarga || "User");
                setUserEmail(userData.email);
                setUserName(userData.nama_keluarga || "User");
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    }, []);

    // Check for session on component mount and when storage changes
    React.useEffect(() => {
        const checkSession = async () => {
            const sessionId = document.cookie.split("; ").find(row => row.startsWith("session_id="))?.split("=")[1];
            const localSession = localStorage.getItem("session_id");
            
            const hasValidSession = (sessionId && sessionId.startsWith("user_")) || (localSession && localSession.startsWith("user_"));
            setIsLoggedIn(Boolean(hasValidSession));

            // Get user info from localStorage if logged in
            if (hasValidSession) {
                const storedUserName = localStorage.getItem("user_name");
                const storedUserEmail = localStorage.getItem("user_email");
                
                if (storedUserEmail && storedUserName) {
                    setUserName(storedUserName);
                    setUserEmail(storedUserEmail);
                } else {
                    // Fetch from API if not in localStorage
                    await fetchUserData();
                }
            } else {
                setUserName("");
                setUserEmail("");
            }
        };
        
        checkSession();
        
        const handleStorageChange = () => {
            checkSession();
        };
        
        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(checkSession, 5000); // Reduced frequency
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [fetchUserData]);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await fetch("http://localhost:5000/api/logout", {
                method: "POST",
                credentials: "include",
            });
            // Clear session cookie
            document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
            
            // Clear localStorage
            localStorage.removeItem("session_id");
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_email");
            
            setIsLoggedIn(false);
            setUserName("");
            setUserEmail("");
            toast.success("Logout berhasil");
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
            // Even if API call fails, clear local session
            document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
            localStorage.removeItem("session_id");
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_email");
            setIsLoggedIn(false);
            setUserName("");
            setUserEmail("");
            toast.success("Logout berhasil");
            router.push("/");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileClick = () => {
        router.push("/profile");
    };

    const handleSettingsClick = () => {
        router.push("/settings");
    };

    return (
        <header className="flex items-center justify-between px-1 py-4 border-b border-gray-100 max-w-7xl mx-auto">
            <Image className="h-full w-14" src={Logo} alt="" />

            <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-600 hover:text-black">
                    Beranda
                </Link>
                <Link href="/layanan" className="text-gray-600 hover:text-black">
                    Layanan
                </Link>
                <Link href="/rute" className="text-gray-600 hover:text-black">
                    Rute Rel
                </Link>
                <Link href="#" className="text-gray-600 hover:text-black">
                    Pre-Order
                </Link>
            </nav>

            <div className="flex items-center space-x-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="cursor-pointer">
                            <Globe className="w-5 h-full" />
                            Bahasa
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Bahasa</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={showStatusBar}
                            onCheckedChange={setShowStatusBar}
                            className="cursor-pointer"
                        >
                            🇮🇩 Indonesia
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={showPanel}
                            onCheckedChange={setShowPanel}
                            className="cursor-pointer"
                        >
                            🇺🇸 English
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                {isLoggedIn ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src="/avatar-placeholder.png" alt={userName} />
                                    <AvatarFallback className="bg-[#003D79] text-white">
                                        {userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{userName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {userEmail}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={handleProfileClick}
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={handleSettingsClick}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Pengaturan</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={handleLogout}
                                disabled={isLoading}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{isLoading ? "Logging out..." : "Logout"}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link href="/login">
                        <Button className="bg-[#003D79] hover:bg-[#0050A0] text-white">
                            Login
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}