const {
  listUsers,
  createUser,
  updateStatus,
  getUserByName
} = require('../services/userService');

async function index(req, res, next) {
  try {
    const users = await listUsers({
      status: req.query.status,
      type: req.query.type
    });
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const user = await getUserByName(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function setStatus(req, res, next) {
  try {
    const updated = await updateStatus(req.params.username, req.body.status);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  show,
  store,
  setStatus
};
