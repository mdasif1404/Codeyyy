
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "CREATE OR JOIN",
      description: "Create a private room and share its code with friends, or join an existing room."
    },
    {
      number: "02",
      title: "PICK YOUR OPPONENT",
      description: "Challenge your friends or play against a bot when nobody is available."
    },
    {
      number: "03",
      title: "SOLVE THE CHALLENGE",
      description: "Get the same coding problem and race to write a correct solution."
    },
    {
      number: "04",
      title: "WIN THE BATTLE",
      description: "Earn points, improve your skills and climb the leaderboard."
    }
  ];

  return (
    <>
      <Navbar />

      <main className="info-page">
        <span className="eyebrow">THE RULES OF THE ARENA</span>
        <h1>HOW THE BATTLE WORKS.</h1>
        <p>Four steps. One challenge. One winner.</p>

        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-card" key={step.number}>
              <span>{step.number}</span>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default HowItWorks;
