"use client";

import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthFormsArea() {
    const [currentView, setCurrentView] = useState<"login" | "register">("login");

    return (
        <>
            {currentView === "login" ? (
                <LoginForm onSwitchToRegister={() => setCurrentView("register")} />
            ) : (
                <RegisterForm onSwitchToLogin={() => setCurrentView("login")} />
            )}
        </>
    );
}
