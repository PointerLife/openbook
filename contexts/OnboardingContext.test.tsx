import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();

import { expect, test, describe } from "bun:test";
import { renderHook } from "@testing-library/react";
import { OnboardingProvider, useOnboarding } from "./OnboardingContext";
import React from "react";

describe("OnboardingContext", () => {
    test("should throw error if used outside of provider", () => {
        // Suppress console.error for expected errors
        const originalError = console.error;
        console.error = () => {};
        try {
            expect(() => renderHook(() => useOnboarding())).toThrow();
        } finally {
            console.error = originalError;
        }
    });

    test("should provide initial state", () => {
        const wrapper = ({ children }) => (
            React.createElement(OnboardingProvider, null, children)
        );
        const { result } = renderHook(() => useOnboarding(), { wrapper });

        expect(result.current.isVisible).toBe(false);
        expect(result.current.activeStep).toBe(0);
        expect(result.current.isCompleted).toBe(false);
    });
});
