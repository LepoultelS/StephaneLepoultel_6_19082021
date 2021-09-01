module.exports = {
  isGoodPassword: function (input) {
    // Au moins 6 caractères, au moins un nombre, une minuscule, une majuscule
    var regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    return regex.test(input);
  },
};
