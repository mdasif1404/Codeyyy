
import React, { useState } from "react";

import GlobalArena from "./GlobalArena";
import GlobalArenaLobby from "./GlobalArenaLobby";

function GlobalArenaFlow() {
  const [showLobby, setShowLobby] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");

  const handleStartBattle = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowLobby(true);
  };

  if (showLobby) {
    return (
      <GlobalArenaLobby
        difficulty={selectedDifficulty}
      />
    );
  }

  return (
    <GlobalArena
      onStartBattle={handleStartBattle}
    />
  );
}

export default GlobalArenaFlow;
