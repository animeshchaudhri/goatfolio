"use client";
import Clock from "react-live-clock";
const ClientClock = () => {
  return (
    <>
      <Clock format={"HH:mm A"} ticking={true} noSsr />
      <Clock format={"DD/MM/YYYY"} ticking={true} noSsr />
    </>
  );
};
export default ClientClock;
