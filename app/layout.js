import "./globals.css";
import { Lora } from "next/font/google";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // regular → bold for headings
});

export const metadata = {
  title: "Agenda Site",
  description: "Ward agenda generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={lora.className}>
        {children}
      </body>
    </html>
  );
}


