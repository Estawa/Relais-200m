/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        piste: {
          nuit: "#1B1B1F",
          panneau: "#242429",
          craie: "#F5F1E8",
          brique: "#B5391E",
          briqueclair: "#D4522F",
          pelouse: "#2F6B4F",
          ambre: "#E8A33D",
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
