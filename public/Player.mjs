class Player {
  constructor({x, y, score = 0, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }
  movePlayer(dir, speed) {}
  collision(item) { return false; }
  calculateRank(arr) { return `Rank: 1 / ${arr.length}`; }
}
export default Player;
