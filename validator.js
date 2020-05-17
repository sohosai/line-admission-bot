function validateEmail(email) {
  return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email
  );
}

function validateStudentNumber(number) {
  return /^20\d{7}$/.test(number);
}

module.exports = {
  validateEmail,
  validateStudentNumber,
};
