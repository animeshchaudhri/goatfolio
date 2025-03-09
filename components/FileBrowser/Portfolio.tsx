import React, { useState } from "react";
import { ExternalLink, Github, File } from "lucide-react"; 

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
}

// Sample project data
const projects: Project[] = [
  
  {
    id: "gsoc-2024",
    title: "Google Summer of Code 2024",
    description: "Developed frontend using React, Tailwind CSS, and Tauri with Rust backend for filesystem operations. Created daemons and shell scripts for automation, and utilized Python for AI tagging (object, face, and scene recognition).",
    images: ["/images/gsoc-placeholder.jpg"],
    techStack: ["React", "Tailwind CSS", "Rust", "Tauri", "Python", "AI/ML"],
    liveUrl: "https://gist.github.com/animeshchaudhri/b9c95fb87743498b5a441fa48f59c730"
  },
  {
    id: "purble-place",
    title: "Purble Place Reimagined",
    description: "Reverse-engineered the classic Purble Place game and recreated it using React.js and PixiJS for a modern web experience. Utilized Resource Hacker to extract sprite sheets and Texture Packer Pro for enhanced visuals.",
    images: ["/images/purble-place.jpg"],
    techStack: ["React.js", "PixiJS", "JavaScript", "Game Development"],
    githubUrl: "https://github.com/animeshchaudhri/purble-place"
  },
  {
    id: "dsa-atlas",
    title: "DSA Atlas",
    description: "Comprehensive Data Structures and Algorithms practice platform targeting company-specific interview preparation. Features include user authentication, problem tracking, and an interactive UI to enhance user engagement.",
    images: ["/images/dsa-atlas.jpg"],
    techStack: ["Next.js", "Express.js", "Node.js", "MongoDB", "Clerk.js", "Framer Motion"],
    githubUrl: "https://github.com/animeshchaudhri/dsa-atlas",
    liveUrl: "https://dsa-atlas.vercel.app"
  },
  {
    id: "http-server",
    title: "HTTP Server in C++",
    description: "Engineered a high-performance, multi-threaded HTTP server in C++. Handled HTTP protocols and implemented concurrent client request handling, supporting methods like GET and POST with robust error handling.",
    images: ["/images/http-server.jpg"],
    techStack: ["C++", "Multithreading", "Network Programming", "HTTP Protocol"],
    githubUrl: "https://github.com/animeshchaudhri/http-server-cpp"
  },
  
  {
    id: "hot-or-not",
    title: "Hot or Not University Edition",
    description: "A web application for rating and comparing people from your university, built with Next.js (frontend) and NestJS (backend). Users can compare two people, vote on attractiveness, view leaderboards, and skip comparisons if desired.",
    images: ["/images/hot-or-not-1.jpg"],
    techStack: ["Next.js", "NestJS", "MongoDB", "Shadcn UI", "TypeScript"],
    githubUrl: "https://github.com/animeshchaudhri/hot-or-not",
    liveUrl: "https://hot-or-not-three.vercel.app/"
  },
];

function Portfolio() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0]);

  return (
    <div className="w-full h-full flex flex-col border-[1px] border-[#7E9BC5] shadow-md overflow-hidden">
   
      
     

      <div className="flex flex-1 overflow-hidden">
        {/* Windows 7 sidebar with projects list */}
        <div className="w-1/4 bg-[#F0F6FC] border-r-[1px] border-[#B9CCE5] overflow-y-auto">
          <div className="px-2 py-3 border-b-[1px] border-[#D9E3F1]">
            <span className="text-xs text-[#0C3B80] font-bold">Project Explorer</span>
          </div>
          {projects.map(project => {
            const isCurrentProject = selectedProject?.id === project.id;
            return (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                className={`flex items-center px-2 py-1 cursor-pointer text-xs ${
                  isCurrentProject 
                    ? 'bg-[#CCE8FF] text-[#0C3B80] border-[1px] border-[#7DA2CE]' 
                    : 'text-[#0C3B80] hover:bg-[#E3EFF9]'
                }`}
              >
                <File size={16} className="mr-1 text-[#1B5891]" />
                {project.title}
              </div>
            );
          })}
        </div>

        {/* Windows 7 content area */}
        {selectedProject && (
          <div className="w-3/4 bg-white p-3 overflow-y-auto">
            <div className="bg-[#F7FBFF] border-[1px] border-[#D9E3F1] p-3 mb-3 rounded">
              <h1 className="text-[#0C3B80] text-lg font-bold mb-2">{selectedProject.title}</h1>
              
              {/* Description */}
              <div className="mb-3">
                <h2 className="text-[#0C3B80] text-sm font-bold mb-1">Description:</h2>
                <p className="text-xs text-[#333333]">{selectedProject.description}</p>
              </div>
              
              {/* Tech stack */}
              <div className="mb-3">
                <h2 className="text-[#0C3B80] text-sm font-bold mb-1">Technologies Used:</h2>
                <div className="flex flex-wrap gap-1">
                  {selectedProject.techStack.map((tech, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-[#E3EFF9] text-[#0C3B80] border-[1px] border-[#B9CCE5] rounded-sm text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Links */}
              <div className="flex gap-2">
                {selectedProject.githubUrl && (
                  <a 
                    href={selectedProject.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-gradient-to-b from-[#F0F6FB] to-[#C6D8F0] text-[#0C3B80] border-[1px] border-[#7E9BC5] rounded-sm text-xs hover:from-[#E3EFF9] hover:to-[#B4CDED]"
                  >
                    <Github size={12} />
                    View Source
                  </a>
                )}
                
                {selectedProject.liveUrl && (
                  <a 
                    href={selectedProject.liveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 bg-gradient-to-b from-[#F0F6FB] to-[#C6D8F0] text-[#0C3B80] border-[1px] border-[#7E9BC5] rounded-sm text-xs hover:from-[#E3EFF9] hover:to-[#B4CDED]"
                  >
                    <ExternalLink size={12} />
                    Open Demo
                  </a>
                )}
              </div>
            </div>
            
            {/* Windows 7 file properties section */}
            <div className="bg-[#F7FBFF] border-[1px] border-[#D9E3F1] p-3 rounded">
              <h2 className="text-[#0C3B80] text-sm font-bold mb-1">File Properties</h2>
              <div className="text-xs text-[#333333]">
                <div className="flex">
                  <span className="w-24">File name:</span>
                  <span>{selectedProject.title}.project</span>
                </div>
                <div className="flex">
                  <span className="w-24">File type:</span>
                  <span>Project File</span>
                </div>
                <div className="flex">
                  <span className="w-24">Location:</span>
                  <span>C:\Users\Animesh\Projects\</span>
                </div>
                <div className="flex">
                  <span className="w-24">Size:</span>
                  <span>{Math.floor(Math.random() * 500) + 100} KB</span>
                </div>
                <div className="flex">
                  <span className="w-24">Created:</span>
                  <span>March 1, 2025</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Windows 7 status bar */}
      <div className="flex justify-between items-center bg-[#F0F6FC] border-t-[1px] border-[#B9CCE5] px-2 py-1 text-xs text-[#0C3B80]">
        <div>6 projects</div>
      </div>
    </div>
  );
}

export default Portfolio;