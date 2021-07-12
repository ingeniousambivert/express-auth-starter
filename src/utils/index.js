const getIncrementDate = (increment) => {
  return new Date(new Date().setHours(new Date().getHours() + increment));
};

module.exports = { getIncrementDate };
