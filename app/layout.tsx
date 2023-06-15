import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export const metadata = {
  title: "WEB3GPT",
  description: "ChatGPT meets WEB3.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">

      <head>
        <link
          rel="icon"
          href="/logo.png"
        />
      </head>
      
      <body style={{
        backgroundColor: "#F5F7F9",
      }}>{children}</body>

    </html>
  );
}
