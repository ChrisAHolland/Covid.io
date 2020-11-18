export function createScore(game) {
  game.doctorScoreText = game.add.text(16, 16, "", {
    fontSize: "32px",
    fill: "#1CDCFE"
  });
  game.virusScoreText = game.add.text(584, 16, "", {
    fontSize: "32px",
    fill: "#06EE45"
  });

  game.socket.on("scoreUpdate", function(scores) {
    game.doctorScoreText.setText("Immunized: " + scores.doctor);
    game.virusScoreText.setText("Infected: " + scores.virus);
  });
}
