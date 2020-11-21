export function createScore(game) {
  game.doctorScoreText = game.add.text(800, 15, "", {
    fontSize: "32px",
    fill: "#1CDCFE"
  });
  game.virusScoreText = game.add.text(550, 15, "", {
    fontSize: "32px",
    fill: "#06EE45"
  });
  game.timerText = game.add.text(1430, 15, "", {
    fontSize: "32px",
    fill: "#FFFFFF"
  });
  game.roundsWonHeaderText = game.add.text(5, 15, "Rounds won:", {
    fontSize: "32px",
    fill: "#FFFFFF"
  });
  game.roundsWonDoctorText = game.add.text(5, 75, "", {
    fontSize: "32px",
    fill: "#1CDCFE"
  });
  game.roundsWonVirusText = game.add.text(5, 45, "", {
    fontSize: "32px",
    fill: "#06EE45"
  });

  game.socket.on("roundUpdate", function(rounds) {
    game.roundsWonDoctorText.setText("Doctors: " + rounds.doctor);
    game.roundsWonVirusText.setText("Virus: " + rounds.virus);
  });
  game.socket.on("clockUpdate", function(countdown) {
    game.timerText.setText("Time: " + countdown);
  });
  game.socket.on("scoreUpdate", function(scores) {
    game.doctorScoreText.setText("Immunized: " + scores.doctor);
    game.virusScoreText.setText("Infected: " + scores.virus);
  });
}
