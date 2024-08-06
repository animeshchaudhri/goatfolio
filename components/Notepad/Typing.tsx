import Typewriter from "typewriter-effect";

const TypingTextarea = () => {
  const lyrics = [
    "For me, giving up is way harder than trying.",
    "We all self-conscious. I'm just the first to admit it.",
    "I refuse to accept other people's ideas of happiness for me. As if there's a 'one size fits all' standard for happiness.",
    "The prettiest people do the ugliest things.",
    "Believe in your flyness... conquer your shyness.",
  ];

  return (
    <div className="bg-white  p-3 ">
      <Typewriter
        options={{
          strings: lyrics,
          autoStart: true,
          loop: true,
        }}
      />
      <textarea className="w-full h-full text-lg border-none outline-none"></textarea>
    </div>
  );
};

export default TypingTextarea;
