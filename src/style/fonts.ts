import { Chakra_Petch, Space_Mono, Lobster, Jost, Inter } from "next/font/google";

export const chakraPetch = Chakra_Petch({
    subsets: ['latin'],
    variable: "--font-chakra",
    weight: ["300", "400", "500", "600", "700"]
});

export const spaceMono = Space_Mono({
    subsets: ['latin'],
    variable: "--font-space",
    weight: ["400", "700"]
});

export const lobster = Lobster({
    subsets: ['latin'],
    variable: "--font-lobster",
    weight: ["400"]
})

export const jost = Jost({
    subsets: ['latin'],
    variable: "--font-jost",
    weight: ["300", "400", "500", "700"]
});

export const inter = Inter({
    subsets: ['latin'],
    variable: "--font-inter",
    weight: ["400", "600"]
});

export const fonts = [
    chakraPetch,
    spaceMono,
    lobster,
    jost,
    inter
];