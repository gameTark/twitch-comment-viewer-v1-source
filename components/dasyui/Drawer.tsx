"use client";

import { createContext, ReactNode, useContext } from "react";

/**
https://daisyui.com/components/drawer/
drawer	Component	The root container
drawer-toggle	Component	For the hidden checkbox that controls the drawer
drawer-content	Component	Container for all page content
drawer-side	Component	The sidebar container
drawer-overlay	Component	The label covers the content when drawer is open
drawer-end	Modifier	puts drawer to the right
drawer-open	Responsive	Forces the drawer to be open
 */
const DRAWER_NAME = "notification-drawer-001";

const notificationContext = createContext<string[]>([]);

const useNotificationContext = () => useContext(notificationContext);

export const DrawerOpener = (props: { children: ReactNode }) => {
  return (
    <label htmlFor={DRAWER_NAME} className="cursor-pointer">
      {props.children}
    </label>
  );
};
const Layout = (props: { children?: ReactNode }) => {
  const notificationContext = useNotificationContext();
  return (
    <div className="drawer drawer-end">
      <input id={DRAWER_NAME} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{props.children}</div>
      <div className="drawer-side">
        <label htmlFor={DRAWER_NAME} aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          {notificationContext.map((val, index) => {
            return <li key={index}>{val}</li>;
          })}
        </ul>
      </div>
    </div>
  );
};

export const Drawer = (props: { children: ReactNode }) => {
  return (
    <notificationContext.Provider value={["test"]}>
      {props.children}
      <Layout />
    </notificationContext.Provider>
  );
};
