/* eslint-disable @next/next/no-page-custom-font */
import React from "react";

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

interface AuthOtpProps {
  loginCode?: string;
}

const AuthOtp = ({
  loginCode,
}: AuthOtpProps) => (
  <Html>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Tektur:wght@400..900&display=swap" rel="stylesheet" />
    </Head>
    <Body style={styles.main}>
      <Preview>Log in with this magic link</Preview>
      <Container style={styles.container}>
        <Heading style={styles.h1}>Login with Code</Heading>
        <Text style={{ ...styles.text, marginTop: "0" }}>
          Enter the code below to log in to your account.
        </Text>

        <code style={styles.code}>{loginCode}</code>
        <Text
          style={{
            ...styles.text,
            color: "#ababab",
            marginTop: "14px",
            marginBottom: "16px",
          }}
        >
          If you didn&apos;t try to login, you can safely ignore this email.
        </Text>
        <Text style={styles.footer}>
          <Link
            href="https://grokmyfans.com"
            target="_blank"
            style={{ ...styles.link, color: "#898989" }}
          >
            Grok My Fans
          </Link>
          , 2025
        </Text>
      </Container>
    </Body>
  </Html>
);

AuthOtp.PreviewProps = {
  loginCode: "sparo-ndigo-amurt-secan",
} as AuthOtpProps;

const styles = {
  main: {
    backgroundColor: "#ffffff",
  },
  container: {
    paddingLeft: "12px",
    paddingRight: "12px",
    margin: "0 auto",
  },
  h1: {
    color: "#333",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "40px 0",
    padding: "0",
  },
  link: {
    color: "#2754C5",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    textDecoration: "underline",
  },
  text: {
    color: "#333",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "14px",
    margin: "24px 0",
  },
  footer: {
    color: "#898989",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: "12px",
    lineHeight: "22px",
    marginTop: "12px",
    marginBottom: "24px",
  },
  code: {
    display: "inline-block",
    padding: "16px 4.5%",
    width: "90.5%",
    backgroundColor: "#f4f4f4",
    borderRadius: "5px",
    border: "1px solid #eee",
    color: "#333",
  },
}





export default AuthOtp;