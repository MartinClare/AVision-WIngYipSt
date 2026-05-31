import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <ScrollViewStyleReset />
        <style>{`
          html, body, #root {
            height: 100%;
            background: #0f172a;
          }
          body {
            margin: 0;
            overscroll-behavior: none;
          }
          body::before {
            content: "";
            position: fixed;
            inset: 0;
            background:
              linear-gradient(rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.38)),
              url("/assets/images/splash-web.jpg") center / cover no-repeat;
            z-index: -1;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
