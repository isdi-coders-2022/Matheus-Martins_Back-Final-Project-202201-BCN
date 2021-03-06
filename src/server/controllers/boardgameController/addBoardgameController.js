const debug = require("debug")("boardgame:boardgame");
const chalk = require("chalk");
const User = require("../../../database/models/User");

const addBoardgame = async (req, res, next) => {
  const { gameId } = req.params;
  const { idUser } = req.params;
  try {
    const userData = await User.findById(idUser);
    userData.boardgames.push(gameId);
    await userData.save();
    res.status(200).json({ userData });
  } catch (error) {
    debug(chalk.red(`Error: `, error.message));
    error.status = 404;
    next(error);
  }
};

module.exports = addBoardgame;
