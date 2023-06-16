import { Roboto } from 'next/font/google'
 
const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: "W3GPT",
  description: "Web3 enabled AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.className}>

      <head>
        <link
          rel="icon"
          href="/logo.png"
        />
      </head>
      
      <body style={{
        backgroundColor: "#343541",
        margin: 0,
        padding: 0,
      }}>{children}</body>

    </html>
  );
}
