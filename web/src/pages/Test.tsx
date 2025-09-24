import '../styles/test.css';
import '../styles/cards/ProjectCard.css';
import '../styles/cards/JobCard.css';
import type { Mode } from "../components/cards/subcomponents/Fields.types";

import ProjectCard from '../components/cards/ProjectCard';
import { useState } from 'react';
import JobCard from '../components/cards/JobCard';




function Test() {

  const description2 = "another simple card component that displays an image, title, and description.";

  const [mode, setMode] = useState<Mode>("view");
  const toggleMode = () => setMode((m) => (m === "view" ? "edit" : "view"));

  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    "https://i.pinimg.com/1200x/ea/c2/b7/eac2b7844ad390cd510dc94bb4e7a7ab.jpg"
  ];

  const [job1, setJob1] = useState({
    title: "Software Engineer",
    company: "Tech Corp",
    description: "Developed and maintained web applications using React and Node.js.",
    dateStart: { month: 1, year: 2020 },
    dateEnd: { month: 12, year: 2022 },
  });

  

  const [card2, setCard2] = useState({
    title: "Project 2",
    description: description2,
    techTitle: "Tech Stack",
  technologies: ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
    images: images,
  });

     

  return (
    <div className="test-layout">
      <header className="test-header">
        <h1>Projects</h1>
        <button className="mode-toggle" onClick={toggleMode} aria-pressed={mode === "edit"}>
          {mode === "view" ? "View" : "Edit"}
        </button>
      </header>

      <main className="test-main">
        <aside className="saved-state">
          <h2>Saved data</h2>
          <pre>{JSON.stringify({ job1, card2 }, null, 2)}</pre>
        </aside>
        <div className="wrapper">

          <JobCard
            mode={mode}
            title={job1.title}
            company={job1.company}
            description={job1.description}
            dateStart={job1.dateStart}
            dateEnd={job1.dateEnd}
            onPatch={(p) => setJob1((s) => ({ ...s, ...p }))}
          />

          {/* <ProjectCard
            mode={mode}
            images={card1.images}
            title={card1.title}
            description={card1.description}
            technologies={card1.technologies}
            onPatch={(p) => setCard1((s) => ({ ...s, ...p }))}
          /> */}
          <ProjectCard
            mode={mode}
            images={card2.images}
            title={card2.title}
            techTitle={card2.techTitle}
            description={card2.description}
            technologies={card2.technologies}
            onPatch={(p) => setCard2((s) => ({ ...s, ...p }))}
          />
        </div>

      </main>
    </div>
  );
}

export default Test;
