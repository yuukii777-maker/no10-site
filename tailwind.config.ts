import type { Config } from "tailwindcss";


export default {
content: [
"./app/**/*.{ts,tsx}",
"./components/**/*.{ts,tsx}",
"./pages/**/*.{ts,tsx}",
],
theme: {
extend: {}, // 既存スタイルを壊さない
},
plugins: [],
} satisfies Config;