import "../src/styles/main.scss";

export const metadata = {
  title: 'MaintPlant',
  description: 'Gestão de Manutenção de Válvulas',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#060810" />
      </head>
      <body>
        <div id="app">
          {children}
        </div>
      </body>
    </html>
  )
}
