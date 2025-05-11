import React from "react";


interface AuthLayoutProps {
  children: React.ReactNode;
}


const AuthLayout = ({ children }: Readonly<AuthLayoutProps>): React.ReactElement => {
  return (
    <div className="flex-grow pt-8 w-full h-full">
      {children}
    </div>
  );
};


export default AuthLayout;