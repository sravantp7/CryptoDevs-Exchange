export const metadata = {
  title: "DEX",
  description: "Decentralized Exchange",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
