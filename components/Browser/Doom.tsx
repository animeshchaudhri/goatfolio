// // @ts-ignore
// import React, { useEffect, useRef } from "react";

// const DoomGame = () => {
//   const dosboxRef = useRef(null);

//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://js-dos.com/cdn/js-dos-api.js";
//     script.async = true;
//     document.body.appendChild(script);

//     script.onload = () => {
//       if (window.Dosbox) {
//         new window.Dosbox({
//           id: "dosbox",
//           onload: function (dosbox) {
//             dosbox.run("upload/DOOM-@evilution.zip", "./doom");
//           },
//           onrun: function (dosbox, app) {
//             console.log("App '" + app + "' is running");
//           },
//         });
//       }
//     };

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   const requestFullScreen = () => {
//     if (dosboxRef.current && dosboxRef.current.requestFullScreen) {
//       dosboxRef.current.requestFullScreen();
//     }
//   };

//   return (
//     <div>
//       <div
//         id="dosbox"
//         ref={dosboxRef}
//         style={{ width: "320px", height: "200px" }}
//       >
//         <div
//           style={{
//             background: "url(https://js-dos.com/cdn/DOOM.png)",
//             width: "100%",
//             height: "100%",
//           }}
//         />
//       </div>
//       <br />
//       <button onClick={requestFullScreen}>Make fullscreen</button>
//     </div>
//   );
// };

// export default DoomGame;
