module.exports = (req, res, next) => {
  req.user = {
    user_id: 2, 
    rol: 'Estudiante',
    email: 'estudiante@demo.com'
  };
  next();
};