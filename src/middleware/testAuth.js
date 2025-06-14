module.exports = (req, res, next) => {
  req.user = {
    user_id: 1, 
    rol: 'Docente',
    email: 'docente@demo.com'
  };
  next();
};

// simulacion usuario autenticado 
